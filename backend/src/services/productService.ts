import { Product } from "../models/Product";
import { AppError } from "../middleware/errorHandler";
import { IPriceLevel } from "../types";

export class ProductService {
  // Helper: Calculate prices based on fixed mode and calculation type
  private static calculatePrices(
    pl1Price: number,
    pl2Adjustment: number,
    pl3Adjustment: number,
    pl4Adjustment: number,
    fixed: boolean,
    calculationType: "percentage" | "value"
  ) {
    if (fixed) {
      // In fixed mode, adjustments are the actual prices
      return {
        pl1: pl1Price,
        pl2: pl2Adjustment,
        pl3: pl3Adjustment,
        pl4: pl4Adjustment,
      };
    }

    // In non-fixed mode, calculate from PL1
    if (calculationType === "percentage") {
      const pl2 = pl1Price - (pl1Price * pl2Adjustment) / 100;
      const pl3 = pl1Price - (pl1Price * pl3Adjustment) / 100;
      const pl4 = pl1Price - (pl1Price * pl4Adjustment) / 100;
      return {
        pl1: pl1Price,
        pl2: Math.round(pl2 * 100) / 100, // Round to 2 decimals
        pl3: Math.round(pl3 * 100) / 100,
        pl4: Math.round(pl4 * 100) / 100,
      };
    } else {
      // value mode
      return {
        pl1: pl1Price,
        pl2: pl1Price - pl2Adjustment,
        pl3: pl1Price - pl3Adjustment,
        pl4: pl1Price - pl4Adjustment,
      };
    }
  }

  // Search products (for staff)
  static async searchProducts(query: string, limit: number = 20) {
    try {
      const searchTerm = query.trim();

      if (!searchTerm) {
        return [];
      }

      // Escape regex special characters so user input is treated as plain text
      const escapedQuery = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      // Case-insensitive partial search across product name,
      // Tamil name, SKU and brand.
      const products = await Product.find({
        isActive: true,
        $or: [
          { englishName: { $regex: escapedQuery, $options: "i" } },
          { tamilName: { $regex: escapedQuery, $options: "i" } },
          { sku: { $regex: escapedQuery, $options: "i" } },
          { brand: { $regex: escapedQuery, $options: "i" } },
        ],
      })
        .select({ purchasePrice: 0 }) // Hide purchase price from staff
        .sort({ englishName: 1 })
        .limit(limit)
        .lean();

      return products;
    } catch (error) {
      throw error;
    }
  }

