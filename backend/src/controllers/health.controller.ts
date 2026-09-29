/**
 * health.controller.ts — Handler for the GET /health endpoint.
 * Returns a simple JSON object so we can verify the server is alive.
 */

import { Request, Response } from "express";

export const healthCheck = (_req: Request, res: Response): void => {
  res.json({ status: "ok" });
};
