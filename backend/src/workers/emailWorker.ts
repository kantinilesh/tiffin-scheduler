/**
 * emailWorker.ts — BullMQ worker that processes the "email-queue".
 *
 * The updateMany claim is an atomic compare-and-swap at the database level:
 * only one process can flip a row from 'scheduled' to 'processing'. This is
 * what makes duplicate delivery safe — BullMQ guarantees at-least-once
 * delivery, not exactly-once, so this claim step is what turns "at least
 * once" into "effectively exactly once".
 *
 * Flow for each job:
 *   1. Claim: UPDATE Email SET status='processing' WHERE id=X AND status='scheduled'
 *      - If count=0, another worker already handled it → skip.
 *   2. Load the full Email + Sender + Campaign from the database.
 *   3. Rate limit check: Atomic Redis Lua script checks per-sender hourly limit.
 *      - If cap reached: revert DB status to 'scheduled', reschedule into the
 *        next hour boundary using job.moveToDelayed(next, token), and throw DelayedError.
 *   4. Send via Nodemailer using the sender's Ethereal credentials.
 *   5. Update status to 'sent' (with sentAt) or 'failed' (with failReason).
 */

import { Worker, Job, DelayedError } from "bullmq";
import { connection } from "../config/redis";
import { QUEUE_NAMES } from "../config/constants";
import { prisma } from "../db/prisma";
import { sendMail } from "../services/mailer";
import { tryConsumeHourlySlot, nextHourBoundary } from "../services/rateLimiter";

export interface EmailJobData {
  emailId: string;
  sequenceIndex?: number;
}

const worker = new Worker<EmailJobData>(
  QUEUE_NAMES.EMAIL,
  async (job: Job<EmailJobData>, token?: string) => {
    const { emailId } = job.data;

    // Step 1: Claim — atomic compare-and-swap
    const claimed = await prisma.email.updateMany({
      where: { id: emailId, status: "scheduled" },
      data: { status: "processing" },
    });

    if (claimed.count === 0) {
      // Already handled (duplicate delivery, or restart re-added a job
      // for an email that already sent/failed)
      console.log(`[worker] Email ${emailId} already claimed, skipping`);
      return;
    }

    // Step 2: Load full email + sender + campaign
    const email = await prisma.email.findUniqueOrThrow({
      where: { id: emailId },
      include: { sender: true, campaign: true },
    });

    // Step 3: Hourly rate limit check (per-sender atomic Lua script)
    const allowed = await tryConsumeHourlySlot(
      email.senderId,
      email.campaign.hourlyLimit
    );
    if (!allowed) {
      console.log(
        `[worker] ⏸ Rate limit hit for sender ${email.senderId} (hourly cap: ${email.campaign.hourlyLimit}). Rescheduling email ${emailId} to next hour.`
      );
      // Give the row back to 'scheduled' so it isn't stuck as 'processing'
      await prisma.email.update({
        where: { id: emailId },
        data: { status: "scheduled" },
      });
      const next = nextHourBoundary();
      next.setSeconds(next.getSeconds() + (job.data.sequenceIndex ?? 0) * 5); // preserve rough order
      await job.moveToDelayed(next.getTime(), token);
      throw new DelayedError(); // tells BullMQ "this job isn't done, don't mark it failed"
    }

    // Step 4 + 5: Send and update status
    try {
      await sendMail(email.sender, email.recipient, email.subject, email.body);

      await prisma.email.update({
        where: { id: emailId },
        data: {
          status: "sent",
          sentAt: new Date(),
          attempts: { increment: 1 },
        },
      });

      console.log(`[worker] ✅ Sent email ${emailId} to ${email.recipient}`);
    } catch (err) {
      await prisma.email.update({
        where: { id: emailId },
        data: {
          status: "failed",
          failReason: String(err),
          attempts: { increment: 1 },
        },
      });

      console.error(
        `[worker] ❌ Failed email ${emailId}: ${String(err)}`
      );
    }
  },
  {
    connection,
    concurrency: Number(process.env.WORKER_CONCURRENCY),
    limiter: {
      max: 1,
      duration: Number(process.env.MIN_DELAY_MS),
    },
  }
);

worker.on("completed", (job) => {
  console.log(`[worker] Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[worker] Job ${job?.id} failed:`, err.message);
});

export default worker;
