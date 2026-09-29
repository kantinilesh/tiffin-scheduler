/**
 * emailQueue.ts — BullMQ queue definition for outbound emails.
 *
 * Jobs are added with a deterministic jobId (`email-${emailId}`) so
 * adding the same email twice is a no-op — BullMQ silently ignores
 * duplicate jobIds. This is how we get restart-safe idempotency.
 */

import { Queue } from "bullmq";
import { connection } from "../config/redis";
import { QUEUE_NAMES } from "../config/constants";

export const emailQueue = new Queue(QUEUE_NAMES.EMAIL, { connection });
