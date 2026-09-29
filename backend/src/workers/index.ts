/**
 * workers/index.ts — Entry point for the BullMQ worker process.
 * Runs separately from the API server (via `npm run worker`).
 * Workers will be registered here as we add queue consumers.
 */

import { env } from "../config/env";

console.log(
  `[tiffin-worker] Worker process started (env: ${env.NODE_ENV})`
);

// Workers will be imported and started here in future phases.
// For now this file just confirms the worker process can boot.
