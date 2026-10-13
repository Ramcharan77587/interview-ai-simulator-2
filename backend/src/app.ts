import express from "express";
import cors from "cors";
import prisma from "./config/prisma";

import authRoutes from "./routes/auth.routes";
import interviewRoutes from "./routes/interview.routes";
import userRoutes from "./routes/user.routes";
import aiRoutes from "./routes/ai.routes";
import mlRoutes from "./routes/ml.routes";
import { authRateLimiter, aiRateLimiter } from "./middleware/rateLimiter";

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Rate limiters for spam and abuse protection
app.use("/api/auth", authRateLimiter, authRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/user", userRoutes);
app.use("/api/ai", aiRateLimiter, aiRoutes);
app.use("/api/ml", mlRoutes);

app.get("/", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      success: true,
      message: "InterviewAI Backend Connected",
      database: "Connected ✅",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

export default app;