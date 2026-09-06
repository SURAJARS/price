import { Router } from "express";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  toggleCategoryStatus,
  getSubcategories,
  createSubcategory,
  updateSubcategory,
  toggleSubcategoryStatus,
} from "../controllers/categoryController";
import { authMiddleware, ownerOnly } from "../middleware/auth";

const router = Router();

// Category routes (all require auth + owner role)
router.get("/", authMiddleware, ownerOnly, getAllCategories);
router.post("/", authMiddleware, ownerOnly, createCategory);
router.patch("/:id", authMiddleware, ownerOnly, updateCategory);
router.patch("/:id/status", authMiddleware, ownerOnly, toggleCategoryStatus);

// Subcategory routes (all require auth + owner role)
router.get("/:categoryId/subcategories", authMiddleware, ownerOnly, getSubcategories);
router.post("/:categoryId/subcategories", authMiddleware, ownerOnly, createSubcategory);
router.patch(
  "/:categoryId/subcategories/:subId",
  authMiddleware,
  ownerOnly,
  updateSubcategory
);
router.patch(
  "/:categoryId/subcategories/:subId/status",
  authMiddleware,
  ownerOnly,
  toggleSubcategoryStatus
);

export default router;
