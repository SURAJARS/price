# Grocery Price Management System - Complete Codebase

## Project Overview

A full-stack mobile-first web application for offline grocery store staff to search and view product prices with real-time updates via Socket.IO.

**Tech Stack:**

- **Backend:** Node.js + Express + TypeScript + MongoDB + Mongoose + Socket.IO
- **Frontend:** Next.js 15 + React + TypeScript + Tailwind CSS + Zustand + Axios
- **Database:** MongoDB Atlas (cloud)
- **Real-time:** Socket.IO WebSockets
- **Auth:** JWT + Role-based access control (Owner/Staff)

---

## BACKEND CODE

### 1. src/index.ts - Main Server Entry Point

```typescript
import express, { Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { connectDB } from "./config/database";
import { initCloudinary } from "./config/cloudinary";
import { initSocket } from "./config/socket";
import { errorHandler, asyncHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";

// Load environment variables
dotenv.config();

const app: Express = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize services
const startServer = async () => {
  console.log("📡 Initializing services...");
  await connectDB();
  console.log("✓ Database initialized");

  const io = initSocket(httpServer);
  console.log("✓ Socket.IO initialized");

  // Health check route
  app.get("/health", (req, res) => {
    res.json({
      success: true,
      message: "Backend is running",
      timestamp: new Date(),
    });
  });

  // Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/products", productRoutes);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: "Route not found",
      path: req.path,
    });
  });

  // Error handling middleware
  app.use(errorHandler);

  // Start server
  httpServer.listen(PORT, () => {
    console.log(`\n🚀 Grocery Price Management Backend`);
    console.log(`✓ Server running on http://localhost:${PORT}`);
    console.log(`✓ API available at http://localhost:${PORT}/api`);
    console.log(`✓ Health check: http://localhost:${PORT}/health\n`);
  });

  // Graceful shutdown
  process.on("SIGINT", async () => {
    console.log("\n\nShutting down gracefully...");
    httpServer.close();
    process.exit(0);
  });
};

// Call the startup function
startServer().catch((error) => {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
});
```

### 2. src/types/index.ts - TypeScript Interfaces

```typescript
import { Request } from "express";

// User roles
export enum UserRole {
  OWNER = "owner",
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
```

### 3. src/config/database.ts - MongoDB Connection

```typescript
import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      console.log("⚠ MONGODB_URI not set. Running in demo mode.");
      return;
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✓ MongoDB connected successfully");
  } catch (error) {
    console.warn(
      "✗ MongoDB connection failed:",
      error instanceof Error ? error.message : error,
    );
    console.log("⚠ Continuing in demo mode without database");
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState > 0) {
      await mongoose.disconnect();
      console.log("✓ MongoDB disconnected");
    }
  } catch (error) {
    console.error("✗ MongoDB disconnection failed:", error);
  }
};
```

### 4. src/config/socket.ts - Socket.IO Setup

```typescript
import { Server } from "socket.io";
import http from "http";

let io: Server;

