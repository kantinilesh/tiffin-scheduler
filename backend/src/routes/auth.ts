/**
 * auth.ts — Auth route definitions.
 *
 * GET  /auth/google           — Redirects to Google consent screen.
 * GET  /auth/google/callback  — Google redirects here after consent;
 *                                issues JWT cookie, redirects to frontend.
 * GET  /auth/me               — Returns the logged-in user's profile.
 * POST /auth/logout           — Clears the auth cookie.
 */

import { Router } from "express";
import passport from "../config/passport";
import { requireAuth } from "../middleware/auth";
import {
  getMe,
  logout,
  onGoogleCallback,
  devLogin,
} from "../controllers/auth.controller";

const router = Router();

// Development instant login (bypasses Google OAuth for local testing/demos)
router.get("/auth/dev", devLogin);

// Redirect to Google consent screen
router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

// Google redirects here after the user consents
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/auth/google",
  }),
  onGoogleCallback
);

// Return current user profile (requires valid JWT)
router.get("/auth/me", requireAuth, getMe);

// Clear the auth cookie
router.post("/auth/logout", logout);

export default router;
