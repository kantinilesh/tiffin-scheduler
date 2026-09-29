/**
 * health.ts — Route definition for the health-check endpoint.
 * Thin layer: just maps GET /health to the controller function.
 */

import { Router } from "express";
import { healthCheck } from "../controllers/health.controller";

const router = Router();

router.get("/health", healthCheck);

export default router;
