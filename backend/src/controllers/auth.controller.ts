/**
 * auth.controller.ts — Handlers for the authentication routes.
 *
 * getMe      — Returns the current user's profile (id, name, email, avatarUrl).
 * logout     — Clears the auth cookie.
 * onGoogleCb — Called after Google OAuth succeeds; issues a JWT in an
 *              httpOnly cookie and redirects to the frontend dashboard.
 */

import { Request, Response } from "express";
import { prisma } from "../db/prisma";
import { issueJwt } from "../middleware/auth";
import { AUTH_COOKIE_NAME } from "../config/constants";
import { env } from "../config/env";

/** Cookie options for setting the auth cookie */
function setCookieOptions() {
  const isProduction = env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  };
}

/** Cookie options for clearing — omits maxAge to avoid Express deprecation */
function clearCookieOptions() {
  const isProduction = env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
  };
}

/**
 * GET /auth/me — returns the authenticated user's public profile.
 */
export async function getMe(req: Request, res: Response): Promise<void> {
  const userId = (req as any).userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, avatarUrl: true },
  });

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(user);
}

/**
 * POST /auth/logout — clears the session cookie.
 */
export function logout(_req: Request, res: Response): void {
  res.clearCookie(AUTH_COOKIE_NAME, clearCookieOptions());
  res.json({ ok: true });
}

/**
 * Called by the Google OAuth callback route after Passport authenticates.
 * Issues a JWT, sets it as an httpOnly cookie, and redirects to the frontend.
 */
export function onGoogleCallback(req: Request, res: Response): void {
  const user = req.user as { id: string };

  if (!user) {
    res.status(401).json({ error: "Authentication failed" });
    return;
  }

  const token = issueJwt(user);
  res.cookie(AUTH_COOKIE_NAME, token, setCookieOptions());
  res.redirect(`${env.FRONTEND_URL}/dashboard`);
}

/**
 * GET /auth/dev — Development bypass for instant local testing & demos.
 * Finds or creates the seeded dev user, sets the auth cookie, and redirects to dashboard.
 */
export async function devLogin(_req: Request, res: Response): Promise<void> {
  let user = await prisma.user.findFirst();

  if (!user) {
    user = await prisma.user.create({
      data: {
        googleId: "google-fake-id-001",
        name: "Tiffin Dev",
        email: "dev@tiffin.test",
      },
    });
  }

  const token = issueJwt(user);
  res.cookie(AUTH_COOKIE_NAME, token, setCookieOptions());
  res.redirect(`${env.FRONTEND_URL}/dashboard`);
}
