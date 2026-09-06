import mongoose, { Schema, Document } from "mongoose";
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
      required: [true, "Unit is required"],
      enum: ["KG", "L", "G", "ML", "PIECE", "DOZEN"],
    },
    purchaseCost: {
      type: Number,
      required: [true, "Purchase cost is required"],
      min: 0,
    },
    b2bPrice: {
      type: Number,
      required: [true, "B2B price is required"],
      min: 0,
    },
    b2cPrice: {
      type: Number,
      required: [true, "B2C price is required"],
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for quick lookups
variantSchema.index({ productId: 1 });

export const ProductVariant = mongoose.model<any>(
  "ProductVariant",
  variantSchema
);
