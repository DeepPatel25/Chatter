import type { NextFunction, Request, Response } from "express";
import type { AuthRequest } from "../middleware/auth";
import User from "../models/User";
import { clerkClient, getAuth } from "@clerk/express";

// TODO: add the next later
export async function getMe(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId;
    const user = await User.findById({ _id: userId });

    if (!user) return res.status(404).json({ message: "User not found." });
    return res.json({ user });
  } catch (error) {
    res.status(500);
    next(error);
  }
}

export async function authCallback(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { userId: clerkId } = getAuth(req);

    if (!clerkId) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    let user = await User.findOne({ clerkId });

    if (!user) {
      // Get user info from Clerk
      const clerkUser = await clerkClient.users.getUser(clerkId);

      user = await User.create({
        clerkId,
        name: clerkUser.firstName
          ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim()
          : clerkUser.emailAddresses[0]?.emailAddress.split("@")[0] ||
            "Unnamed User",
        email: clerkUser.emailAddresses[0]?.emailAddress,
        avatar: clerkUser.imageUrl,
      });
    }

    return res.json({ user });
  } catch (error) {
    res.status(500);
    next(error);
  }
}
