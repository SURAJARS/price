import { Router } from "express";
import {
  register,
  login,
  getProfile,
  listStaff,
  editStaff,
  toggleStaffStatus,
} from "../controllers/authController";
import { authMiddleware } from "../middleware/auth";
import { ownerOnly } from "../middleware/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);

// Staff management endpoints (owner only)
router.get("/staff", authMiddleware, ownerOnly, listStaff);
router.patch("/staff/:id", authMiddleware, ownerOnly, editStaff);
router.patch("/staff/:id/status", authMiddleware, ownerOnly, toggleStaffStatus);

export default router;
