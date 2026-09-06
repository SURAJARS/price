import { Product } from "../models/Product";
import { ProductVariant } from "../models/ProductVariant";
import { PriceHistory } from "../models/PriceHistory";
import { AppError } from "../middleware/errorHandler";
import { notifyPriceUpdate } from "../config/socket";

export class ProductService {
  // Search products (for staff)
  static async searchProducts(query: string, limit: number = 20) {
    try {
      const products = await Product.find(
        {
          $text: { $search: query },
          isActive: true,
        },
        { score: { $meta: "textScore" } }
      )
        .sort({ score: { $meta: "textScore" } })
        .limit(limit)
        .lean();

      // Enrich with variants
      const enrichedProducts = await Promise.all(
        products.map(async (product: any) => {
          const variants = await ProductVariant.find(
            { productId: product._id, isActive: true },
            { purchaseCost: 0 } // Hide purchase cost from staff
          );

          return {
            ...product,
            variants,
          };
        })
      );

      return enrichedProducts;
    } catch (error) {
      throw error;
    }
  }

  // Get product by ID with variants
  static async getProductDetails(productId: string, isAdmin: boolean = false) {
    try {
      const product = await Product.findById(productId)
        .populate("category")
        .populate("subcategory");

      if (!product) {
        throw new AppError(404, "Product not found");
      }

      const variants = await ProductVariant.find({
        productId,
        isActive: true,
      });

      // Hide purchase cost from non-admin
      const processedVariants = isAdmin
        ? variants
        : variants.map((v: any) => {
            const obj = v.toObject();
            delete obj.purchaseCost;
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
    }
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
  static async getPriceHistory(productVariantId: string, limit: number = 20): Promise<any> {
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

  // PRODUCT MANAGEMENT METHODS

  // Get all products with optional filters
  static async getAllProducts(filters: {
    categoryId?: string;
    subcategoryId?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<any> {
    try {
      const { categoryId, subcategoryId, isActive, page = 1, limit = 20 } = filters;
      const skip = (page - 1) * limit;

      const query: any = {};
      if (categoryId) query.category = categoryId;
      if (subcategoryId) query.subcategory = subcategoryId;
      if (isActive !== undefined) query.isActive = isActive;

      const total = await Product.countDocuments(query);
      const products = await Product.find(query)
        .populate("category", "name")
        .populate("subcategory", "name")
        .sort({ englishName: 1 })
        .skip(skip)
        .limit(limit);

      // Enrich with variant count
      const enriched = await Promise.all(
        products.map(async (product: any) => {
          const variantCount = await ProductVariant.countDocuments({
            productId: product._id,
          });
          return {
            ...product.toObject(),
            variantCount,
          };
        })
      );

      return {
        data: enriched,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Create product
  static async createProduct(data: {
    englishName: string;
    tamilName?: string;
    categoryId: string;
    subcategoryId?: string;
    sku?: string;
    brand?: string;
    description?: string;
    image?: string;
  }): Promise<any> {
    try {
      // Verify category exists
      const category = await (Product as any).db.model("Category").findById(data.categoryId);
      if (!category) {
        throw new AppError(404, "Category not found");
      }

      // Check for duplicate SKU if provided
      if (data.sku) {
        const existing = await Product.findOne({ sku: data.sku });
        if (existing) {
          throw new AppError(400, "Product with this SKU already exists");
        }
      }

      const product = new Product({
        englishName: data.englishName.trim(),
        tamilName: data.tamilName?.trim() || "",
        category: data.categoryId,
        subcategory: data.subcategoryId || null,
        sku: data.sku?.trim() || "",
        brand: data.brand?.trim() || "",
        description: data.description?.trim() || "",
        image: data.image || "",
        isActive: true,
      });

      await product.save();
      await product.populate(["category", "subcategory"]);
      return product; 
    } catch (error) {
      throw error;
    }
  }

  // Update product
  static async updateProduct(
    productId: string,
    data: {
      englishName?: string;
      tamilName?: string;
      categoryId?: string;
      subcategoryId?: string;
      sku?: string;
      brand?: string;
      description?: string;
      image?: string;
    }
  ): Promise<any> {
    try {
      const product = await Product.findById(productId);

      if (!product) {
        throw new AppError(404, "Product not found");
      }

      // Check for duplicate SKU if being changed
      if (data.sku && data.sku !== product.sku) {
        const existing = await Product.findOne({
          _id: { $ne: productId },
          sku: data.sku,
        });
        if (existing) {
          throw new AppError(400, "Product with this SKU already exists");
        }
      }

      // Update fields
      if (data.englishName) product.englishName = data.englishName.trim();
      if (data.tamilName !== undefined) product.tamilName = data.tamilName.trim();
      if (data.categoryId) product.category = data.categoryId;
      if (data.subcategoryId !== undefined) product.subcategory = data.subcategoryId;
      if (data.sku !== undefined) product.sku = data.sku?.trim() || "";
      if (data.brand !== undefined) product.brand = data.brand?.trim() || "";
      if (data.description !== undefined) product.description = data.description?.trim() || "";
      if (data.image !== undefined) product.image = data.image || "";

      await product.save();
      await product.populate(["category", "subcategory"]);
      return product;    
} catch (error) {
      throw error;
    }
  }

  // Toggle product active status
  static async toggleProductStatus(productId: string): Promise<any> {
    try {
      const product = await Product.findById(productId);

      if (!product) {
        throw new AppError(404, "Product not found");
      }

      product.isActive = !product.isActive;
      await product.save();

      return product;
    } catch (error) {
      throw error;
    }
  }

  // VARIANT MANAGEMENT METHODS

  // Get product variants
  static async getProductVariants(productId: string): Promise<any> {
    try {
      const product = await Product.findById(productId);

      if (!product) {
        throw new AppError(404, "Product not found");
      }

      const variants = await ProductVariant.find({ productId }).sort({
        packSize: 1,
      });

      return variants;
    } catch (error) {
      throw error;
    }
  }

  // Create variant
  static async createVariant(
    productId: string,
    data: {
      packSize: string;
      unit: string;
      purchaseCost: number;
      b2bPrice: number;
      b2cPrice: number;
    }
  ): Promise<any> {
    try {
      const product = await Product.findById(productId);

      if (!product) {
        throw new AppError(404, "Product not found");
      }

      const variant = new ProductVariant({
        productId,
        packSize: data.packSize.trim(),
        unit: data.unit.toUpperCase(),
        purchaseCost: data.purchaseCost,
        b2bPrice: data.b2bPrice,
        b2cPrice: data.b2cPrice,
        isActive: true,
      });

      await variant.save();
      return variant;
    } catch (error) {
      throw error;
    }
  }

  // Update variant
  static async updateVariant(
    variantId: string,
    data: {
      packSize?: string;
      unit?: string;
      purchaseCost?: number;
      b2bPrice?: number;
      b2cPrice?: number;
    }
  ): Promise<any> {
    try {
      const variant = await ProductVariant.findById(variantId);

      if (!variant) {
        throw new AppError(404, "Variant not found");
      }

      // Update fields (use explicit undefined checks for numeric fields)
      if (data.packSize !== undefined) variant.packSize = data.packSize.trim();
      if (data.unit !== undefined) variant.unit = data.unit.toUpperCase();
      if (data.purchaseCost !== undefined) variant.purchaseCost = data.purchaseCost;
      if (data.b2bPrice !== undefined) variant.b2bPrice = data.b2bPrice;
      if (data.b2cPrice !== undefined) variant.b2cPrice = data.b2cPrice;

      await variant.save();
      return variant;
    } catch (error) {
      throw error;
    }
  }

  // Toggle variant active status
  static async toggleVariantStatus(variantId: string): Promise<any> {
    try {
      const variant = await ProductVariant.findById(variantId);

      if (!variant) {
        throw new AppError(404, "Variant not found");
      }

      variant.isActive = !variant.isActive;
      await variant.save();

      return variant;
    } catch (error) {
      throw error;
    }
  }

  // Permanent delete - cascade delete product, variants, and price history
  static async deleteProduct(productId: string): Promise<void> {
    try {
      const product = await Product.findById(productId);

      if (!product) {
        throw new AppError(404, "Product not found");
      }

      // Get all variant IDs for this product
      const variants = await ProductVariant.find({ productId });
      const variantIds = variants.map((v: any) => v._id);

      // Delete all price history for these variants
      if (variantIds.length > 0) {
        await PriceHistory.deleteMany({
          productVariantId: { $in: variantIds },
        });
      }

      // Delete all variants for this product
      await ProductVariant.deleteMany({ productId });

      // Delete the product
      await Product.deleteOne({ _id: productId });
    } catch (error) {
      throw error;
    }
  }
}