export const initSocket = (httpServer: http.Server): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`✓ Client connected: ${socket.id}`);

    // Join user to their room
    socket.on("join-user", (userId: string) => {
      socket.join(`user-${userId}`);
      console.log(`✓ User ${userId} joined room`);
    });

    socket.on("disconnect", () => {
      console.log(`✗ Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
};

export const notifyPriceUpdate = (
  variantId: string,
  prices: { b2bPrice: number; b2cPrice: number },
) => {
  getIO().emit("price-updated", {
    variantId,
    ...prices,
    updatedAt: new Date(),
  });
};

export const notifyNewProduct = (product: any) => {
  getIO().emit("product-added", product);
};
```

### 5. src/config/cloudinary.ts - Cloudinary Configuration

```typescript
import { v2 as cloudinary } from "cloudinary";

export const initCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log("✓ Cloudinary initialized");
};

export const uploadImage = async (
  filePath: string,
  folder: string = "grocery-prices",
) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "auto",
    });
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    throw error;
  }
};

export const deleteImage = async (publicId: string) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary delete failed:", error);
    throw error;
  }
};
```

### 6. src/middleware/auth.ts - Authentication Middleware

```typescript
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../types";
import { AppError } from "./errorHandler";
import { User } from "../models/User";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token =
      req.headers.authorization?.split(" ")[1] || (req.cookies as any)?.token;

    if (!token) {
      throw new AppError(401, "No authentication token provided");
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key",
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
  next: NextFunction,
): void => {
  const authReq = req as AuthRequest;
  if (authReq.user?.role !== "owner") {
    throw new AppError(403, "Only owner/admin can access this resource");
  }
  next();
};

export const staffOnly = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authReq = req as AuthRequest;
  if (authReq.user?.role !== "staff") {
    throw new AppError(403, "Only staff can access this resource");
  }
  next();
};
```

### 7. src/middleware/errorHandler.ts - Error Handling

```typescript
import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const asyncHandler =
  (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  console.error("Unexpected error:", error);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    ...(process.env.NODE_ENV === "development" && { error: error.message }),
  });
};
```

### 8. src/utils/helpers.ts - Helper Functions

```typescript
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcryptjs.genSalt(10);
  return bcryptjs.hash(password, salt);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bcryptjs.compare(password, hashedPassword);
};

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: "7d",
  });
};

export const successResponse = (
  success: boolean,
  message: string,
  data?: any,
) => {
  return {
    success,
    message,
    ...(data && { data }),
  };
};
```

### 9. src/models/User.ts - User Schema

```typescript
import mongoose, { Schema, Document, Types } from "mongoose";
import { UserRole } from "../types";

const userSchema = new Schema<any>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: [UserRole.OWNER, UserRole.STAFF],
      default: UserRole.STAFF,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export const User = mongoose.model("User", userSchema);
```

### 10. src/models/Product.ts - Product Schema

```typescript
import mongoose, { Schema, Document } from "mongoose";
import { IProduct } from "../types";

const productSchema = new Schema<any>(
  {
    englishName: {
      type: String,
      required: [true, "English name is required"],
      trim: true,
    },
    tamilName: {
      type: String,
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    subcategory: {
      type: Schema.Types.ObjectId,
      ref: "Subcategory",
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Text search index
productSchema.index({
  englishName: "text",
  tamilName: "text",
  sku: "text",
  brand: "text",
});

export const Product = mongoose.model("Product", productSchema);
```

### 11. src/models/ProductVariant.ts - ProductVariant Schema

```typescript
import mongoose, { Schema } from "mongoose";
import { IProductVariant } from "../types";

const variantSchema = new Schema<any>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID is required"],
    },
    packSize: {
      type: Number,
      required: [true, "Pack size is required"],
    },
    unit: {
      type: String,
      enum: ["KG", "L", "G", "ML", "PIECE", "DOZEN"],
      required: [true, "Unit is required"],
    },
    purchaseCost: {
      type: Number,
      required: [true, "Purchase cost is required"],
    },
    b2bPrice: {
      type: Number,
      required: [true, "B2B price is required"],
    },
    b2cPrice: {
      type: Number,
      required: [true, "B2C price is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

variantSchema.index({ productId: 1 });

export const ProductVariant = mongoose.model("ProductVariant", variantSchema);
```

### 12. src/models/Category.ts - Category Schema

```typescript
import mongoose, { Schema, Document } from "mongoose";
import { ICategory } from "../types";

const categorySchema = new Schema<any>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Category = mongoose.model("Category", categorySchema);
```

### 13. src/models/Subcategory.ts - Subcategory Schema

```typescript
import mongoose, { Schema } from "mongoose";
import { ISubcategory } from "../types";

const subcategorySchema = new Schema<any>(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category ID is required"],
    },
    name: {
      type: String,
      required: [true, "Subcategory name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Subcategory = mongoose.model("Subcategory", subcategorySchema);
```

### 14. src/models/PriceHistory.ts - PriceHistory Schema

```typescript
import mongoose, { Schema } from "mongoose";
import { IPriceHistory } from "../types";

const priceHistorySchema = new Schema<any>({
  productVariantId: {
    type: Schema.Types.ObjectId,
    ref: "ProductVariant",
    required: [true, "Product Variant ID is required"],
  },
  purchaseCost: {
    type: Number,
    required: [true, "Purchase cost is required"],
  },
  b2bPrice: {
    type: Number,
    required: [true, "B2B price is required"],
  },
  b2cPrice: {
    type: Number,
    required: [true, "B2C price is required"],
  },
  changedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Changed by user is required"],
  },
  changedAt: {
    type: Date,
    default: Date.now,
  },
});

priceHistorySchema.index({ productVariantId: 1, changedAt: -1 });

export const PriceHistory = mongoose.model("PriceHistory", priceHistorySchema);
```

### 15. src/routes/authRoutes.ts - Auth Routes

```typescript
import { Router } from "express";
import { register, login, getProfile } from "../controllers/authController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);

export default router;
```

### 16. src/routes/productRoutes.ts - Product Routes

```typescript
import { Router } from "express";
import {
  searchProducts,
  getProductDetails,
  updateVariantPrices,
  getPriceHistory,
} from "../controllers/productController";
import { authMiddleware, ownerOnly } from "../middleware/auth";

const router = Router();

router.get("/search", authMiddleware, searchProducts);
router.get("/:id", authMiddleware, getProductDetails);
router.patch("/:id/prices", authMiddleware, ownerOnly, updateVariantPrices);
router.get("/:id/price-history", authMiddleware, ownerOnly, getPriceHistory);

export default router;
```

### 17. src/controllers/authController.ts - Auth Controller

```typescript
import { Request, Response } from "express";
import { AuthRequest } from "../types";
import { AuthService } from "../services/authService";
import { successResponse } from "../utils/helpers";
import { asyncHandler } from "../middleware/errorHandler";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name, role } = req.body;

  const user = await AuthService.register(email, password, name, role);

  res
    .status(201)
    .json(successResponse(true, "User registered successfully", user));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await AuthService.login(email, password);

  res.json(successResponse(true, "Login successful", result));
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const user = await AuthService.getUserById(authReq.userId || "");

  res.json(successResponse(true, "Profile retrieved", user));
});
```

### 18. src/controllers/productController.ts - Product Controller

```typescript
import { Request, Response } from "express";
import { AuthRequest } from "../types";
import { ProductService } from "../services/productService";
import { successResponse } from "../utils/helpers";
import { asyncHandler } from "../middleware/errorHandler";

export const searchProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const { q, limit = 20 } = req.query;

    if (!q) {
      res.status(400).json(successResponse(false, "Search query required"));
      return;
    }

    const products = await ProductService.searchProducts(
      q as string,
      parseInt(limit as string),
    );

    res.json(
      successResponse(true, `Found ${products.length} product(s)`, products),
    );
  },
);

export const getProductDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const authReq = req as AuthRequest;
    const isAdmin = authReq.user?.role === "owner";

    const product = await ProductService.getProductDetails(id, isAdmin);

    res.json(successResponse(true, "Product details retrieved", product));
  },
);

export const updateVariantPrices = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { purchaseCost, b2bPrice, b2cPrice } = req.body;
    const authReq = req as AuthRequest;

    const variant = await ProductService.updateVariantPrices(
      id,
      authReq.userId || "",
      { purchaseCost, b2bPrice, b2cPrice },
    );

    res.json(successResponse(true, "Prices updated successfully", variant));
  },
);

export const getPriceHistory = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { limit = 20 } = req.query;

    const history = await ProductService.getPriceHistory(
      id,
      parseInt(limit as string),
    );

    res.json(successResponse(true, "Price history retrieved", history));
  },
);
```

### 19. src/services/authService.ts - Auth Service

```typescript
import { User } from "../models/User";
import { hashPassword, comparePassword, generateToken } from "../utils/helpers";
import { AppError } from "../middleware/errorHandler";
import { UserRole, IUser } from "../types";

export class AuthService {
  // Register user
  static async register(
    email: string,
    password: string,
    name: string,
    role: UserRole = UserRole.STAFF,
  ): Promise<any> {
    try {
      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new AppError(400, "User with this email already exists");
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const user = new User({
        email,
        password: hashedPassword,
        name,
        role,
      });

      await user.save();

      return {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    } catch (error) {
      throw error;
    }
  }

  // Login user
  static async login(email: string, password: string): Promise<any> {
    try {
      const user = await User.findOne({ email }).select("+password");

      if (!user) {
        throw new AppError(401, "Invalid email or password");
      }

      const isPasswordValid = await comparePassword(password, user.password);

      if (!isPasswordValid) {
        throw new AppError(401, "Invalid email or password");
      }

      if (!user.isActive) {
        throw new AppError(403, "User account is inactive");
      }

      const token = generateToken(user._id?.toString() || "");

      return {
        token,
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<any> {
    try {
      const user = await User.findById(userId).select("-password");

      if (!user) {
        throw new AppError(404, "User not found");
      }

      return user;
    } catch (error) {
      throw error;
    }
  }
}
```

### 20. src/services/productService.ts - Product Service

```typescript
import { Product } from "../models/Product";
import { ProductVariant } from "../models/ProductVariant";
import { PriceHistory } from "../models/PriceHistory";
import { AppError } from "../middleware/errorHandler";
import { notifyPriceUpdate } from "../config/socket";

export class ProductService {
  // Search products
  static async searchProducts(query: string, limit: number = 20) {
    try {
      const products = await Product.find(
        { $text: { $search: query } },
        { score: { $meta: "textScore" } },
      )
        .sort({ score: { $meta: "textScore" } })
        .limit(limit)
        .populate("category")
        .populate("subcategory");

      return products;
    } catch (error) {
      throw error;
    }
  }

  // Get product details with variants
  static async getProductDetails(
    productId: string,
    showPurchaseCost: boolean = false,
  ) {
    try {
      const product = await Product.findById(productId)
        .populate("category")
        .populate("subcategory");

      if (!product) {
        throw new AppError(404, "Product not found");
      }

      const variants = await ProductVariant.find({ productId });

      // Hide purchase cost from staff
      const processedVariants = variants.map((v: any) => {
        const obj = v.toObject();
        if (!showPurchaseCost) {
          delete obj.purchaseCost;
        }
        return obj;
      });

      return {
        ...product.toObject(),
        variants: processedVariants,
      };
    } catch (error) {
      throw error;
    }
  }

  // Update variant prices (admin only)
  static async updateVariantPrices(
    variantId: string,
    userId: string,
    {
      purchaseCost,
      b2bPrice,
      b2cPrice,
    }: {
      purchaseCost?: number;
      b2bPrice?: number;
      b2cPrice?: number;
    },
  ): Promise<any> {
    try {
      const variant = await ProductVariant.findById(variantId);

      if (!variant) {
        throw new AppError(404, "Variant not found");
      }

      // Record price history before update
      await PriceHistory.create({
        productVariantId: variantId,
        purchaseCost: purchaseCost || variant.purchaseCost,
        b2bPrice: b2bPrice || variant.b2bPrice,
        b2cPrice: b2cPrice || variant.b2cPrice,
        changedBy: userId,
      });

      // Update variant
      if (purchaseCost !== undefined) variant.purchaseCost = purchaseCost;
      if (b2bPrice !== undefined) variant.b2bPrice = b2bPrice;
      if (b2cPrice !== undefined) variant.b2cPrice = b2cPrice;

      await variant.save();

      // Notify all connected staff about price update
      notifyPriceUpdate(variantId, {
        b2bPrice: variant.b2bPrice,
        b2cPrice: variant.b2cPrice,
      });

      return variant;
    } catch (error) {
      throw error;
    }
  }

  // Get price history (admin only)
  static async getPriceHistory(
    productVariantId: string,
    limit: number = 20,
  ): Promise<any> {
    try {
      const history = await PriceHistory.find({ productVariantId })
        .sort({ changedAt: -1 })
        .limit(limit)
        .populate("changedBy", "name email");

      return history;
    } catch (error) {
      throw error;
    }
  }
}
```

### 21. package.json - Backend Dependencies

```json
{
  "name": "grocery-price-backend",
  "version": "1.0.0",
  "description": "Grocery Price Management System Backend",
  "main": "dist/index.js",
  "scripts": {
    "dev": "nodemon --ignore node_modules --watch src --ext ts --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint": "eslint src --ext .ts",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": ["grocery", "price", "management"],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "bcryptjs": "^3.0.3",
    "cloudinary": "^2.11.0",
    "cors": "^2.8.6",
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "jsonwebtoken": "^9.0.3",
    "mongoose": "^9.9.4",
    "multer": "^2.3.0",
    "socket.io": "^4.8.3"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/express": "^5.0.6",
    "@types/jsonwebtoken": "^9.0.10",
    "@types/multer": "^1.4.11",
    "@types/node": "^26.4.1",
    "@typescript-eslint/eslint-plugin": "^8.69.0",
    "@typescript-eslint/parser": "^8.69.0",
    "eslint": "^10.9.1",
    "nodemon": "^3.1.14",
    "ts-node": "^10.9.2",
    "typescript": "^6.0.3"
  }
}
```

### 22. tsconfig.json - TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### 23. .env.example - Environment Variables Template

```
# Backend Configuration
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/grocery-price?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

---

## FRONTEND CODE

### 1. src/app/page.tsx - Root Page with Role-based Redirects

```typescript
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isOwner, init } = useAuthStore();

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      if (isOwner) {
        router.push("/admin/dashboard");
      } else {
        router.push("/staff/search");
      }
    } else {
      router.push("/login");
    }
  }, [isAuthenticated, isOwner, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
```

### 2. src/app/(auth)/login/page.tsx - Login Page

```typescript
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { login } from "@/services/apiClient";

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setToken, isAuthenticated, isOwner } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push(isOwner ? "/admin/dashboard" : "/staff/search");
    }
  }, [isAuthenticated, isOwner, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login(email, password);

      if (response.success && response.data) {
        setToken(response.data.token);
        setUser(response.data.user);

        // Redirect based on role
        if (response.data.user.role === "owner") {
          router.push("/admin/dashboard");
        } else {
          router.push("/staff/search");
        }
      } else {
        setError(response.message || "Login failed");
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-orange-600 mb-2">GroceryPrice</h1>
        <p className="text-gray-600 mb-8">Grocery Price Management System</p>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t">
          <p className="text-sm text-gray-600 font-semibold mb-2">Demo Credentials:</p>
          <div className="space-y-1 text-sm text-gray-600">
            <p><strong>Staff:</strong> staff@grocerystore.com / staff123</p>
            <p><strong>Admin:</strong> admin@grocerystore.com / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 3. src/app/(staff)/search/page.tsx - Staff Search Interface

```typescript
"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useProductStore } from "@/stores/productStore";
import { searchProducts, getProductDetails } from "@/services/apiClient";
import { initSocket, onPriceUpdate, offPriceUpdate } from "@/services/socket";
import { useRouter } from "next/navigation";

export default function StaffSearchPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { products, setProducts, selectedProduct, setSelectedProduct, updatePrice } = useProductStore();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedProductDetails, setSelectedProductDetails] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Initialize Socket.IO for real-time updates
    initSocket();

    // Listen for price updates
    onPriceUpdate((data) => {
      updatePrice(data.variantId, data.b2bPrice, data.b2cPrice);
    });

    return () => {
      offPriceUpdate();
    };
  }, [isAuthenticated, router, updatePrice]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await searchProducts(query, 20);
      if (response.success) {
        setProducts(response.data || []);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = async (productId: string) => {
    try {
      const response = await getProductDetails(productId);
      if (response.success) {
        setSelectedProductDetails(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch product details:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-orange-600">Price Search</h1>
            <button
              onClick={() => {
                useAuthStore.getState().logout();
                router.push("/login");
              }}
              className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
            >
              Logout
            </button>
          </div>
          <p className="text-gray-600">Welcome, {user?.name}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-b">
        <form onSubmit={handleSearch} className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products by name, brand, or SKU..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </form>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        {selectedProductDetails ? (
          // Product Details View
          <div className="bg-white rounded-lg shadow-lg p-6">
            <button
              onClick={() => setSelectedProductDetails(null)}
              className="text-orange-600 hover:text-orange-700 mb-4 font-medium"
            >
              ← Back to Results
            </button>

            <h2 className="text-2xl font-bold mb-2">{selectedProductDetails.englishName}</h2>
            {selectedProductDetails.tamilName && (
              <p className="text-gray-600 mb-4">{selectedProductDetails.tamilName}</p>
            )}

            {selectedProductDetails.description && (
              <p className="text-gray-700 mb-4">{selectedProductDetails.description}</p>
            )}

            {/* Variants */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Available Variants:</h3>
              {selectedProductDetails.variants?.map((variant: any) => (
                <div key={variant._id} className="bg-gray-50 p-4 rounded-lg border">
                  <p className="font-medium">{variant.packSize} {variant.unit}</p>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">B2B Price</p>
                      <p className="text-lg font-bold text-orange-600">₹{variant.b2bPrice}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">B2C Price</p>
                      <p className="text-lg font-bold text-orange-600">₹{variant.b2cPrice}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Search Results Grid
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((product: any) => (
              <div
                key={product._id}
                onClick={() => handleProductClick(product._id)}
                className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg hover:border-orange-300 border border-gray-200 transition"
              >
                <h3 className="font-bold text-lg text-gray-800 mb-1">
                  {product.englishName}
                </h3>
                {product.tamilName && (
                  <p className="text-gray-600 text-sm mb-2">{product.tamilName}</p>
                )}
                {product.brand && (
                  <p className="text-gray-500 text-sm">Brand: {product.brand}</p>
                )}
                {product.sku && (
                  <p className="text-gray-500 text-sm">SKU: {product.sku}</p>
                )}
                <div className="mt-3 pt-3 border-t">
                  <p className="text-orange-600 font-semibold">Tap to view prices</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {products.length === 0 && query && !selectedProductDetails && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No products found</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

### 4. src/app/(admin)/dashboard/page.tsx - Admin Dashboard Shell

```typescript
"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isOwner } = useAuthStore();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!isAuthenticated || !isOwner) {
      router.push("/login");
    }
  }, [isAuthenticated, isOwner, router]);

  if (!isAuthenticated || !isOwner) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-orange-600">Admin Dashboard</h1>
            <button
              onClick={() => {
                useAuthStore.getState().logout();
                router.push("/login");
              }}
              className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
            >
              Logout
            </button>
          </div>
          <p className="text-gray-600 mt-2">Welcome, {user?.name}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Total Products</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">0</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Total Variants</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">0</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Active Staff</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">0</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Price Updates (Today)</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">0</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b">
            <div className="flex">
              {[
                { id: "overview", label: "Overview" },
                { id: "products", label: "Products" },
                { id: "pricing", label: "Pricing" },
                { id: "staff", label: "Staff" },
                { id: "settings", label: "Settings" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 font-medium border-b-2 transition ${
                    activeTab === tab.id
                      ? "border-orange-600 text-orange-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {activeTab === "overview" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">System Overview</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• View real-time dashboard metrics</li>
                  <li>• Monitor staff activity</li>
                  <li>• Track price change history</li>
                  <li>• Generate reports</li>
                </ul>
              </div>
            )}

            {activeTab === "products" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Product Management</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Add new products</li>
                  <li>• Edit product details</li>
                  <li>• Manage categories and subcategories</li>
                  <li>• Bulk import via CSV</li>
                  <li>• Upload product images</li>
                </ul>
              </div>
            )}

            {activeTab === "pricing" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Pricing Management</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Manage product variants</li>
                  <li>• Update B2B and B2C prices</li>
                  <li>• Set purchase costs</li>
                  <li>• View price change history</li>
                  <li>• Bulk price updates</li>
                </ul>
              </div>
            )}

            {activeTab === "staff" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Staff Management</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Add new staff members</li>
                  <li>• Manage staff permissions</li>
                  <li>• View staff activity logs</li>
                  <li>• Deactivate staff accounts</li>
                </ul>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">System Settings</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Configure application settings</li>
                  <li>• Manage API keys</li>
                  <li>• Set up integrations</li>
                  <li>• Configure notifications</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 5. src/services/apiClient.ts - Axios API Client

```typescript
import axios, { AxiosInstance } from "axios";
import { useAuthStore } from "@/stores/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    throw error.response?.data || error;
  },
);

// Auth endpoints
export const register = (
  email: string,
  password: string,
  name: string,
  role: string = "staff",
) => apiClient.post("/auth/register", { email, password, name, role });

export const login = (email: string, password: string) =>
  apiClient.post("/auth/login", { email, password });

export const getProfile = () => apiClient.get("/auth/profile");

// Product endpoints
export const searchProducts = (query: string, limit: number = 20) =>
  apiClient.get("/products/search", { params: { q: query, limit } });

export const getProductDetails = (productId: string) =>
  apiClient.get(`/products/${productId}`);

export const updateVariantPrices = (variantId: string, prices: any) =>
  apiClient.patch(`/products/${variantId}/prices`, prices);

export const getPriceHistory = (variantId: string, limit: number = 20) =>
  apiClient.get(`/products/${variantId}/price-history`, { params: { limit } });
```

### 6. src/services/socket.ts - Socket.IO Client

```typescript
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const initSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      console.log("✓ Socket connected:", socket?.id);
    });

    socket.on("disconnect", () => {
      console.log("✗ Socket disconnected");
    });
  }

  return socket;
};

export const getSocket = (): Socket => {
  if (!socket) {
    throw new Error("Socket not initialized");
  }
  return socket;
};

export const joinUserRoom = (userId: string) => {
  getSocket().emit("join-user", userId);
};

export const onPriceUpdate = (callback: (data: any) => void) => {
  getSocket().on("price-updated", callback);
};

export const offPriceUpdate = () => {
  getSocket().off("price-updated");
};

export const closeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
```

### 7. src/stores/authStore.ts - Auth Zustand Store

```typescript
import { create } from "zustand";

interface User {
  _id: string;
  email: string;
  name: string;
  role: "owner" | "staff";
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isOwner: boolean;
  isStaff: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  init: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  isOwner: false,
  isStaff: false,

  setUser: (user) =>
    set({
      user,
      isOwner: user?.role === "owner",
      isStaff: user?.role === "staff",
    }),

  setToken: (token) => {
    set({ token });
    if (token) {
      localStorage.setItem("auth_token", token);
    } else {
      localStorage.removeItem("auth_token");
    }
  },

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  logout: () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isOwner: false,
      isStaff: false,
    });
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  },

  init: () => {
    const token = localStorage.getItem("auth_token");
    const userStr = localStorage.getItem("auth_user");

    if (token && userStr) {
      const user = JSON.parse(userStr);
      set({
        token,
        user,
        isAuthenticated: true,
        isOwner: user.role === "owner",
        isStaff: user.role === "staff",
      });
    }
  },
}));

// Save user to localStorage when it changes
useAuthStore.subscribe((state) => {
  if (state.user) {
    localStorage.setItem("auth_user", JSON.stringify(state.user));
  }
});
```

### 8. src/stores/productStore.ts - Product Zustand Store

```typescript
import { create } from "zustand";

interface PriceUpdate {
  b2bPrice: number;
  b2cPrice: number;
  updatedAt: Date;
}

interface ProductStore {
  products: any[];
  selectedProduct: any | null;
  priceUpdates: Map<string, PriceUpdate>;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Map<string, Date>;
  setProducts: (products: any[]) => void;
  setSelectedProduct: (product: any | null) => void;
  updatePrice: (variantId: string, b2bPrice: number, b2cPrice: number) => void;
  clearProducts: () => void;
  getProductVariantPrice: (variantId: string) => PriceUpdate | undefined;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  selectedProduct: null,
  priceUpdates: new Map(),
  isLoading: false,
  error: null,
  lastUpdated: new Map(),

  setProducts: (products) => set({ products }),
  setSelectedProduct: (product) => set({ selectedProduct: product }),

  updatePrice: (variantId, b2bPrice, b2cPrice) => {
    const state = get();
    const newPriceUpdates = new Map(state.priceUpdates);
    newPriceUpdates.set(variantId, {
      b2bPrice,
      b2cPrice,
      updatedAt: new Date(),
    });

    const newLastUpdated = new Map(state.lastUpdated);
    newLastUpdated.set(variantId, new Date());

    set({
      priceUpdates: newPriceUpdates,
      lastUpdated: newLastUpdated,
    });
  },

  clearProducts: () => set({ products: [], selectedProduct: null }),

  getProductVariantPrice: (variantId) => get().priceUpdates.get(variantId),
}));
```

### 9. src/types/index.ts - Frontend TypeScript Interfaces

```typescript
export interface User {
  _id: string;
  email: string;
  name: string;
  role: "owner" | "staff";
}

export interface Product {
  _id: string;
  englishName: string;
  tamilName?: string;
  category: string;
  subcategory?: string;
  sku?: string;
  brand?: string;
  description?: string;
  image?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  _id: string;
  productId: string;
  packSize: number;
  unit: string;
  purchaseCost?: number;
  b2bPrice: number;
  b2cPrice: number;
  isActive: boolean;
}

export interface PriceHistory {
  _id: string;
  productVariantId: string;
  purchaseCost: number;
  b2bPrice: number;
  b2cPrice: number;
  changedBy: User;
  changedAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}
```

### 10. .env.local - Frontend Environment Variables

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=GroceryPrice
```

### 11. tailwind.config.ts - Tailwind CSS Configuration

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;
```

---

## PROJECT SETUP

### Backend Setup

```bash
cd backend
npm install
```

**.env file** (backend/.env):

```
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/grocery-price
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Start backend:**

```bash
npm run dev  # Development with hot reload
npm run build  # Build
npm start  # Production
```

### Frontend Setup

```bash
cd frontend
npm install
```

**.env.local file** (frontend/.env.local):

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=GroceryPrice
```

**Start frontend:**

```bash
npm run dev  # http://localhost:3000
```

---

## API ENDPOINTS

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile

### Products

- `GET /api/products/search?q=query` - Search products
- `GET /api/products/:id` - Get product details with variants
- `PATCH /api/products/:id/prices` - Update variant prices (admin only)
- `GET /api/products/:id/price-history` - Get price history (admin only)

### Health Check

- `GET /health` - Check if backend is running

---

This is the complete codebase! Ready to be shared with ChatGPT or used for reference.
