"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/services/apiClient";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import Link from "next/link";

interface Product {
  _id: string;
  englishName: string;
  tamilName?: string;
  category: { _id: string; name: string };
  subcategory?: { _id: string; name: string };
  sku?: string;
  brand?: string;
  isActive: boolean;
  variantCount: number;
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
    if (!isAuthenticated || !isOwner) {
      router.push("/login");
    }
  }, [isAuthenticated, isOwner, router]);

  // Load categories and products
  useEffect(() => {
    loadCategories();
    loadProducts();
  }, [page, selectedCategory, statusFilter]);

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
      setProducts(response.data?.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (productId: string) => {
    try {
      await apiClient.toggleProductStatus(productId);
      setSuccess("Product status updated");
      loadProducts();
      setTimeout(() => setSuccess(""), 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to update product status",
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Product Management
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Manage products and their variants
            </p>
          </div>
          <Link
            href="/admin/products/new"
            className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center"
          >
            + Add Product
          </Link>
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

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                <option value="">All Products</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Variants
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    SKU
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No products found
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">
                            {product.englishName}
                          </p>
                          {product.tamilName && (
                            <p className="text-sm text-gray-600">
                              {product.tamilName}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        {product.category?.name}
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        {product.variantCount}
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        {product.sku || "-"}
                      </td>
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
                          className="px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex gap-2 justify-center">
                          <Link
                            href={`/admin/products/${product._id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Edit
                          </Link>
                          <Link
                            href={`/admin/products/${product._id}/pricing`}
                            className="text-green-600 hover:text-green-800 text-sm"
                          >
                            Pricing
                          </Link>
                          <Link
                            href={`/admin/products/${product._id}/history`}
                            className="text-purple-600 hover:text-purple-800 text-sm"
                          >
                            History
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
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-gray-600">Page {page}</span>
            <button
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
