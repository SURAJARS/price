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

interface PricingData {
  fixed: boolean;
  calculationType: "percentage" | "value";
  pl1: {
    price: number;
    remarks: string;
  };
  pl2: {
    price: number;
    adjustment: number;
    remarks: string;
  };
  pl3: {
    price: number;
    adjustment: number;
    remarks: string;
  };
  pl4: {
    price: number;
    adjustment: number;
    remarks: string;
  };
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
  purchasePrice: number;
  pricing: PricingData;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    englishName: "",
    tamilName: "",
    categoryId: "",
    subcategoryId: "",
    sku: "",
    giftCode: "",
    brand: "",
    description: "",
    purchasePrice: "",
  });

  const [pricing, setPricing] = useState<PricingData>({
    fixed: true,
    calculationType: "percentage",
    pl1: { price: 0, remarks: "" },
    pl2: { price: 0, adjustment: 0, remarks: "" },
    pl3: { price: 0, adjustment: 0, remarks: "" },
    pl4: { price: 0, adjustment: 0, remarks: "" },
  });

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated || !isOwner) {
      router.push("/login");
    }
  }, [isAuthenticated, isOwner, router]);

  // Load product data
  useEffect(() => {
    loadProduct();
  }, [productId]);

  // Load categories when component mounts
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

  const loadProduct = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getProductDetails(productId);
      const prod = res.data;

      setProduct(prod);
      setForm({
        englishName: prod.englishName,
        tamilName: prod.tamilName || "",
        categoryId: prod.category?._id || "",
        subcategoryId: prod.subcategory?._id || "",
        sku: prod.sku || "",
        giftCode: prod.giftCode || "",
        brand: prod.brand || "",
        description: prod.description || "",
        purchasePrice: prod.purchasePrice.toString(),
      });

      setPricing(prod.pricing);

      if (prod.image) {
        setImagePreview(prod.image);
      }

      // Load subcategories if category exists
      if (prod.category?._id) {
        await loadSubcategories(prod.category._id);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await apiClient.getCategories();
      setCategories(res.data || []);
    } catch (err) {
      console.error("Failed to load categories");
    }
  };

  const loadSubcategories = async (categoryId: string) => {
    try {
      const res = await apiClient.getSubcategories(categoryId);
      setSubcategories(res.data || []);
    } catch (err) {
      console.error("Failed to load subcategories");
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

  const handlePricingChange = (field: string, subField: string, value: any) => {
    setPricing((prev) => ({
      ...prev,
      [field]: {
        ...(prev as any)[field],
        [subField]: value,
      },
    }));
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
      await new Promise((resolve) => setTimeout(resolve, 500));
      loadProduct();
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
      await apiClient.updateProduct(productId, { image: "" });
      setImagePreview(null);
      setSuccess("Image removed successfully");
    } catch (err: any) {
      setError("Failed to remove image");
    } finally {
      setUploading(false);
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

      const purchasePrice = parseFloat(form.purchasePrice) || 0;
      if (purchasePrice <= 0) {
        setError("Purchase price must be greater than 0");
        return;
      }

      await apiClient.updateProduct(productId, {
        englishName: form.englishName,
        tamilName: form.tamilName,
        categoryId: form.categoryId,
        subcategoryId: form.subcategoryId,
        sku: form.sku,
        giftCode: form.giftCode,
        brand: form.brand,
        description: form.description,
        purchasePrice,
        pricing,
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading product...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <Navigation />

      <div className="p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/admin/products"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm mb-4 inline-block"
            >
              ← Back to Products
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Edit Product
            </h1>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-200 rounded-lg text-sm">
              {success}
            </div>
          )}

          {/* Product Info Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Basic Information
            </h2>

            {/* Image Section */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Product Image
              </h3>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  {imagePreview && (
                    <div className="mb-3">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-300 dark:border-slate-600"
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <label className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition cursor-pointer text-center text-sm">
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
                        className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Product Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  English Name *
                </label>
                <input
                  type="text"
                  name="englishName"
                  value={form.englishName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Gift Code
                </label>
                <input
                  type="text"
                  name="giftCode"
                  value={form.giftCode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Purchase Price (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="purchasePrice"
                  value={form.purchasePrice}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
                rows={3}
              />
            </div>

            {/* Pricing Section */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Pricing Configuration
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Pricing Mode
                  </label>
                  <select
                    value={pricing.fixed ? "fixed" : "auto"}
                    onChange={(e) =>
                      setPricing((prev) => ({
                        ...prev,
                        fixed: e.target.value === "fixed",
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
                  >
                    <option value="fixed">Fixed (Manual Prices)</option>
                    <option value="auto">Auto (Calculate from PL1)</option>
                  </select>
                </div>

                {!pricing.fixed && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Calculation Type
                    </label>
                    <select
                      value={pricing.calculationType}
                      onChange={(e) =>
                        setPricing((prev) => ({
                          ...prev,
                          calculationType: e.target.value as any,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="value">Value (₹)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Price Levels */}
              <div className="space-y-4">
                {/* PL1 */}
                <div className="p-3 bg-white dark:bg-slate-800 rounded border border-gray-300 dark:border-slate-600">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    PL1 – B2C Retail
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Price (₹)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={pricing.pl1.price}
                        onChange={(e) =>
                          handlePricingChange(
                            "pl1",
                            "price",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Remarks
                      </label>
                      <input
                        type="text"
                        value={pricing.pl1.remarks}
                        onChange={(e) =>
                          handlePricingChange("pl1", "remarks", e.target.value)
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
                      />
                    </div>
                  </div>
                </div>

                {/* PL2 */}
                <div className="p-3 bg-white dark:bg-slate-800 rounded border border-gray-300 dark:border-slate-600">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    PL2 – B2C Bulk
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {!pricing.fixed && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {pricing.calculationType === "percentage"
                            ? "Discount (%)"
                            : "Reduction (₹)"}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={pricing.pl2.adjustment}
                          onChange={(e) =>
                            handlePricingChange(
                              "pl2",
                              "adjustment",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Price (₹)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={pricing.pl2.price}
                        onChange={(e) =>
                          handlePricingChange(
                            "pl2",
                            "price",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        disabled={!pricing.fixed}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700 disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Remarks
                      </label>
                      <input
                        type="text"
                        value={pricing.pl2.remarks}
                        onChange={(e) =>
                          handlePricingChange("pl2", "remarks", e.target.value)
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
                      />
                    </div>
                  </div>
                </div>

                {/* PL3 */}
                <div className="p-3 bg-white dark:bg-slate-800 rounded border border-gray-300 dark:border-slate-600">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    PL3 – B2B Retail
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {!pricing.fixed && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {pricing.calculationType === "percentage"
                            ? "Discount (%)"
                            : "Reduction (₹)"}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={pricing.pl3.adjustment}
                          onChange={(e) =>
                            handlePricingChange(
                              "pl3",
                              "adjustment",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Price (₹)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={pricing.pl3.price}
                        onChange={(e) =>
                          handlePricingChange(
                            "pl3",
                            "price",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        disabled={!pricing.fixed}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700 disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Remarks
                      </label>
                      <input
                        type="text"
                        value={pricing.pl3.remarks}
                        onChange={(e) =>
                          handlePricingChange("pl3", "remarks", e.target.value)
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
                      />
                    </div>
                  </div>
                </div>

                {/* PL4 */}
                <div className="p-3 bg-white dark:bg-slate-800 rounded border border-gray-300 dark:border-slate-600">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    PL4 – B2B Wholesale
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {!pricing.fixed && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {pricing.calculationType === "percentage"
                            ? "Discount (%)"
                            : "Reduction (₹)"}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={pricing.pl4.adjustment}
                          onChange={(e) =>
                            handlePricingChange(
                              "pl4",
                              "adjustment",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Price (₹)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={pricing.pl4.price}
                        onChange={(e) =>
                          handlePricingChange(
                            "pl4",
                            "price",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        disabled={!pricing.fixed}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700 disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Remarks
                      </label>
                      <input
                        type="text"
                        value={pricing.pl4.remarks}
                        onChange={(e) =>
                          handlePricingChange("pl4", "remarks", e.target.value)
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition"
              >
                Delete Product
              </button>
              <Link
                href="/admin/products"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition text-center"
              >
                Cancel
              </Link>
            </div>
          </form>

          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 max-w-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Delete Product?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  This action cannot be undone. The product will be permanently
                  deleted.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteProduct}
                    className="flex-1 px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
