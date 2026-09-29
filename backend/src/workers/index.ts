/**
 * workers/index.ts — Entry point for the BullMQ worker process.
 *
 * Runs separately from the API server (via `npm run worker`).
 * Imports all worker modules so they register with BullMQ.
 * Each worker file creates its own Worker instance on import.
 */

import { env } from "../config/env";

// Import workers — each one self-registers on import
import "./emailWorker";

console.log(
  `[tiffin-worker] Worker process started (env: ${env.NODE_ENV}, concurrency: ${env.QUEUE_CONCURRENCY})`
);
