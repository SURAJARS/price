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
      brand,
      description,
      image,
    } = req.body;

    if (!englishName || !categoryId) {
      res
        .status(400)
        .json(
          successResponse(false, "English name and category are required")
        );
      return;
    }

    const product = await ProductService.createProduct({
      englishName,
      tamilName,
      categoryId,
      subcategoryId,
      sku,
      brand,
      description,
      image,
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
      brand,
      description,
      image,
    } = req.body;

    const product = await ProductService.updateProduct(productId, {
      englishName,
      tamilName,
      categoryId,
      subcategoryId,
      sku,
      brand,
      description,
      image,
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

// Variant management

// Get product variants
export const getProductVariants = asyncHandler(
  async (req: Request, res: Response) => {
    const productId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const variants = await ProductService.getProductVariants(productId);

    res.json(
      successResponse(true, `Retrieved ${variants.length} variant(s)`, variants)
    );
  }
);

// Create variant
export const createVariant = asyncHandler(
  async (req: Request, res: Response) => {
    const productId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const { packSize, unit, purchaseCost, b2bPrice, b2cPrice } = req.body;

    if (!packSize || !unit || purchaseCost === undefined || b2bPrice === undefined || b2cPrice === undefined) {
      res
        .status(400)
        .json(
          successResponse(
            false,
            "Pack size, unit, and prices are required"
          )
        );
      return;
    }

    const variant = await ProductService.createVariant(productId, {
      packSize,
      unit,
      purchaseCost,
      b2bPrice,
      b2cPrice,
    });

    res.status(201).json(
      successResponse(true, "Variant created successfully", variant)
    );
  }
);

// Update variant
export const updateVariant = asyncHandler(
  async (req: Request, res: Response) => {
    const variantId = Array.isArray(req.params.variantId)
      ? req.params.variantId[0]
      : req.params.variantId;
    const { packSize, unit, purchaseCost, b2bPrice, b2cPrice } = req.body;

    const variant = await ProductService.updateVariant(variantId, {
      packSize,
      unit,
      purchaseCost,
      b2bPrice,
      b2cPrice,
    });

    res.json(successResponse(true, "Variant updated successfully", variant));
  }
);

// Toggle variant active status
export const toggleVariantStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const variantId = Array.isArray(req.params.variantId)
      ? req.params.variantId[0]
      : req.params.variantId;

    const variant = await ProductService.toggleVariantStatus(variantId);

    res.json(
      successResponse(
        true,
        `Variant ${variant.isActive ? "activated" : "deactivated"}`,
        variant
      )
    );
  }
);

// Update variant prices (with price history)
export const updateVariantPrices = asyncHandler(
  async (req: Request, res: Response) => {
    const variantId = Array.isArray(req.params.variantId)
      ? req.params.variantId[0]
      : req.params.variantId;
    const { purchaseCost, b2bPrice, b2cPrice } = req.body;
    const authReq = req as AuthRequest;

    const variant = await ProductService.updateVariantPrices(
      variantId,
      authReq.userId || "",
      { purchaseCost, b2bPrice, b2cPrice }
    );

    res.json(successResponse(true, "Prices updated successfully", variant));
  }
);

// Get price history
export const getPriceHistory = asyncHandler(
  async (req: Request, res: Response) => {
    const variantId = Array.isArray(req.params.variantId)
      ? req.params.variantId[0]
      : req.params.variantId;
    const { limit = 20 } = req.query;

    const history = await ProductService.getPriceHistory(
      variantId,
      parseInt(limit as string)
    );

    res.json(successResponse(true, "Price history retrieved", history));
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

// Delete product permanently (cascade delete variants and price history)
export const deleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const productId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    await ProductService.deleteProduct(productId);

    res.json(
      successResponse(true, "Product deleted permanently", { productId })
    );
  }
);
