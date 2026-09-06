import mongoose, { Schema, Document } from "mongoose";
import { IProduct } from "../types";

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
