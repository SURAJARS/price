import { Category } from "../models/Category";
import { Subcategory } from "../models/Subcategory";
import { AppError } from "../middleware/errorHandler";

export class CategoryService {
  // Get all categories
  static async getAllCategories() {
    try {
      const categories = await Category.find().sort({ name: 1 });
      
      // Enrich each category with subcategory count
      const enriched = await Promise.all(
        categories.map(async (cat: any) => {
          const subcategoryCount = await Subcategory.countDocuments({
            categoryId: cat._id,
          });
          return {
            ...cat.toObject(),
            subcategoryCount,
          };
        })
      );

      return enriched;
    } catch (error) {
      throw error;
    }
  }

  // Create category
  static async createCategory(name: string, description?: string) {
    try {
      // Check for duplicate
      const existing = await Category.findOne({
        name: { $regex: `^${name.trim()}$`, $options: "i" },
      });

      if (existing) {
        throw new AppError(400, "Category with this name already exists");
      }

      const category = new Category({
        name: name.trim(),
        description: description?.trim() || "",
        isActive: true,
      });

      await category.save();
      return category;
    } catch (error) {
      throw error;
    }
  }

  // Update category
  static async updateCategory(
    categoryId: string,
    name: string,
    description?: string
  ) {
    try {
      const category = await Category.findById(categoryId);

      if (!category) {
        throw new AppError(404, "Category not found");
      }

      // Check for duplicate name (excluding self)
      if (name.trim() !== category.name) {
        const existing = await Category.findOne({
          _id: { $ne: categoryId },
          name: { $regex: `^${name.trim()}$`, $options: "i" },
        });

        if (existing) {
          throw new AppError(400, "Category with this name already exists");
        }
      }

      category.name = name.trim();
      if (description !== undefined) {
        category.description = description.trim();
      }

      await category.save();
      return category;
    } catch (error) {
      throw error;
    }
  }

  // Toggle category active status
  static async toggleCategoryStatus(categoryId: string) {
    try {
      const category = await Category.findById(categoryId);

      if (!category) {
        throw new AppError(404, "Category not found");
      }

      category.isActive = !category.isActive;
      await category.save();

      return category;
    } catch (error) {
      throw error;
    }
  }

  // Get subcategories for a category
  static async getSubcategoriesByCategory(categoryId: string) {
    try {
      const category = await Category.findById(categoryId);

      if (!category) {
        throw new AppError(404, "Category not found");
      }

      const subcategories = await Subcategory.find({ categoryId }).sort({
        name: 1,
      });

      return subcategories;
    } catch (error) {
      throw error;
    }
  }

  // Create subcategory
  static async createSubcategory(
    categoryId: string,
    name: string,
    description?: string
  ) {
    try {
      // Verify category exists
      const category = await Category.findById(categoryId);

      if (!category) {
        throw new AppError(404, "Category not found");
      }

      // Check for duplicate subcategory name within this category
      const existing = await Subcategory.findOne({
        categoryId,
        name: { $regex: `^${name.trim()}$`, $options: "i" },
      });

      if (existing) {
        throw new AppError(
          400,
          `Subcategory "${name}" already exists in this category`
        );
      }

      const subcategory = new Subcategory({
        categoryId,
        name: name.trim(),
        description: description?.trim() || "",
        isActive: true,
      });

      await subcategory.save();
      return subcategory;
    } catch (error) {
      throw error;
    }
  }

  // Update subcategory
  static async updateSubcategory(
    subcategoryId: string,
    name: string,
    description?: string
  ) {
    try {
      const subcategory = await Subcategory.findById(subcategoryId);

      if (!subcategory) {
        throw new AppError(404, "Subcategory not found");
      }

      // Check for duplicate name within the same category (excluding self)
      if (name.trim() !== subcategory.name) {
        const existing = await Subcategory.findOne({
          _id: { $ne: subcategoryId },
          categoryId: subcategory.categoryId,
          name: { $regex: `^${name.trim()}$`, $options: "i" },
        });

        if (existing) {
          throw new AppError(
            400,
            `Subcategory "${name}" already exists in this category`
          );
        }
      }

      subcategory.name = name.trim();
      if (description !== undefined) {
        subcategory.description = description.trim();
      }

      await subcategory.save();
      return subcategory;
    } catch (error) {
      throw error;
    }
  }

  // Toggle subcategory active status
  static async toggleSubcategoryStatus(subcategoryId: string) {
    try {
      const subcategory = await Subcategory.findById(subcategoryId);

      if (!subcategory) {
        throw new AppError(404, "Subcategory not found");
      }

      subcategory.isActive = !subcategory.isActive;
      await subcategory.save();

      return subcategory;
    } catch (error) {
      throw error;
    }
  }
}
