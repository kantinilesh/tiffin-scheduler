/**
 * workers/index.ts — Entry point for the BullMQ worker process.
 *
 * Runs separately from the API server (via `npm run worker`).
 * On boot, reconciles any scheduled emails back into the queue
 * (safe due to deterministic jobIds), then imports all worker
 * modules so they register with BullMQ.
 */

import { env } from "../config/env";
import { reconcileScheduledEmails } from "../services/reconcile";
import { ensureSearchIndex } from "../services/search";

// Import workers — each one self-registers on import
import "./emailWorker";

(async () => {
  await ensureSearchIndex();
  await reconcileScheduledEmails();

  console.log(
    `[tiffin-worker] Worker process started (env: ${env.NODE_ENV}, concurrency: ${env.QUEUE_CONCURRENCY})`
  );
})();
