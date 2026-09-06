"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/services/apiClient";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import Navigation from "@/components/Navigation";

interface Category {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  subcategoryCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Subcategory {
  _id: string;
  categoryId: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function CategoriesPage() {
  const router = useRouter();
  const { isAuthenticated, isOwner } = useAuthStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] =
    useState<Subcategory | null>(null);

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
  });
  const [subcategoryForm, setSubcategoryForm] = useState({
    name: "",
    description: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated || !isOwner) {
      router.push("/login");
    }
  }, [isAuthenticated, isOwner, router]);

  // Load categories
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiClient.getCategories();
      setCategories(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const loadSubcategories = async (categoryId: string) => {
    try {
      setError("");
      const response = await apiClient.getSubcategories(categoryId);
      setSubcategories(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load subcategories");
    }
  };

  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
    loadSubcategories(category._id);
  };

  // Category operations
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!categoryForm.name.trim()) {
        setError("Category name is required");
        return;
      }

      await apiClient.createCategory(
        categoryForm.name,
        categoryForm.description,
      );

      setSuccess("Category created successfully");
      setCategoryForm({ name: "", description: "" });
      setShowCategoryModal(false);
      loadCategories();

      setTimeout(() => setSuccess(""), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create category");
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!categoryForm.name.trim() || !editingCategory) {
        setError("Category name is required");
        return;
      }

      await apiClient.updateCategory(
        editingCategory._id,
        categoryForm.name,
        categoryForm.description,
      );

      setSuccess("Category updated successfully");
      setCategoryForm({ name: "", description: "" });
      setEditingCategory(null);
      setShowCategoryModal(false);
      loadCategories();

      setTimeout(() => setSuccess(""), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update category");
    }
  };

  const handleToggleCategoryStatus = async (categoryId: string) => {
    try {
      await apiClient.toggleCategoryStatus(categoryId);
      setSuccess("Category status updated");
      loadCategories();

      setTimeout(() => setSuccess(""), 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to update category status",
      );
    }
  };

  const openEditCategoryModal = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || "",
    });
    setShowCategoryModal(true);
  };

  // Subcategory operations
  const handleCreateSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!selectedCategory) {
        setError("Please select a category first");
        return;
      }

      if (!subcategoryForm.name.trim()) {
        setError("Subcategory name is required");
        return;
      }

      await apiClient.createSubcategory(
        selectedCategory._id,
        subcategoryForm.name,
        subcategoryForm.description,
      );

      setSuccess("Subcategory created successfully");
      setSubcategoryForm({ name: "", description: "" });
      setShowSubcategoryModal(false);
      loadSubcategories(selectedCategory._id);
      loadCategories(); // Refresh to get updated subcategory count

      setTimeout(() => setSuccess(""), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create subcategory");
    }
  };

  const handleUpdateSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!selectedCategory || !editingSubcategory) {
        setError("Selection error");
        return;
      }

      if (!subcategoryForm.name.trim()) {
        setError("Subcategory name is required");
        return;
      }

      await apiClient.updateSubcategory(
        selectedCategory._id,
        editingSubcategory._id,
        subcategoryForm.name,
        subcategoryForm.description,
      );

      setSuccess("Subcategory updated successfully");
      setSubcategoryForm({ name: "", description: "" });
      setEditingSubcategory(null);
      setShowSubcategoryModal(false);
      loadSubcategories(selectedCategory._id);

      setTimeout(() => setSuccess(""), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update subcategory");
    }
  };

  const handleToggleSubcategoryStatus = async (subcategoryId: string) => {
    try {
      if (!selectedCategory) return;

      await apiClient.toggleSubcategoryStatus(
        selectedCategory._id,
        subcategoryId,
      );

      setSuccess("Subcategory status updated");
      loadSubcategories(selectedCategory._id);

      setTimeout(() => setSuccess(""), 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to update subcategory status",
      );
    }
  };

  const openEditSubcategoryModal = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    setSubcategoryForm({
      name: subcategory.name,
      description: subcategory.description || "",
    });
    setShowSubcategoryModal(true);
  };

  const closeModals = () => {
    setShowCategoryModal(false);
    setShowSubcategoryModal(false);
    setEditingCategory(null);
    setEditingSubcategory(null);
    setCategoryForm({ name: "", description: "" });
    setSubcategoryForm({ name: "", description: "" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Category Management
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Manage product categories and subcategories
              </p>
            </div>
            <button
              onClick={() => {
                setEditingCategory(null);
                setCategoryForm({ name: "", description: "" });
                setShowCategoryModal(true);
              }}
              className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              + Add Category
            </button>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Categories List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b">
                  <h2 className="font-semibold text-gray-900">
                    Categories ({categories.length})
                  </h2>
                </div>
                <div className="divide-y max-h-96 overflow-y-auto">
                  {categories.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No categories yet
                    </div>
                  ) : (
                    categories.map((category) => (
                      <div
                        key={category._id}
                        onClick={() => handleSelectCategory(category)}
                        className={`p-3 cursor-pointer transition ${
                          selectedCategory?._id === category._id
                            ? "bg-blue-50 border-l-4 border-blue-600"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm truncate">
                              {category.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {category.subcategoryCount} subcategories
                            </p>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              category.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {category.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Subcategories & Actions */}
            <div className="lg:col-span-2">
              {selectedCategory ? (
                <div className="space-y-4">
                  {/* Category Details */}
                  <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                          {selectedCategory.name}
                        </h2>
                        {selectedCategory.description && (
                          <p className="text-gray-600 text-sm mt-1">
                            {selectedCategory.description}
                          </p>
                        )}
                      </div>
                      <span
                        className={`text-xs px-3 py-1 rounded-full ${
                          selectedCategory.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {selectedCategory.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => openEditCategoryModal(selectedCategory)}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          handleToggleCategoryStatus(selectedCategory._id)
                        }
                        className={`px-3 py-1 text-sm rounded transition ${
                          selectedCategory.isActive
                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {selectedCategory.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </div>

                  {/* Subcategories List */}
                  <div className="bg-white rounded-lg shadow">
                    <div className="p-4 border-b flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900">
                        Subcategories ({subcategories.length})
                      </h3>
                      <button
                        onClick={() => {
                          setEditingSubcategory(null);
                          setSubcategoryForm({ name: "", description: "" });
                          setShowSubcategoryModal(true);
                        }}
                        className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                      >
                        + Add
                      </button>
                    </div>

                    <div className="divide-y max-h-96 overflow-y-auto">
                      {subcategories.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          No subcategories yet
                        </div>
                      ) : (
                        subcategories.map((subcategory) => (
                          <div
                            key={subcategory._id}
                            className="p-4 hover:bg-gray-50 transition"
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 text-sm">
                                  {subcategory.name}
                                </p>
                                {subcategory.description && (
                                  <p className="text-xs text-gray-600 mt-1">
                                    {subcategory.description}
                                  </p>
                                )}
                              </div>
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  subcategory.isActive
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {subcategory.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>

                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() =>
                                  openEditSubcategoryModal(subcategory)
                                }
                                className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() =>
                                  handleToggleSubcategoryStatus(subcategory._id)
                                }
                                className={`text-xs px-2 py-1 rounded transition ${
                                  subcategory.isActive
                                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                                    : "bg-green-100 text-green-700 hover:bg-green-200"
                                }`}
                              >
                                {subcategory.isActive
                                  ? "Deactivate"
                                  : "Activate"}
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <p className="text-gray-500">
                    Select a category to view details
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Category Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-sm w-full">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingCategory ? "Edit Category" : "Add Category"}
                </h2>
              </div>

              <form
                onSubmit={
                  editingCategory ? handleUpdateCategory : handleCreateCategory
                }
                className="p-6 space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, name: e.target.value })
                    }
                    placeholder="Category name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Description (optional)"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={closeModals}
                    className="flex-1 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    {editingCategory ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Subcategory Modal */}
        {showSubcategoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-sm w-full">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingSubcategory ? "Edit Subcategory" : "Add Subcategory"}
                </h2>
              </div>

              <form
                onSubmit={
                  editingSubcategory
                    ? handleUpdateSubcategory
                    : handleCreateSubcategory
                }
                className="p-6 space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={subcategoryForm.name}
                    onChange={(e) =>
                      setSubcategoryForm({
                        ...subcategoryForm,
                        name: e.target.value,
                      })
                    }
                    placeholder="Subcategory name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={subcategoryForm.description}
                    onChange={(e) =>
                      setSubcategoryForm({
                        ...subcategoryForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Description (optional)"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={closeModals}
                    className="flex-1 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    {editingSubcategory ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
