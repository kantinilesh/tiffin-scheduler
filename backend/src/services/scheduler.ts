/**
 * scheduler.ts — Core scheduling logic for email campaigns.
 *
 * scheduleCampaign():
 *   1. Creates a Campaign row.
 *   2. In a Prisma transaction, creates one Email row per recipient with
 *      scheduledAt staggered by delaySeconds and senderId assigned round-robin.
 *   3. After the transaction commits, enqueues each Email as a BullMQ job
 *      with a deterministic jobId (`email-${email.id}`) for idempotency.
 *
 * The deterministic jobId means re-adding the same email is a no-op in
 * BullMQ — this is the restart-safety mechanism.
 */

import { prisma } from "../db/prisma";
import { emailQueue } from "../queues/emailQueue";

interface ScheduleInput {
  userId: string;
  subject: string;
  body: string;
  recipients: string[];
  startTime: Date;
  delaySeconds: number;
  hourlyLimit: number;
}

export async function scheduleCampaign(input: ScheduleInput) {
  const {
    userId,
    subject,
    body,
    recipients,
    startTime,
    delaySeconds,
    hourlyLimit,
  } = input;

  // Fetch the user's senders for round-robin assignment
  const senders = await prisma.sender.findMany({
    where: { userId },
    orderBy: { label: "asc" },
  });

  if (senders.length === 0) {
    throw Object.assign(new Error("No senders configured for this user"), {
      statusCode: 400,
    });
  }

  // Step 1 + 2: Create Campaign + Email rows in a single transaction
  const campaign = await prisma.campaign.create({
    data: {
      userId,
      subject,
      body,
      startTime,
      delaySeconds,
      hourlyLimit,
    },
  });

  const emails = await prisma.$transaction(
    recipients.map((recipient, index) => {
      const scheduledAt = new Date(
        startTime.getTime() + index * delaySeconds * 1000
      );
      const sender = senders[index % senders.length];

      return prisma.email.create({
        data: {
          campaignId: campaign.id,
          senderId: sender.id,
          recipient,
          subject,
          body,
          scheduledAt,
        },
      });
    })
  );

  // Step 3: Enqueue each email as a delayed BullMQ job
  // This happens AFTER the transaction commits so we never enqueue
  // emails that don't exist in the database.
  for (const email of emails) {
    const delay = Math.max(0, email.scheduledAt.getTime() - Date.now());

    await emailQueue.add(
      "send-email",
      { emailId: email.id },
      {
        jobId: `email-${email.id}`, // deterministic = idempotency key
        delay,
        removeOnComplete: 1000, // keep last 1000 completed for inspection
        removeOnFail: false, // keep failures visible for debugging
      }
    );
  }

  return { campaignId: campaign.id, emailCount: emails.length };
}
