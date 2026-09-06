import mongoose, { Schema, Document, Types } from "mongoose";
import { UserRole } from "../types";

const userSchema = new Schema<any>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: [UserRole.OWNER, UserRole.STAFF],
      default: UserRole.STAFF,
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

// Hash password before saving (to be implemented in service)
export const User = mongoose.model<any>("User", userSchema);
