"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/services/apiClient";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import Navigation from "@/components/Navigation";
import { useLanguageStore } from "@/stores/languageStore";
import { t } from "@/lib/translations";

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
  const { language } = useLanguageStore();

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
    if (!isAuthenticated || !isOwner) {
      return;
    }

    loadCategories();
  }, [isAuthenticated, isOwner]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.getCategories();
      setCategories(response.data || []);
    } catch (err: any) {
      setError(
        err.response?.data?.message || t("categories.failedToLoad", language),
      );
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
      setError(
        err.response?.data?.message ||
          t("categories.failedToLoadSubcategories", language),
      );
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
        setError(t("categories.nameRequired", language));
        return;
      }

      await apiClient.createCategory(
        categoryForm.name,
        categoryForm.description,
      );

      setSuccess(t("categories.categoryCreated", language));

      setCategoryForm({
        name: "",
        description: "",
      });

      setShowCategoryModal(false);
      loadCategories();

      setTimeout(() => setSuccess(""), 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.message || t("categories.failedToCreate", language),
      );
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!categoryForm.name.trim() || !editingCategory) {
        setError(t("categories.nameRequired", language));
        return;
      }

      await apiClient.updateCategory(
        editingCategory._id,
        categoryForm.name,
        categoryForm.description,
      );

      setSuccess(t("categories.categoryUpdated", language));

      setCategoryForm({
        name: "",
        description: "",
      });

      setEditingCategory(null);
      setShowCategoryModal(false);

      loadCategories();

      setTimeout(() => setSuccess(""), 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.message || t("categories.failedToUpdate", language),
      );
    }
  };

  const handleToggleCategoryStatus = async (categoryId: string) => {
    try {
      await apiClient.toggleCategoryStatus(categoryId);

      setSuccess(t("categories.categoryStatusUpdated", language));

      loadCategories();

      if (selectedCategory?._id === categoryId) {
        const updatedCategory = categories.find(
          (category) => category._id === categoryId,
        );

        if (updatedCategory) {
          setSelectedCategory({
            ...updatedCategory,
            isActive: !updatedCategory.isActive,
          });
        }
      }

      setTimeout(() => setSuccess(""), 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          t("categories.failedToUpdateStatus", language),
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
        setError(t("categories.selectCategoryFirst", language));
        return;
      }

      if (!subcategoryForm.name.trim()) {
        setError(t("categories.subcategoryNameRequired", language));
        return;
      }

      await apiClient.createSubcategory(
        selectedCategory._id,
        subcategoryForm.name,
        subcategoryForm.description,
      );

      setSuccess(t("categories.subcategoryCreated", language));

      setSubcategoryForm({
        name: "",
        description: "",
      });

      setShowSubcategoryModal(false);

      loadSubcategories(selectedCategory._id);
      loadCategories();

      setTimeout(() => setSuccess(""), 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          t("categories.failedToCreateSubcategory", language),
      );
    }
  };

  const handleUpdateSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!selectedCategory || !editingSubcategory) {
        setError(t("categories.selectionError", language));
        return;
      }

      if (!subcategoryForm.name.trim()) {
        setError(t("categories.subcategoryNameRequired", language));
        return;
      }

      await apiClient.updateSubcategory(
        selectedCategory._id,
        editingSubcategory._id,
        subcategoryForm.name,
        subcategoryForm.description,
      );

      setSuccess(t("categories.subcategoryUpdated", language));

      setSubcategoryForm({
        name: "",
        description: "",
      });

      setEditingSubcategory(null);
      setShowSubcategoryModal(false);

      loadSubcategories(selectedCategory._id);

      setTimeout(() => setSuccess(""), 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          t("categories.failedToUpdateSubcategory", language),
      );
    }
  };

  const handleToggleSubcategoryStatus = async (subcategoryId: string) => {
    try {
      if (!selectedCategory) return;

      await apiClient.toggleSubcategoryStatus(
        selectedCategory._id,
        subcategoryId,
      );

      setSuccess(t("categories.subcategoryStatusUpdated", language));

      loadSubcategories(selectedCategory._id);

      setTimeout(() => setSuccess(""), 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          t("categories.failedToUpdateSubcategoryStatus", language),
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

    setCategoryForm({
      name: "",
      description: "",
    });

    setSubcategoryForm({
      name: "",
      description: "",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>

          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {t("common.loading", language)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <Navigation />

      <div className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {t("categories.management", language)}
              </h1>

              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                {t("categories.manageDescription", language)}
              </p>
            </div>

            <button
              onClick={() => {
                setEditingCategory(null);

                setCategoryForm({
                  name: "",
                  description: "",
                });

                setShowCategoryModal(true);
              }}
              className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {t("categories.addCategoryButton", language)}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-200 rounded-lg text-sm">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Categories List */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow">
                <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                  <h2 className="font-semibold text-gray-900 dark:text-white">
                    {t("categories.categoryCount", language)} (
                    {categories.length})
                  </h2>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-slate-700 max-h-96 overflow-y-auto">
                  {categories.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                      {t("categories.noCategories", language)}
                    </div>
                  ) : (
                    categories.map((category) => (
                      <div
                        key={category._id}
                        onClick={() => handleSelectCategory(category)}
                        className={`p-3 cursor-pointer transition ${
                          selectedCategory?._id === category._id
                            ? "bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-600"
                            : "hover:bg-gray-50 dark:hover:bg-slate-700"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                              {category.name}
                            </p>

                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {category.subcategoryCount}{" "}
                              {t("categories.subcategoriesCount", language)}
                            </p>
                          </div>

                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              category.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {category.isActive
                              ? t("common.active", language)
                              : t("common.inactive", language)}
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
                  <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {selectedCategory.name}
                        </h2>

                        {selectedCategory.description && (
                          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
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
                        {selectedCategory.isActive
                          ? t("common.active", language)
                          : t("common.inactive", language)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => openEditCategoryModal(selectedCategory)}
                        className="px-3 py-1 text-sm bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-slate-600 transition"
                      >
                        {t("categories.edit", language)}
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
                        {selectedCategory.isActive
                          ? t("categories.deactivate", language)
                          : t("categories.activate", language)}
                      </button>
                    </div>
                  </div>

                  {/* Subcategories */}
                  <div className="bg-white dark:bg-slate-800 rounded-lg shadow">
                    <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {t("categories.subcategories", language)} (
                        {subcategories.length})
                      </h3>

                      <button
                        onClick={() => {
                          setEditingSubcategory(null);

                          setSubcategoryForm({
                            name: "",
                            description: "",
                          });

                          setShowSubcategoryModal(true);
                        }}
                        className="text-sm px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition"
                      >
                        {t("categories.addSubcategory", language)}
                      </button>
                    </div>

                    <div className="divide-y divide-gray-200 dark:divide-slate-700 max-h-96 overflow-y-auto">
                      {subcategories.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                          {t("categories.noSubcategories", language)}
                        </div>
                      ) : (
                        subcategories.map((subcategory) => (
                          <div
                            key={subcategory._id}
                            className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition border-b border-gray-200 dark:border-slate-700"
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 dark:text-white text-sm">
                                  {subcategory.name}
                                </p>

                                {subcategory.description && (
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
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
                                {subcategory.isActive
                                  ? t("common.active", language)
                                  : t("common.inactive", language)}
                              </span>
                            </div>

                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() =>
                                  openEditSubcategoryModal(subcategory)
                                }
                                className="text-xs px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-slate-600 transition"
                              >
                                {t("categories.edit", language)}
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
                                  ? t("categories.deactivate", language)
                                  : t("categories.activate", language)}
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    {t("categories.selectCategory", language)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Category Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-sm w-full">
              <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingCategory
                    ? t("categories.editCategory", language)
                    : t("categories.addCategory", language)}
                </h2>
              </div>

              <form
                onSubmit={
                  editingCategory ? handleUpdateCategory : handleCreateCategory
                }
                className="p-6 space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("categories.name", language)} *
                  </label>

                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        name: e.target.value,
                      })
                    }
                    placeholder={t(
                      "categories.categoryNamePlaceholder",
                      language,
                    )}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("categories.description", language)}
                  </label>

                  <textarea
                    value={categoryForm.description}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        description: e.target.value,
                      })
                    }
                    placeholder={t(
                      "categories.descriptionPlaceholder",
                      language,
                    )}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={closeModals}
                    className="flex-1 px-4 py-2 text-sm bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition"
                  >
                    {t("common.cancel", language)}
                  </button>

                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    {editingCategory
                      ? t("categories.update", language)
                      : t("categories.create", language)}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Subcategory Modal */}
        {showSubcategoryModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-sm w-full">
              <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingSubcategory
                    ? t("categories.editSubcategory", language)
                    : t("categories.addSubcategory", language)}
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("categories.name", language)} *
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
                    placeholder={t(
                      "categories.subcategoryNamePlaceholder",
                      language,
                    )}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("categories.description", language)}
                  </label>

                  <textarea
                    value={subcategoryForm.description}
                    onChange={(e) =>
                      setSubcategoryForm({
                        ...subcategoryForm,
                        description: e.target.value,
                      })
                    }
                    placeholder={t(
                      "categories.descriptionPlaceholder",
                      language,
                    )}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={closeModals}
                    className="flex-1 px-4 py-2 text-sm bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition"
                  >
                    {t("common.cancel", language)}
                  </button>

                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    {editingSubcategory
                      ? t("categories.update", language)
                      : t("categories.create", language)}
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
