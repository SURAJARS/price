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
  }
);

export const Category = mongoose.model<any>(
  "Category",
  categorySchema
);
