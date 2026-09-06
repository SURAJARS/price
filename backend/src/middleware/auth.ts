import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../types";
import { AppError } from "./errorHandler";
import { User } from "../models/User";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token =
      req.headers.authorization?.split(" ")[1] ||
      (req.cookies as any)?.token;

    if (!token) {
      throw new AppError(401, "No authentication token provided");
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as { userId: string };

    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      throw new AppError(401, "User not found or inactive");
    }

    (req as AuthRequest).user = user as any;
    (req as AuthRequest).userId = user._id?.toString();

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError(401, "Invalid token");
    }
    next(error);
  }
};

export const ownerOnly = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authReq = req as AuthRequest;
  if (authReq.user?.role !== "admin") {
    throw new AppError(403, "Only owner/admin can access this resource");
  }
  next();
};

export const staffOnly = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authReq = req as AuthRequest;
  if (authReq.user?.role !== "staff") {
    throw new AppError(403, "Only staff can access this resource");
  }
  next();
};
