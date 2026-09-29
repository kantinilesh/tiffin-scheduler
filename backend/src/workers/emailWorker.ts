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
 *   2. Load the full Email + Sender from the database.
 *   3. Send via Nodemailer using the sender's Ethereal credentials.
 *   4. Update status to 'sent' (with sentAt) or 'failed' (with failReason).
 */

import { Worker, Job } from "bullmq";
import { connection } from "../config/redis";
import { QUEUE_NAMES } from "../config/constants";
import { env } from "../config/env";
import { prisma } from "../db/prisma";
import { sendMail } from "../services/mailer";

interface EmailJobData {
  emailId: string;
}

const worker = new Worker<EmailJobData>(
  QUEUE_NAMES.EMAIL,
  async (job: Job<EmailJobData>) => {
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

    // Step 2: Load full email + sender
    const email = await prisma.email.findUniqueOrThrow({
      where: { id: emailId },
      include: { sender: true },
    });

    // Step 3 + 4: Send and update status
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
    concurrency: env.QUEUE_CONCURRENCY, // from env, never hardcoded
  }
);

worker.on("completed", (job) => {
  console.log(`[worker] Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[worker] Job ${job?.id} failed:`, err.message);
});

export default worker;
