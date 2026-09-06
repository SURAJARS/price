import { Request, Response } from "express";
import { AuthRequest } from "../types";
import { CategoryService } from "../services/categoryService";
import { successResponse } from "../utils/helpers";
import { asyncHandler } from "../middleware/errorHandler";

// Category endpoints

export const getAllCategories = asyncHandler(
  async (req: Request, res: Response) => {
    const categories = await CategoryService.getAllCategories();

    res.json(
      successResponse(
        true,
        `Retrieved ${categories.length} category(ies)`,
        categories
      )
    );
  }
);

export const createCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, description } = req.body;

    if (!name || name.trim() === "") {
      res.status(400).json(successResponse(false, "Category name is required"));
      return;
    }

    const category = await CategoryService.createCategory(name, description);

    res.status(201).json(
      successResponse(true, "Category created successfully", category)
    );
  }
);

export const updateCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const categoryId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const { name, description } = req.body;

    if (!name || name.trim() === "") {
      res.status(400).json(successResponse(false, "Category name is required"));
      return;
    }

    const category = await CategoryService.updateCategory(
      categoryId,
      name,
      description
    );

    res.json(
      successResponse(true, "Category updated successfully", category)
    );
  }
);

export const toggleCategoryStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const categoryId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const category = await CategoryService.toggleCategoryStatus(categoryId);

    res.json(
      successResponse(
        true,
        `Category ${category.isActive ? "activated" : "deactivated"}`,
        category
      )
    );
  }
);

// Subcategory endpoints

export const getSubcategories = asyncHandler(
  async (req: Request, res: Response) => {
    const categoryId = Array.isArray(req.params.categoryId)
      ? req.params.categoryId[0]
      : req.params.categoryId;

    const subcategories = await CategoryService.getSubcategoriesByCategory(
      categoryId
    );

    res.json(
      successResponse(
        true,
        `Retrieved ${subcategories.length} subcategory(ies)`,
        subcategories
      )
    );
  }
);

export const createSubcategory = asyncHandler(
  async (req: Request, res: Response) => {
    const categoryId = Array.isArray(req.params.categoryId)
      ? req.params.categoryId[0]
      : req.params.categoryId;
    const { name, description } = req.body;

    if (!name || name.trim() === "") {
      res
        .status(400)
        .json(successResponse(false, "Subcategory name is required"));
      return;
    }

    const subcategory = await CategoryService.createSubcategory(
      categoryId,
      name,
      description
    );

    res.status(201).json(
      successResponse(true, "Subcategory created successfully", subcategory)
    );
  }
);

export const updateSubcategory = asyncHandler(
  async (req: Request, res: Response) => {
    const subcategoryId = Array.isArray(req.params.subId)
      ? req.params.subId[0]
      : req.params.subId;
    const { name, description } = req.body;

    if (!name || name.trim() === "") {
      res
        .status(400)
        .json(successResponse(false, "Subcategory name is required"));
      return;
    }

    const subcategory = await CategoryService.updateSubcategory(
      subcategoryId,
      name,
      description
    );

    res.json(
      successResponse(true, "Subcategory updated successfully", subcategory)
    );
  }
);

export const toggleSubcategoryStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const subcategoryId = Array.isArray(req.params.subId)
      ? req.params.subId[0]
      : req.params.subId;

    const subcategory = await CategoryService.toggleSubcategoryStatus(
      subcategoryId
    );

    res.json(
      successResponse(
        true,
        `Subcategory ${subcategory.isActive ? "activated" : "deactivated"}`,
        subcategory
      )
    );
  }
);
