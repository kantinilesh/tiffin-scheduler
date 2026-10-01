/**
 * index.ts — Entry point for the Express API server.
 * Sets up middleware, mounts routes, reconciles any pending emails
 * into the BullMQ queue, and starts listening.
 * This file does NOT contain any business logic.
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import passport from "./config/passport";
import { env } from "./config/env";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { reconcileScheduledEmails } from "./services/reconcile";
import { ensureSearchIndex } from "./services/search";

const app = express();

// ── Security & parsing ───────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// ── Routes ───────────────────────────────────────────────
app.use(routes);

// ── Error handling (must be last) ────────────────────────
app.use(errorHandler);

// ── Search Index + Reconcile + Start ─────────────────────
(async () => {
  await ensureSearchIndex();
  await reconcileScheduledEmails();

  app.listen(env.PORT, () => {
    console.log(
      `[tiffin-backend] Server running on http://localhost:${env.PORT}`
    );
  });
})();

export default app;
