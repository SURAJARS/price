"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/services/apiClient";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import Link from "next/link";

interface Variant {
  _id: string;
  packSize: string;
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
}

export default function PricingPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const { isAuthenticated, isOwner } = useAuthStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [priceForm, setPriceForm] = useState({
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

  // Load product and variants
  useEffect(() => {
    loadData();
  }, [productId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productRes, variantsRes] = await Promise.all([
        apiClient.getProductDetails(productId),
        apiClient.getProductVariants(productId),
      ]);

      setProduct(productRes.data);
      setVariants(variantsRes.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (variant: Variant) => {
    setEditingVariantId(variant._id);
    setPriceForm({
      purchaseCost: variant.purchaseCost.toString(),
      b2bPrice: variant.b2bPrice.toString(),
      b2cPrice: variant.b2cPrice.toString(),
    });
    setError("");
  };

  const cancelEdit = () => {
    setEditingVariantId(null);
    setPriceForm({ purchaseCost: "", b2bPrice: "", b2cPrice: "" });
  };

  const handleSavePrice = async (variantId: string) => {
    try {
      setSaving(true);
      setError("");

      const purchaseCost = priceForm.purchaseCost
        ? parseFloat(priceForm.purchaseCost)
        : undefined;
      const b2bPrice = priceForm.b2bPrice
        ? parseFloat(priceForm.b2bPrice)
        : undefined;
      const b2cPrice = priceForm.b2cPrice
        ? parseFloat(priceForm.b2cPrice)
        : undefined;

      if (
        purchaseCost === undefined ||
        b2bPrice === undefined ||
        b2cPrice === undefined
      ) {
        setError("All price fields are required");
        return;
      }

      await apiClient.updateVariantPrices(productId, variantId, {
        purchaseCost,
        b2bPrice,
        b2cPrice,
      });

      setSuccess("Price updated successfully");
      setEditingVariantId(null);
      loadData();
      setTimeout(() => setSuccess(""), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update price");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading pricing data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin/products"
            className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block"
          >
            ← Back to Products
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Pricing Management
            </h1>
            {product && (
              <p className="text-gray-600 text-sm mt-1">
                {product.englishName}
                {product.tamilName && ` (${product.tamilName})`}
              </p>
            )}
          </div>
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

        {/* Variants Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Variant
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                    Purchase Cost
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                    B2B Price
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                    B2C Price
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
                {variants.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No variants found
                    </td>
                  </tr>
                ) : (
                  variants.map((variant) => (
                    <tr key={variant._id} className="hover:bg-gray-50">
                      {editingVariantId === variant._id ? (
                        <>
                          <td className="px-4 py-3">
                            <div className="text-sm">
                              <p className="font-medium text-gray-900">
                                {variant.packSize} {variant.unit}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              step="0.01"
                              value={priceForm.purchaseCost}
                              onChange={(e) =>
                                setPriceForm((prev) => ({
                                  ...prev,
                                  purchaseCost: e.target.value,
                                }))
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              step="0.01"
                              value={priceForm.b2bPrice}
                              onChange={(e) =>
                                setPriceForm((prev) => ({
                                  ...prev,
                                  b2bPrice: e.target.value,
                                }))
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              step="0.01"
                              value={priceForm.b2cPrice}
                              onChange={(e) =>
                                setPriceForm((prev) => ({
                                  ...prev,
                                  b2cPrice: e.target.value,
                                }))
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                variant.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {variant.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => handleSavePrice(variant._id)}
                                disabled={saving}
                                className="text-green-600 hover:text-green-800 text-sm font-medium disabled:opacity-50"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="text-gray-600 hover:text-gray-800 text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3">
                            <div className="text-sm">
                              <p className="font-medium text-gray-900">
                                {variant.packSize} {variant.unit}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-gray-900">
                            ₹{variant.purchaseCost.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-gray-900">
                            ₹{variant.b2bPrice.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-gray-900">
                            ₹{variant.b2cPrice.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                variant.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {variant.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => startEdit(variant)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                Edit
                              </button>
                              <Link
                                href={`/admin/products/${productId}/history`}
                                className="text-purple-600 hover:text-purple-800 text-sm"
                              >
                                History
                              </Link>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
