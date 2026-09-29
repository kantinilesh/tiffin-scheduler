/**
 * routes/index.ts — Central route aggregator.
 * Imports every route module and mounts them on the Express app.
 * As we add features, each gets its own file and one line here.
 */

import { Router } from "express";
import healthRouter from "./health";

const router = Router();

router.use(healthRouter);

export default router;
