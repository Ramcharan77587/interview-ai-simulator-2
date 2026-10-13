import { Response } from "express";
import prisma from "../config/prisma";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

export async function createInterview(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { title, company, role, difficulty } = req.body;

    if (!title || !difficulty) {
      return res.status(400).json({
        success: false,
        message: "Title and difficulty are required",
      });
    }

    const interview = await prisma.interviewSession.create({
      data: {
        title,
        company: company || null,
        role: role || null,
        difficulty,
        userId: req.user!.userId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Interview created successfully",
      interview,
    });
  } catch (error) {
    console.error("Error creating interview:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create interview",
    });
  }
}

export async function getInterviews(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const interviews = await prisma.interviewSession.findMany({
      where: {
        userId: req.user!.userId,
      },
      include: {
        responses: true,
      },
      orderBy: {
        startedAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      interviews,
    });
  } catch (error) {
    console.error("Error fetching interviews:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch interviews",
    });
  }
}

export async function getInterviewById(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid interview ID",
      });
    }

    const interview = await prisma.interviewSession.findFirst({
      where: {
        id,
        userId: req.user!.userId,
      },
      include: {
        responses: true,
      },
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    return res.status(200).json({
      success: true,
      interview,
    });
  } catch (error) {
    console.error("Error fetching interview:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch interview",
    });
  }
}

export async function updateInterview(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { id } = req.params;
    const { status, endedAt, overallScore } = req.body;

    if (!id || typeof id !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid interview ID",
      });
    }

    const existing = await prisma.interviewSession.findFirst({
      where: {
        id,
        userId: req.user!.userId,
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    const updated = await prisma.interviewSession.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(endedAt ? { endedAt: new Date(endedAt) } : {}),
        ...(typeof overallScore === "number" ? { overallScore } : {}),
      },
      include: {
        responses: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Interview updated successfully",
      interview: updated,
    });
  } catch (error) {
    console.error("Error updating interview:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update interview",
    });
  }
}

export async function addInterviewResponse(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { id } = req.params;
    const {
      question,
      answer,
      technicalScore,
      communicationScore,
      confidenceScore,
      feedback,
    } = req.body;

    if (!id || typeof id !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid interview ID",
      });
    }

    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: "Question and answer are required",
      });
    }

    const existing = await prisma.interviewSession.findFirst({
      where: {
        id,
        userId: req.user!.userId,
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Interview session not found",
      });
    }

    const responseRecord = await prisma.interviewResponse.create({
      data: {
        sessionId: id,
        question,
        answer,
        technicalScore: typeof technicalScore === "number" ? technicalScore : null,
        communicationScore:
          typeof communicationScore === "number" ? communicationScore : null,
        confidenceScore:
          typeof confidenceScore === "number" ? confidenceScore : null,
        feedback: feedback || null,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Response saved successfully",
      response: responseRecord,
    });
  } catch (error) {
    console.error("Error saving interview response:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to save interview response",
    });
  }
}