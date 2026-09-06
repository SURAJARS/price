import { Request } from "express";

// User roles
export enum UserRole {
  OWNER = "admin",
  STAFF = "staff",
}

// User document interface
export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Product document interface
export interface IProduct {
  _id?: string;
  englishName: string;
  tamilName?: string;
  category: string; // Category ID
  subcategory?: string; // Subcategory ID
  sku?: string;
  brand?: string;
  description?: string;
  image?: string; // Cloudinary URL
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Product variant interface
export interface IProductVariant {
  _id?: string;
  productId: string;
  packSize: number;
  unit: string; // KG, L, PIECE, etc.
  purchaseCost: number;
  b2bPrice: number;
  b2cPrice: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Price history interface
export interface IPriceHistory {
  _id?: string;
  productVariantId: string;
  purchaseCost: number;
  b2bPrice: number;
  b2cPrice: number;
  changedBy: string; // User ID
  changedAt: Date;
}

// Category interface
export interface ICategory {
  _id?: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Subcategory interface
export interface ISubcategory {
  _id?: string;
  categoryId: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Auth request with user
export interface AuthRequest extends Request {
  user?: IUser;
  userId?: string;
}

// API Response interface
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
