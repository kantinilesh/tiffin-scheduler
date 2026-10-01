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
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { emailQueue } from "./queues/emailQueue";
import { requireAuth } from "./middleware/auth";

const app = express();

// ── Security & parsing ───────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// ── Bull Board UI (Admin) ────────────────────────────────
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");
createBullBoard({
  queues: [new BullMQAdapter(emailQueue)],
  serverAdapter,
});
app.use("/admin/queues", requireAuth, serverAdapter.getRouter());

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
