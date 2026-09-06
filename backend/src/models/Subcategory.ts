import mongoose, { Schema, Document } from "mongoose";
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
  }
);

// Compound unique index: categoryId + name (normalized)
subcategorySchema.index({ categoryId: 1, name: 1 }, { unique: true });

export const Subcategory = mongoose.model<any>(
  "Subcategory",
  subcategorySchema
);
