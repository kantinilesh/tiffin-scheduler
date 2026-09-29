/**
 * reconcile.ts — Startup reconciliation for scheduled emails.
 *
 * Called once at boot time by both the API server and the worker process.
 * Scans Postgres for Email rows with status='scheduled' and ensures each
 * one has a corresponding job in the BullMQ queue.
 *
 * WHY THIS IS SAFE — three independent layers work together:
 *
 *   1. Redis AOF persistence (`--appendonly yes` in docker-compose.yml)
 *      The BullMQ queue itself survives a Redis crash or restart because
 *      every write is appended to disk before being acknowledged. So in
 *      the normal case, delayed jobs are already sitting in Redis and
 *      reconciliation has nothing new to add.
 *
 *   2. Deterministic jobId (`email-<uuid>`)
 *      BullMQ silently ignores an `add()` call when a job with the same
 *      jobId already exists in the queue. This means reconciliation can
 *      run on every single boot — even simultaneously on multiple
 *      processes — without ever creating duplicate jobs. The worst that
 *      happens is a harmless no-op.
 *
 *   3. The Postgres claim step in emailWorker.ts
 *      Even in the unlikely edge case where a job IS both still in Redis
 *      AND gets re-added by reconciliation (e.g. split-brain timing),
 *      the atomic UPDATE...WHERE status='scheduled' in the worker means
 *      only one execution can ever flip a row from 'scheduled' to
 *      'processing'. The second execution sees count=0 and skips. So
 *      the email sends exactly once no matter what.
 *
 * Together: Redis AOF prevents job loss, deterministic jobIds prevent
 * duplicate jobs, and the Postgres claim prevents duplicate sends.
 * Belt, suspenders, and a parachute.
 */

import { prisma } from "../db/prisma";
import { emailQueue } from "../queues/emailQueue";

export async function reconcileScheduledEmails(): Promise<void> {
  const pending = await prisma.email.findMany({
    where: { status: "scheduled" },
  });

  for (const email of pending) {
    await emailQueue.add(
      "send-email",
      { emailId: email.id },
      {
        jobId: `email-${email.id}`,
        delay: Math.max(0, email.scheduledAt.getTime() - Date.now()),
        removeOnComplete: 1000,
        removeOnFail: false,
      }
    );
  }

  console.log(
    `[reconcile] Reconciled ${pending.length} scheduled email(s) into the queue.`
  );
}
