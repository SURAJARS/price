import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types/index.js";

export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = "AppError";
  }
}

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode =
    error instanceof AppError ? error.statusCode : 500;
  const message =
    error instanceof AppError
      ? error.message
      : "Internal server error";

  const response: ApiResponse = {
    success: false,
    message,
    error: error.message,
  };

  console.error(`[ERROR] ${statusCode}: ${message}`, error);

  res.status(statusCode).json(response);
};

// Async wrapper to handle promise rejections
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
