import mongoose, { Schema, Document } from "mongoose";
import { IProduct } from "../types";

const priceLevel = {
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  adjustment: {
    type: Number,
    default: 0,
  },
  remarks: {
    type: String,
    trim: true,
    default: "",
  },
};

const productSchema = new Schema<any>(
  {
    englishName: {
      type: String,
      required: [true, "English product name is required"],
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
    giftCode: {
      type: String,
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
      type: String, // Cloudinary URL
    },
    purchasePrice: {
      type: Number,
      required: [true, "Purchase price is required"],
      min: 0,
    },
    pricing: {
      fixed: {
        type: Boolean,
        default: true,
      },
      calculationType: {
        type: String,
        enum: ["percentage", "value"],
        default: "percentage",
      },
      pl1: {
        type: priceLevel,
        required: true,
      },
      pl2: {
        type: priceLevel,
        required: true,
      },
      pl3: {
        type: priceLevel,
        required: true,
      },
      pl4: {
        type: priceLevel,
        required: true,
      },
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

// Index for search
productSchema.index({ englishName: "text", tamilName: "text", sku: "text", brand: "text" });

export const Product = mongoose.model<any>("Product", productSchema);
