import { Router } from "express";
import {
  getAllProducts,
  searchProducts,
  createProduct,
  getProductDetails,
  updateProduct,
  toggleProductStatus,
  deleteProduct,
  getProductVariants,
  createVariant,
  updateVariant,
  toggleVariantStatus,
  updateVariantPrices,
  getPriceHistory,
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

// Variant routes
router.get("/:id/variants", authMiddleware, ownerOnly, getProductVariants);
router.post("/:id/variants", authMiddleware, ownerOnly, createVariant);
router.patch("/:id/variants/:variantId", authMiddleware, ownerOnly, updateVariant);
router.patch(
  "/:id/variants/:variantId/status",
  authMiddleware,
  ownerOnly,
  toggleVariantStatus
);
router.patch(
  "/:id/variants/:variantId/prices",
  authMiddleware,
  ownerOnly,
  updateVariantPrices
);
router.get(
  "/:id/variants/:variantId/history",
  authMiddleware,
  ownerOnly,
  getPriceHistory
);

export default router;
