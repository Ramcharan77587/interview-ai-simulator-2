import { Response } from "express";
import prisma from "../config/prisma";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

export async function updateProfile(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const {
      firstName,
      lastName,
      email,
      organization,
      techStack,
    } = req.body;

    if (!firstName || !lastName || !email || !organization) {
      return res.status(400).json({
        success: false,
        message:
          "First name, last name and organization are required",
      });
    }

    const name = `${firstName} ${lastName}`.trim();

    const user = await prisma.user.update({
      where: {
        id: req.user!.userId,
      },
      data: {
        name,
        organization,
        techStack,
      },
      select: {
        id: true,
        name: true,
        email: true,
        organization: true,
        techStack: true,
        createdAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error updating profile:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update profile",
    });
  }
}