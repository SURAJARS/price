import mongoose, { Schema, Document } from "mongoose";
import { IPriceHistory } from "../types";

const priceHistorySchema = new Schema<any>(
  {
    productVariantId: {
      type: Schema.Types.ObjectId,
      ref: "ProductVariant",
      required: [true, "Product Variant ID is required"],
    },
    purchaseCost: {
      type: Number,
      required: true,
      min: 0,
    },
    b2bPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    b2cPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    changedAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  {
    timestamps: false,
  }
);

// Index for lookups
priceHistorySchema.index({ productVariantId: 1, changedAt: -1 });

export const PriceHistory = mongoose.model<any>(
  "PriceHistory",
  priceHistorySchema
);
