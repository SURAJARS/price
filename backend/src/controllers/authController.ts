import { Request, Response } from "express";
import { AuthRequest } from "../types";
import { AuthService } from "../services/authService";
import { successResponse } from "../utils/helpers";
import { asyncHandler } from "../middleware/errorHandler";

export const register = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password, name, role } = req.body;

    const user = await AuthService.register(email, password, name, role);

    res.status(201).json(
      successResponse(true, "User registered successfully", user)
    );
  }
);

export const login = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const result = await AuthService.login(email, password);

    res.json(successResponse(true, "Login successful", result));
  }
);

export const getProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const user = await AuthService.getUserById(
      authReq.userId || ""
    );

    res.json(successResponse(true, "Profile retrieved", user));
  }
);

export const listStaff = asyncHandler(
  async (req: Request, res: Response) => {
    const staff = await AuthService.listStaff();

    res.json(successResponse(true, "Staff members retrieved", staff));
  }
);

export const editStaff = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, email } = req.body;

    const staffId = Array.isArray(id) ? id[0] : id;
    const updatedStaff = await AuthService.editStaff(staffId, { name, email });

    res.json(successResponse(true, "Staff member updated", updatedStaff));
  }
);

export const toggleStaffStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const staffId = Array.isArray(id) ? id[0] : id;
    const updatedStaff = await AuthService.toggleStaffStatus(staffId);

    res.json(successResponse(true, "Staff status updated", updatedStaff));
  }
);
