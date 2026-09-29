/**
 * errorHandler.ts — Express error-handling middleware.
 * Catches any error thrown in a route handler and returns a
 * consistent JSON error response instead of leaking stack traces.
 */

import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error("[Error]", err.message);

  const statusCode = (err as any).statusCode || 500;

  res.status(statusCode).json({
    error: err.message || "Internal Server Error",
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
