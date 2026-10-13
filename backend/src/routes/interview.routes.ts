import { Router } from "express";

import {
  createInterview,
  getInterviews,
  getInterviewById,
  updateInterview,
  addInterviewResponse,
} from "../controllers/interview.controller";

import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/",
  authenticateToken,
  createInterview
);

router.get(
  "/",
  authenticateToken,
  getInterviews
);

router.get(
  "/:id",
  authenticateToken,
  getInterviewById
);

router.patch(
  "/:id",
  authenticateToken,
  updateInterview
);

router.post(
  "/:id/responses",
  authenticateToken,
  addInterviewResponse
);

export default router;