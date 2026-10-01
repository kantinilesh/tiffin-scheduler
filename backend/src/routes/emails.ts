/**
 * emails.ts — Route definitions for email scheduling and listing.
 *
 * POST /emails/schedule   — Schedule a new campaign (requireAuth).
 * GET  /emails/search     — Search emails via Elasticsearch (requireAuth).
 * GET  /emails/scheduled  — List pending emails (requireAuth).
 * GET  /emails/sent       — List sent emails (requireAuth).
 */

import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
  scheduleEmails,
  getScheduled,
  getSent,
  searchEmails,
} from "../controllers/emails.controller";

const router = Router();

router.post("/emails/schedule", requireAuth, scheduleEmails);
router.get("/emails/search", requireAuth, searchEmails);
router.get("/emails/scheduled", requireAuth, getScheduled);
router.get("/emails/sent", requireAuth, getSent);

export default router;
