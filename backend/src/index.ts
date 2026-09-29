/**
 * index.ts — Entry point for the Express API server.
 * Sets up middleware, mounts routes, and starts listening.
 * This file does NOT contain any business logic.
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";

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

// ── Routes ───────────────────────────────────────────────
app.use(routes);

// ── Error handling (must be last) ────────────────────────
app.use(errorHandler);

// ── Start ────────────────────────────────────────────────
app.listen(env.PORT, () => {
  console.log(
    `[tiffin-backend] Server running on http://localhost:${env.PORT}`
  );
});

export default app;
