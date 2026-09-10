import { Router } from "express";
import {
  getAllProducts,
  searchProducts,
  createProduct,
  getProductDetails,
  updateProduct,
  toggleProductStatus,
  deleteProduct,
  uploadProductImage,
} from "../controllers/productController";
import { authMiddleware, ownerOnly } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();

// Staff routes (search)
router.get("/search", authMiddleware, searchProducts);

// Admin routes (product management)
router.get("/", authMiddleware, ownerOnly, getAllProducts);
router.post("/", authMiddleware, ownerOnly, createProduct);
router.get("/:id", authMiddleware, getProductDetails);
router.patch("/:id", authMiddleware, ownerOnly, updateProduct);
router.patch("/:id/status", authMiddleware, ownerOnly, toggleProductStatus);
router.delete("/:id", authMiddleware, ownerOnly, deleteProduct);
router.post("/:id/upload-image", authMiddleware, ownerOnly, upload.single("image"), uploadProductImage);

export default router;
