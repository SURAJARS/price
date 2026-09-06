import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcryptjs.genSalt(10);
  return bcryptjs.hash(password, salt);
};

// Compare password
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcryptjs.compare(password, hashedPassword);
};

// Generate JWT token
export const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || "your-secret-key";
  return jwt.sign(
    { userId },
    secret,
    {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    } as any
  );
};

// Validate email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Format API response
export const successResponse = <T = any>(
  success: boolean,
  message: string,
  data?: T
) => {
  return {
    success,
    message,
    data,
  };
};
