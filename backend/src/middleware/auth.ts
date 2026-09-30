/**
 * auth.ts — Authentication middleware and JWT helpers.
 *
 * issueJwt(user)  — Signs a JWT with the user's id as the `sub` claim.
 * requireAuth     — Express middleware that reads the JWT from the
 *                   httpOnly cookie "tiffin_session", verifies it, and
 *                   attaches req.userId. Returns 401 if missing/invalid.
 */

import { Request, Response, NextFunction } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { AUTH_COOKIE_NAME } from "../config/constants";

interface JwtPayload {
  sub: string;
  iat: number;
  exp: number;
}

/**
 * Signs a JWT containing { sub: user.id } with a 7-day expiry.
 */
export function issueJwt(user: { id: string }): string {
  return jwt.sign({ sub: user.id }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  });
}

/**
 * Express middleware: verifies the JWT from the httpOnly cookie.
 * On success, sets req.userId. On failure, responds with 401.
 */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const token = req.cookies?.[AUTH_COOKIE_NAME];

  if (!token) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    (req as any).userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