  // Get product by ID
  static async getProductDetails(productId: string, isAdmin: boolean = false) {
    try {
      const product = await Product.findById(productId)
        .populate("category")
        .populate("subcategory");

      if (!product) {
        throw new AppError(404, "Product not found");
      }

      // Hide purchase price from non-admin
      const productObj = product.toObject();
      if (!isAdmin) {
        delete (productObj as any).purchasePrice;
      }

      return productObj;
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

      return {
        data: products,
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

  // Create product with pricing
  static async createProduct(data: {
    englishName: string;
    tamilName?: string;
    categoryId: string;
    subcategoryId?: string;
    sku?: string;
    giftCode?: string;
    brand?: string;
    description?: string;
    image?: string;
    purchasePrice: number;
    pricing: {
      fixed: boolean;
      calculationType: "percentage" | "value";
      pl1: { price: number; remarks?: string };
      pl2: { price: number; adjustment: number; remarks?: string };
      pl3: { price: number; adjustment: number; remarks?: string };
      pl4: { price: number; adjustment: number; remarks?: string };
    };
  }): Promise<any> {
    try {
      // Verify category exists
      const Category = (Product as any).db.model("Category");
      const category = await Category.findById(data.categoryId);
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

      // Validate prices based on fixed mode
      let pl2Price = data.pricing.pl2.price;
      let pl3Price = data.pricing.pl3.price;
      let pl4Price = data.pricing.pl4.price;

      if (!data.pricing.fixed) {
        // Validate and calculate based on calculation type
        const calculated = this.calculatePrices(
          data.pricing.pl1.price,
          data.pricing.pl2.adjustment,
          data.pricing.pl3.adjustment,
          data.pricing.pl4.adjustment,
          false,
          data.pricing.calculationType
        );
        pl2Price = calculated.pl2;
        pl3Price = calculated.pl3;
        pl4Price = calculated.pl4;
      }

      const product = new Product({
        englishName: data.englishName.trim(),
        tamilName: data.tamilName?.trim() || "",
        category: data.categoryId,
        subcategory: data.subcategoryId || null,
        sku: data.sku?.trim() || undefined,
        giftCode: data.giftCode?.trim() || "",
        brand: data.brand?.trim() || "",
        description: data.description?.trim() || "",
        image: data.image || "",
        purchasePrice: data.purchasePrice,
        pricing: {
          fixed: data.pricing.fixed,
          calculationType: data.pricing.calculationType,
          pl1: {
            price: data.pricing.pl1.price,
            remarks: data.pricing.pl1.remarks || "",
          },
          pl2: {
            price: pl2Price,
            adjustment: data.pricing.pl2.adjustment,
            remarks: data.pricing.pl2.remarks || "",
          },
          pl3: {
            price: pl3Price,
            adjustment: data.pricing.pl3.adjustment,
            remarks: data.pricing.pl3.remarks || "",
          },
          pl4: {
            price: pl4Price,
            adjustment: data.pricing.pl4.adjustment,
            remarks: data.pricing.pl4.remarks || "",
          },
        },
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
      giftCode?: string;
      brand?: string;
      description?: string;
      image?: string;
      purchasePrice?: number;
      pricing?: {
        fixed: boolean;
        calculationType: "percentage" | "value";
        pl1: { price: number; remarks?: string };
        pl2: { price: number; adjustment: number; remarks?: string };
        pl3: { price: number; adjustment: number; remarks?: string };
        pl4: { price: number; adjustment: number; remarks?: string };
      };
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
      if (data.giftCode !== undefined) product.giftCode = data.giftCode?.trim() || "";
      if (data.brand !== undefined) product.brand = data.brand?.trim() || "";
      if (data.description !== undefined) product.description = data.description?.trim() || "";
      if (data.image !== undefined) product.image = data.image || "";
      if (data.purchasePrice !== undefined) product.purchasePrice = data.purchasePrice;

      // Update pricing
      if (data.pricing) {
        let pl2Price = data.pricing.pl2.price;
        let pl3Price = data.pricing.pl3.price;
        let pl4Price = data.pricing.pl4.price;

        if (!data.pricing.fixed) {
          // Validate and calculate based on calculation type
          const calculated = this.calculatePrices(
            data.pricing.pl1.price,
            data.pricing.pl2.adjustment,
            data.pricing.pl3.adjustment,
            data.pricing.pl4.adjustment,
            false,
            data.pricing.calculationType
          );
          pl2Price = calculated.pl2;
          pl3Price = calculated.pl3;
          pl4Price = calculated.pl4;
        }

        product.pricing = {
          fixed: data.pricing.fixed,
          calculationType: data.pricing.calculationType,
          pl1: {
            price: data.pricing.pl1.price,
            remarks: data.pricing.pl1.remarks || "",
          },
          pl2: {
            price: pl2Price,
            adjustment: data.pricing.pl2.adjustment,
            remarks: data.pricing.pl2.remarks || "",
          },
          pl3: {
            price: pl3Price,
            adjustment: data.pricing.pl3.adjustment,
            remarks: data.pricing.pl3.remarks || "",
          },
          pl4: {
            price: pl4Price,
            adjustment: data.pricing.pl4.adjustment,
            remarks: data.pricing.pl4.remarks || "",
          },
        };
      }

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

  // Permanent delete product
  static async deleteProduct(productId: string): Promise<void> {
    try {
      const product = await Product.findById(productId);

      if (!product) {
        throw new AppError(404, "Product not found");
      }

      // Delete the product (variants are no longer created with new products)
      await Product.deleteOne({ _id: productId });
    } catch (error) {
      throw error;
    }
  }

}
