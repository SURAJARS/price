"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/services/apiClient";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import Navigation from "@/components/Navigation";
import Link from "next/link";

interface Category {
  _id: string;
  name: string;
}

interface Subcategory {
  _id: string;
  name: string;
  categoryId: string;
}

export default function AddProductPage() {
  const router = useRouter();
  const { isAuthenticated, isOwner } = useAuthStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    englishName: "",
    tamilName: "",
    categoryId: "",
    subcategoryId: "",
    sku: "",
    brand: "",
    description: "",
    variants: [
      {
        packSize: "",
        unit: "KG",
        purchaseCost: "",
        b2bPrice: "",
        b2cPrice: "",
      },
    ],
  });

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

  // Load subcategories when category changes
  useEffect(() => {
    if (form.categoryId) {
      loadSubcategories(form.categoryId);
    } else {
      setSubcategories([]);
    }
  }, [form.categoryId]);

  const loadCategories = async () => {
    try {
      const response = await apiClient.getCategories();
      setCategories(response.data || []);
    } catch (err: any) {
      setError("Failed to load categories");
    }
  };

  const loadSubcategories = async (categoryId: string) => {
    try {
      const response = await apiClient.getSubcategories(categoryId);
      setSubcategories(response.data || []);
    } catch (err: any) {
      setError("Failed to load subcategories");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVariantChange = (index: number, field: string, value: string) => {
    const newVariants = [...form.variants];
    newVariants[index] = {
      ...newVariants[index],
      [field]: value,
    };
    setForm((prev) => ({
      ...prev,
      variants: newVariants,
    }));
  };

  const addVariant = () => {
    setForm((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          packSize: "",
          unit: "KG",
          purchaseCost: "",
          b2bPrice: "",
          b2cPrice: "",
        },
      ],
    }));
  };

  const removeVariant = (index: number) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      if (!form.englishName.trim() || !form.categoryId) {
        setError("Product name and category are required");
        return;
      }

      if (form.variants.length === 0) {
        setError("At least one variant is required");
        return;
      }

      // Validate variants
      for (const variant of form.variants) {
        if (
          !variant.packSize ||
          !variant.purchaseCost ||
          !variant.b2bPrice ||
          !variant.b2cPrice
        ) {
          setError("All variant fields are required");
          return;
        }
      }

      // Create product
      const productResponse = await apiClient.createProduct({
        englishName: form.englishName,
        tamilName: form.tamilName,
        categoryId: form.categoryId,
        subcategoryId: form.subcategoryId,
        sku: form.sku,
        brand: form.brand,
        description: form.description,
      });

      const productId = productResponse.data._id;

      // Create variants
      for (const variant of form.variants) {
        await apiClient.createVariant(productId, {
          packSize: variant.packSize,
          unit: variant.unit,
          purchaseCost: parseFloat(variant.purchaseCost),
          b2bPrice: parseFloat(variant.b2bPrice),
          b2cPrice: parseFloat(variant.b2cPrice),
        });
      }

      router.push("/admin/products");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <Navigation />
      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/admin/products"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm mb-4 inline-block"
            >
              ← Back to Products
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Add New Product
            </h1>
          </div>

          {/* Error Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    English Name *
                  </label>
                  <input
                    type="text"
                    name="englishName"
                    value={form.englishName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Corn Flour"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tamil Name
                  </label>
                  <input
                    type="text"
                    name="tamilName"
                    value={form.tamilName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., கார்ன் ஃப்ளோர்"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category *
                  </label>
                  <select
                    name="categoryId"
                    value={form.categoryId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subcategory
                  </label>
                  <select
                    name="subcategoryId"
                    value={form.subcategoryId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">None</option>
                    {subcategories.map((sub) => (
                      <option key={sub._id} value={sub._id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    SKU
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={form.sku}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., CF001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={form.brand}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., BrandName"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Product description..."
                  rows={3}
                />
              </div>
            </div>

            {/* Variants */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Variants *
                </h2>
                <button
                  type="button"
                  onClick={addVariant}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  + Add Variant
                </button>
              </div>

              <div className="space-y-4">
                {form.variants.map((variant, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium text-gray-900">
                        Variant {index + 1}
                      </h3>
                      {form.variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Pack Size *
                        </label>
                        <input
                          type="text"
                          value={variant.packSize}
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              "packSize",
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Unit *
                        </label>
                        <select
                          value={variant.unit}
                          onChange={(e) =>
                            handleVariantChange(index, "unit", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option>KG</option>
                          <option>L</option>
                          <option>G</option>
                          <option>ML</option>
                          <option>PIECE</option>
                          <option>DOZEN</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Purchase Cost *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={variant.purchaseCost}
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              "purchaseCost",
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0.00"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          B2B Price *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={variant.b2bPrice}
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              "b2bPrice",
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0.00"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          B2C Price *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={variant.b2cPrice}
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              "b2cPrice",
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Product"}
              </button>
              <Link
                href="/admin/products"
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
