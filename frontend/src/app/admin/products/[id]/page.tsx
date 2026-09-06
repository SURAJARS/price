"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/services/apiClient";
import { useRouter, useParams } from "next/navigation";
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
}

interface Variant {
  _id: string;
  packSize: number;
  unit: string;
  purchaseCost: number;
  b2bPrice: number;
  b2cPrice: number;
  isActive: boolean;
}

interface Product {
  _id: string;
  englishName: string;
  tamilName?: string;
  categoryId: string;
  subcategoryId?: string;
  sku?: string;
  brand?: string;
  description?: string;
  image?: string;
  isActive: boolean;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const { isAuthenticated, isOwner } = useAuthStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddVariant, setShowAddVariant] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    englishName: "",
    tamilName: "",
    categoryId: "",
    subcategoryId: "",
    sku: "",
    brand: "",
    description: "",
  });

  const [variantForm, setVariantForm] = useState({
    packSize: "",
    unit: "KG",
    purchaseCost: "",
    b2bPrice: "",
    b2cPrice: "",
  });

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated || !isOwner) {
      router.push("/login");
    }
  }, [isAuthenticated, isOwner, router]);

  // Load data
  useEffect(() => {
    loadData();
  }, [productId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productRes, categoriesRes, variantsRes] = await Promise.all([
        apiClient.getProductDetails(productId),
        apiClient.getCategories(),
        apiClient.getProductVariants(productId),
      ]);

      const prod = productRes.data;
      setProduct(prod);
      setForm({
        englishName: prod.englishName,
        tamilName: prod.tamilName || "",
        categoryId: prod.category?._id || "",
        subcategoryId: prod.subcategory?._id || "",
        sku: prod.sku || "",
        brand: prod.brand || "",
        description: prod.description || "",
      });

      if (prod.image) {
        setImagePreview(prod.image);
      }

      setVariants(variantsRes.data || []);
      setCategories(categoriesRes.data || []);

      if (prod.category?._id) {
        const subcRes = await apiClient.getSubcategories(prod.category._id);
        setSubcategories(subcRes.data || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load product");
    } finally {
      setLoading(false);
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

  const handleCategoryChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const categoryId = e.target.value;
    setForm((prev) => ({
      ...prev,
      categoryId,
      subcategoryId: "",
    }));

    if (categoryId) {
      try {
        const res = await apiClient.getSubcategories(categoryId);
        setSubcategories(res.data || []);
      } catch (err) {
        console.error("Failed to load subcategories");
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError("");
      await apiClient.uploadProductImage(productId, file);
      setSuccess("Image uploaded successfully");
      // Reload product to get updated image
      await new Promise((resolve) => setTimeout(resolve, 500));
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    try {
      setUploading(true);
      setError("");
      await apiClient.updateProduct(productId, { image: null });
      setImagePreview(null);
      setSuccess("Image removed successfully");
    } catch (err: any) {
      setError("Failed to remove image");
    } finally {
      setUploading(false);
    }
  };

  const handleVariantInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setVariantForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError("");

      if (
        !variantForm.packSize ||
        !variantForm.unit ||
        !variantForm.purchaseCost ||
        !variantForm.b2bPrice ||
        !variantForm.b2cPrice
      ) {
        setError("All variant fields are required");
        return;
      }

      await apiClient.createVariant(productId, {
        packSize: variantForm.packSize,
        unit: variantForm.unit,
        purchaseCost: Number(variantForm.purchaseCost),
        b2bPrice: Number(variantForm.b2bPrice),
        b2cPrice: Number(variantForm.b2cPrice),
      });

      setSuccess("Variant added successfully");
      setVariantForm({
        packSize: "",
        unit: "KG",
        purchaseCost: "",
        b2bPrice: "",
        b2cPrice: "",
      });
      setShowAddVariant(false);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add variant");
    }
  };

  const handleToggleVariantStatus = async (variantId: string) => {
    try {
      setError("");
      await apiClient.toggleVariantStatus(productId, variantId);
      setSuccess("Variant status updated");
      await loadData();
    } catch (err: any) {
      setError("Failed to update variant status");
    }
  };

  const handleDeleteProduct = async () => {
    try {
      setError("");
      await apiClient.deleteProduct(productId);
      setSuccess("Product deleted permanently");
      setTimeout(() => router.push("/admin/products"), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete product");
    } finally {
      setShowDeleteConfirm(false);
    }
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

      await apiClient.updateProduct(productId, {
        englishName: form.englishName,
        tamilName: form.tamilName,
        categoryId: form.categoryId,
        subcategoryId: form.subcategoryId,
        sku: form.sku,
        brand: form.brand,
        description: form.description,
      });

      setSuccess("Product updated successfully");
      setTimeout(() => router.push("/admin/products"), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/admin/products"
              className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block"
            >
              ← Back to Products
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Edit Product
            </h1>
          </div>

          {/* Messages */}
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

          {/* Product Info Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow p-6 mb-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Basic Information
            </h2>

            {/* Image Section */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Product Image
              </h3>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  {imagePreview && (
                    <div className="mb-3">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <label className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer text-center text-sm">
                      {imagePreview ? "Replace Image" : "Upload Image"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleUploadImage}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        disabled={uploading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  English Name *
                </label>
                <input
                  type="text"
                  name="englishName"
                  value={form.englishName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tamil Name
                </label>
                <input
                  type="text"
                  name="tamilName"
                  value={form.tamilName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleCategoryChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategory
                </label>
                <select
                  name="subcategoryId"
                  value={form.subcategoryId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU
                </label>
                <input
                  type="text"
                  name="sku"
                  value={form.sku}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  value={form.brand}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete Product
              </button>
              <Link
                href="/admin/products"
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition text-center"
              >
                Cancel
              </Link>
            </div>
          </form>

          {/* Variants Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Variants</h2>
              <button
                onClick={() => setShowAddVariant(!showAddVariant)}
                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
              >
                {showAddVariant ? "Cancel" : "+ Add Variant"}
              </button>
            </div>

            {/* Add Variant Form */}
            {showAddVariant && (
              <form
                onSubmit={handleAddVariant}
                className="mb-6 p-4 bg-gray-50 rounded-lg"
              >
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Pack Size *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="packSize"
                      value={variantForm.packSize}
                      onChange={handleVariantInputChange}
                      className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white text-sm"
                      placeholder="e.g., 500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Unit *
                    </label>
                    <select
                      name="unit"
                      value={variantForm.unit}
                      onChange={handleVariantInputChange}
                      className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white text-sm"
                    >
                      <option value="KG">KG</option>
                      <option value="L">L</option>
                      <option value="G">G</option>
                      <option value="ML">ML</option>
                      <option value="PIECE">PIECE</option>
                      <option value="DOZEN">DOZEN</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Purchase Cost *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="purchaseCost"
                      value={variantForm.purchaseCost}
                      onChange={handleVariantInputChange}
                      className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white text-sm"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      B2B Price *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="b2bPrice"
                      value={variantForm.b2bPrice}
                      onChange={handleVariantInputChange}
                      className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white text-sm"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      B2C Price *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="b2cPrice"
                      value={variantForm.b2cPrice}
                      onChange={handleVariantInputChange}
                      className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white text-sm"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-3 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Add Variant
                </button>
              </form>
            )}

            {/* Variants Table */}
            {variants.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left py-2 px-2 font-semibold text-gray-900">
                        Pack Size
                      </th>
                      <th className="text-left py-2 px-2 font-semibold text-gray-900">
                        Unit
                      </th>
                      <th className="text-right py-2 px-2 font-semibold text-gray-900">
                        Purchase Cost
                      </th>
                      <th className="text-right py-2 px-2 font-semibold text-gray-900">
                        B2B Price
                      </th>
                      <th className="text-right py-2 px-2 font-semibold text-gray-900">
                        B2C Price
                      </th>
                      <th className="text-center py-2 px-2 font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="text-center py-2 px-2 font-semibold text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((variant) => (
                      <tr
                        key={variant._id}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="py-2 px-2 text-gray-900">
                          {variant.packSize}
                        </td>
                        <td className="py-2 px-2 text-gray-900">
                          {variant.unit}
                        </td>
                        <td className="py-2 px-2 text-right text-gray-900">
                          ₹{variant.purchaseCost.toFixed(2)}
                        </td>
                        <td className="py-2 px-2 text-right text-gray-900">
                          ₹{variant.b2bPrice.toFixed(2)}
                        </td>
                        <td className="py-2 px-2 text-right text-gray-900">
                          ₹{variant.b2cPrice.toFixed(2)}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <span
                            className={`px-2 py-1 rounded text-white text-xs font-medium ${
                              variant.isActive ? "bg-green-600" : "bg-gray-400"
                            }`}
                          >
                            {variant.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-center">
                          <div className="flex gap-1 justify-center flex-wrap">
                            <Link
                              href={`/admin/products/${productId}/variants/${variant._id}/prices`}
                              className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition"
                            >
                              Pricing
                            </Link>
                            <Link
                              href={`/admin/products/${productId}/variants/${variant._id}/history`}
                              className="px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition"
                            >
                              History
                            </Link>
                            <button
                              onClick={() =>
                                handleToggleVariantStatus(variant._id)
                              }
                              className={`px-2 py-1 rounded text-xs text-white transition ${
                                variant.isActive
                                  ? "bg-red-600 hover:bg-red-700"
                                  : "bg-green-600 hover:bg-green-700"
                              }`}
                            >
                              {variant.isActive ? "Deactivate" : "Activate"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center py-4 text-gray-600">
                No variants yet. Add one using the button above.
              </p>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm">
              <h3 className="text-lg font-semibold text-red-600 mb-2">
                Delete Product Permanently?
              </h3>
              <p className="text-gray-700 mb-4">
                Delete this product permanently? This will permanently remove
                the product, its variants, and their price history. This action
                cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteProduct}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                >
                  Delete Permanently
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
