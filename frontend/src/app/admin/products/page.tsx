"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/services/apiClient";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import Navigation from "@/components/Navigation";
import Link from "next/link";
import { useLanguageStore } from "@/stores/languageStore";
import { t } from "@/lib/translations";

interface Product {
  _id: string;
  englishName: string;
  tamilName?: string;
  category: { _id: string; name: string };
  subcategory?: { _id: string; name: string };
  sku?: string;
  brand?: string;
  pricing: {
    pl1: { price: number };
    pl2: { price: number };
    pl3: { price: number };
    pl4: { price: number };
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  _id: string;
  name: string;
}

export default function ProductsPage() {
  const router = useRouter();
  const { isAuthenticated, isOwner } = useAuthStore();
  const { language } = useLanguageStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(1);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!isOwner) {
      router.push("/staff/search");
    }
  }, [isAuthenticated, isOwner, router]);

  // Load categories and products
  useEffect(() => {
    if (!isAuthenticated || !isOwner) {
      return;
    }

    loadCategories();
    loadProducts();
  }, [isAuthenticated, isOwner, page, selectedCategory, statusFilter]);

  const loadCategories = async () => {
    try {
      const response = await apiClient.getCategories();
      setCategories(response.data || []);
    } catch (err: any) {
      console.error("Failed to load categories:", err);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const isActive =
        statusFilter === "active"
          ? true
          : statusFilter === "inactive"
            ? false
            : undefined;

      const response = await apiClient.getAllProducts(
        selectedCategory,
        undefined,
        page,
        20,
        isActive,
      );
      const filteredProducts = response.data?.data || [];

      setProducts(filteredProducts);
    } catch (err: any) {
      setError(
        err.response?.data?.message || t("products.failedToLoad", language),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (productId: string) => {
    try {
      await apiClient.toggleProductStatus(productId);

      setSuccess(t("products.statusUpdated", language));

      loadProducts();

      setTimeout(() => setSuccess(""), 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          t("products.failedToUpdateStatus", language),
      );
    }
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
                {t("products.management", language)}
              </h1>

              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Manage your grocery products and pricing
              </p>
            </div>

            <Link
              href="/admin/products/new"
              className="w-full md:w-auto px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition text-center"
            >
              {t("products.addProductButton", language)}
            </Link>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-200 rounded-lg text-sm">
              {success}
            </div>
          )}

          {/* Filters */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Category Filter */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("products.filterByCategory", language)}
                </label>

                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
                >
                  <option value="">
                    {t("products.allCategories", language)}
                  </option>

                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("products.filterByStatus", language)}
                </label>

                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
                >
                  <option value="">
                    {t("products.allProducts", language)}
                  </option>

                  <option value="active">{t("common.active", language)}</option>

                  <option value="inactive">
                    {t("common.inactive", language)}
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      {t("products.product", language)}
                    </th>

                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      {t("products.category", language)}
                    </th>

                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      {t("products.sku", language)}
                    </th>

                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      PL1 – Retail
                    </th>

                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      PL2 – Bulk
                    </th>

                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      PL3 – B2B
                    </th>

                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      PL4 – Wholesale
                    </th>

                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                      {t("products.status", language)}
                    </th>

                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                      {t("products.actions", language)}
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {products.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                      >
                        {t("products.noProducts", language)}
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr
                        key={product._id}
                        className="hover:bg-gray-50 dark:hover:bg-slate-700"
                      >
                        {/* Product */}
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {product.englishName}
                            </p>

                            {product.tamilName && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {product.tamilName}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-3 text-gray-900 dark:text-white">
                          {product.category?.name}
                        </td>

                        {/* SKU */}
                        <td className="px-4 py-3 text-gray-900 dark:text-white">
                          {product.sku || "-"}
                        </td>

                        {/* PL1 Price */}
                        <td className="px-4 py-3 text-gray-900 dark:text-white">
                          ₹{product.pricing?.pl1?.price?.toFixed(2) || "-"}
                        </td>

                        {/* PL2 Price */}
                        <td className="px-4 py-3 text-gray-900 dark:text-white">
                          ₹{product.pricing?.pl2?.price?.toFixed(2) || "-"}
                        </td>

                        {/* PL3 Price */}
                        <td className="px-4 py-3 text-gray-900 dark:text-white">
                          ₹{product.pricing?.pl3?.price?.toFixed(2) || "-"}
                        </td>

                        {/* PL4 Price */}
                        <td className="px-4 py-3 text-gray-900 dark:text-white">
                          ₹{product.pricing?.pl4?.price?.toFixed(2) || "-"}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3 text-center">
                          <select
                            value={product.isActive ? "active" : "inactive"}
                            onChange={(e) => {
                              if (
                                e.target.value !==
                                (product.isActive ? "active" : "inactive")
                              ) {
                                handleToggleStatus(product._id);
                              }
                            }}
                            className="px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
                          >
                            <option value="active">
                              {t("common.active", language)}
                            </option>

                            <option value="inactive">
                              {t("common.inactive", language)}
                            </option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-center">
                          <div className="flex gap-2 justify-center">
                            <Link
                              href={`/admin/products/${product._id}`}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                            >
                              {t("products.edit", language)}
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {products.length > 0 && (
            <div className="mt-6 flex justify-between items-center">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 disabled:opacity-50"
              >
                {t("products.previous", language)}
              </button>

              <span className="text-gray-600 dark:text-gray-400">
                {t("products.page", language)} {page}
              </span>

              <button
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600"
              >
                {t("products.next", language)}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
