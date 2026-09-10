import { Request, Response } from "express";
import { AuthRequest } from "../types";
import { ProductService } from "../services/productService";
import { successResponse } from "../utils/helpers";
import { asyncHandler } from "../middleware/errorHandler";
import { uploadImage } from "../config/cloudinary";

// Product list with filters
export const getAllProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const { categoryId, subcategoryId, isActive, page = 1, limit = 20 } = req.query;

    const products = await ProductService.getAllProducts({
      categoryId: categoryId as string,
      subcategoryId: subcategoryId as string,
      isActive: isActive === "true" ? true : isActive === "false" ? false : undefined,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    });

    res.json(
      successResponse(
        true,
        `Retrieved ${products.data.length} product(s)`,
        products
      )
    );
  }
);

// Search products (staff)
export const searchProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const { q, limit = 20 } = req.query;

    if (!q) {
      res.status(400).json(successResponse(false, "Search query required"));
      return;
    }

    const products = await ProductService.searchProducts(
      q as string,
      parseInt(limit as string)
    );

    res.json(
      successResponse(
        true,
        `Found ${products.length} product(s)`,
        products
      )
    );
  }
);

// Create product
export const createProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      englishName,
      tamilName,
      categoryId,
      subcategoryId,
      sku,
      giftCode,
      brand,
      description,
      image,
      purchasePrice,
      pricing,
    } = req.body;

    if (!englishName || !categoryId) {
      res
        .status(400)
        .json(
          successResponse(false, "English name and category are required")
        );
      return;
    }

    if (purchasePrice === undefined || !pricing) {
      res
        .status(400)
        .json(
          successResponse(false, "Purchase price and pricing configuration are required")
        );
      return;
    }

    const product = await ProductService.createProduct({
      englishName,
      tamilName,
      categoryId,
      subcategoryId,
      sku,
      giftCode,
      brand,
      description,
      image,
      purchasePrice,
      pricing,
    });

    res.status(201).json(
      successResponse(true, "Product created successfully", product)
    );
  }
);

// Get product details
export const getProductDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const authReq = req as AuthRequest;
    const isAdmin = authReq.user?.role === "admin";

    const product = await ProductService.getProductDetails(id, isAdmin);

    res.json(successResponse(true, "Product details retrieved", product));
  }
);

// Update product
export const updateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const productId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const {
      englishName,
      tamilName,
      categoryId,
      subcategoryId,
      sku,
      giftCode,
      brand,
      description,
      image,
      purchasePrice,
      pricing,
    } = req.body;

    const product = await ProductService.updateProduct(productId, {
      englishName,
      tamilName,
      categoryId,
      subcategoryId,
      sku,
      giftCode,
      brand,
      description,
      image,
      purchasePrice,
      pricing,
    });

    res.json(successResponse(true, "Product updated successfully", product));
  }
);

// Toggle product active status
export const toggleProductStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const productId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const product = await ProductService.toggleProductStatus(productId);

    res.json(
      successResponse(
        true,
        `Product ${product.isActive ? "activated" : "deactivated"}`,
        product
      )
    );
  }
);

// Delete product
export const deleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const productId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    await ProductService.deleteProduct(productId);

    res.json(
      successResponse(true, "Product deleted successfully")
    );
  }
);

// Upload product image
export const uploadProductImage = asyncHandler(
  async (req: Request, res: Response) => {
    const productId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    if (!req.file) {
      res.status(400).json(successResponse(false, "No image file provided"));
      return;
    }

    // Validate file size (5MB max)
    if (req.file.size > 5 * 1024 * 1024) {
      res.status(400).json(successResponse(false, "File size must be less than 5MB"));
      return;
    }

    // Validate file type
    const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedMimes.includes(req.file.mimetype)) {
      res.status(400).json(successResponse(false, "Only JPG, PNG, and WebP images are allowed"));
      return;
    }

    try {
      // Upload to Cloudinary
      const imageUrl = await uploadImage(req.file, "grocery-price/products");

      // Update product with image URL
      const product = await ProductService.updateProduct(productId, {
        image: imageUrl,
      });

      res.json(successResponse(true, "Image uploaded successfully", { imageUrl, product }));
    } catch (error: any) {
      console.error("Image upload error:", {
        productId,
        fileName: req.file?.originalname,
        error: error.message,
        stack: error.stack,
      });
      res.status(500).json(successResponse(false, error.message || "Failed to upload image"));
    }
  }
);
