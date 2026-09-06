"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/services/apiClient";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import Link from "next/link";

interface PriceHistoryRecord {
  _id: string;
  productVariantId: string;
  purchaseCost: number;
  b2bPrice: number;
  b2cPrice: number;
  changedBy: { _id: string; name: string; email: string };
  changedAt: string;
}

interface Variant {
  _id: string;
  packSize: string;
  unit: string;
}

interface Product {
  _id: string;
  englishName: string;
  tamilName?: string;
}

export default function PriceHistoryPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const { isAuthenticated, isOwner } = useAuthStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [history, setHistory] = useState<PriceHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated || !isOwner) {
      router.push("/login");
    }
  }, [isAuthenticated, isOwner, router]);

  // Load product and variants
  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const [productRes, variantsRes] = await Promise.all([
        apiClient.getProductDetails(productId),
        apiClient.getProductVariants(productId),
      ]);

      setProduct(productRes.data);
      const variantsList = variantsRes.data || [];
      setVariants(variantsList);

      if (variantsList.length > 0) {
        setSelectedVariantId(variantsList[0]._id);
        loadHistory(variantsList[0]._id);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async (variantId: string) => {
    try {
      setError("");
      const response = await apiClient.getPriceHistory(
        productId,
        variantId,
        50,
      );
      setHistory(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load history");
    }
  };

  const handleVariantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVariantId(e.target.value);
    loadHistory(e.target.value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading history...</p>
        </div>
      </div>
    );
  }

  const selectedVariant = variants.find((v) => v._id === selectedVariantId);

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
              Price History
            </h1>
            {product && (
              <p className="text-gray-600 text-sm mt-1">
                {product.englishName}
                {product.tamilName && ` (${product.tamilName})`}
              </p>
            )}
          </div>
        </div>

        {/* Error Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Variant Selector */}
        {variants.length > 1 && (
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Variant
            </label>
            <select
              value={selectedVariantId}
              onChange={handleVariantChange}
              className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {variants.map((variant) => (
                <option key={variant._id} value={variant._id}>
                  {variant.packSize} {variant.unit}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* History Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {selectedVariant && (
            <div className="bg-gray-50 px-4 py-3 border-b">
              <p className="text-sm text-gray-600">
                Showing history for:{" "}
                <span className="font-semibold text-gray-900">
                  {selectedVariant.packSize} {selectedVariant.unit}
                </span>
              </p>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Date/Time
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
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Changed By
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {history.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No price history found
                    </td>
                  </tr>
                ) : (
                  history.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatDate(record.changedAt)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900">
                        ₹{record.purchaseCost.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900">
                        ₹{record.b2bPrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900">
                        ₹{record.b2cPrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div>
                          <p className="font-medium">{record.changedBy.name}</p>
                          <p className="text-xs text-gray-500">
                            {record.changedBy.email}
                          </p>
                        </div>
                      </td>
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
