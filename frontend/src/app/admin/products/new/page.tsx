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

interface PricingForm {
  fixed: boolean;
  calculationType: "percentage" | "value";
  pl1: {
    price: number | string;
    remarks: string;
  };
  pl2: {
    price: number | string;
    adjustment: number | string;
    remarks: string;
    calculatedPrice?: number;
  };
  pl3: {
    price: number | string;
    adjustment: number | string;
    remarks: string;
    calculatedPrice?: number;
  };
  pl4: {
    price: number | string;
    adjustment: number | string;
    remarks: string;
    calculatedPrice?: number;
  };
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
    giftCode: "",
    brand: "",
    description: "",
    purchasePrice: "",
  });

  const [pricing, setPricing] = useState<PricingForm>({
    fixed: true,
    calculationType: "percentage",
    pl1: {
      price: "",
      remarks: "",
    },
    pl2: {
      price: "",
      adjustment: "",
      remarks: "",
      calculatedPrice: 0,
    },
    pl3: {
      price: "",
      adjustment: "",
      remarks: "",
      calculatedPrice: 0,
    },
    pl4: {
      price: "",
      adjustment: "",
      remarks: "",
      calculatedPrice: 0,
    },
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

  // Recalculate prices when PL1 or adjustments change
  useEffect(() => {
    calculatePrices();
  }, [
    pricing.pl1.price,
    pricing.pl2.adjustment,
    pricing.pl3.adjustment,
    pricing.pl4.adjustment,
    pricing.fixed,
    pricing.calculationType,
  ]);

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

  const calculatePrices = () => {
    const pl1Price = parseFloat(String(pricing.pl1.price)) || 0;

    if (pricing.fixed) {
      // In fixed mode, prices are independent
      return;
    }

    // Non-fixed mode: calculate PL2, PL3, PL4 from PL1
    let pl2Calculated = 0,
      pl3Calculated = 0,
      pl4Calculated = 0;

    if (pricing.calculationType === "percentage") {
      const pl2Adj = parseFloat(String(pricing.pl2.adjustment)) || 0;
      const pl3Adj = parseFloat(String(pricing.pl3.adjustment)) || 0;
      const pl4Adj = parseFloat(String(pricing.pl4.adjustment)) || 0;

      pl2Calculated =
        Math.round((pl1Price - (pl1Price * pl2Adj) / 100) * 100) / 100;
      pl3Calculated =
        Math.round((pl1Price - (pl1Price * pl3Adj) / 100) * 100) / 100;
      pl4Calculated =
        Math.round((pl1Price - (pl1Price * pl4Adj) / 100) * 100) / 100;
    } else {
      // value mode
      const pl2Adj = parseFloat(String(pricing.pl2.adjustment)) || 0;
      const pl3Adj = parseFloat(String(pricing.pl3.adjustment)) || 0;
      const pl4Adj = parseFloat(String(pricing.pl4.adjustment)) || 0;

      pl2Calculated = Math.max(0, pl1Price - pl2Adj);
      pl3Calculated = Math.max(0, pl1Price - pl3Adj);
      pl4Calculated = Math.max(0, pl1Price - pl4Adj);
    }

    setPricing((prev) => ({
      ...prev,
      pl2: { ...prev.pl2, calculatedPrice: pl2Calculated },
      pl3: { ...prev.pl3, calculatedPrice: pl3Calculated },
      pl4: { ...prev.pl4, calculatedPrice: pl4Calculated },
    }));
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

  const handlePricingChange = (
    field: keyof Omit<PricingForm, "fixed" | "calculationType">,
    subfield: string,
    value: string | number,
  ) => {
    setPricing((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [subfield]: value,
      },
    }));
  };

  const handleFixedToggle = () => {
    setPricing((prev) => ({
      ...prev,
      fixed: !prev.fixed,
    }));
  };

  const handleCalculationMethodChange = (method: "percentage" | "value") => {
    setPricing((prev) => ({
      ...prev,
      calculationType: method,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      // Validation
      if (!form.englishName.trim() || !form.categoryId) {
        setError("English name and category are required");
        return;
      }

      if (!form.purchasePrice) {
        setError("Purchase price is required");
        return;
      }

      const pl1Price = parseFloat(String(pricing.pl1.price));
      if (!pl1Price || pl1Price <= 0) {
        setError("PL1 price must be greater than 0");
        return;
      }

      // In non-fixed mode, validate adjustments
      if (!pricing.fixed) {
        const pl2Adj = String(pricing.pl2.adjustment).trim();
        const pl3Adj = String(pricing.pl3.adjustment).trim();
        const pl4Adj = String(pricing.pl4.adjustment).trim();

        if (!pl2Adj || !pl3Adj || !pl4Adj) {
          setError("All adjustment values are required when Fixed is OFF");
          return;
        }
      } else {
        // In fixed mode, all prices must be set
        const pl2Price = parseFloat(String(pricing.pl2.price));
        const pl3Price = parseFloat(String(pricing.pl3.price));
        const pl4Price = parseFloat(String(pricing.pl4.price));

        if (!pl2Price || !pl3Price || !pl4Price) {
          setError("All price levels are required when Fixed is ON");
          return;
        }
      }

      // Prepare data
      const productData = {
        englishName: form.englishName,
        tamilName: form.tamilName,
        categoryId: form.categoryId,
        subcategoryId: form.subcategoryId || undefined,
        sku: form.sku || undefined,
        giftCode: form.giftCode || undefined,
        brand: form.brand || undefined,
        description: form.description || undefined,
        purchasePrice: parseFloat(form.purchasePrice),
        pricing: {
          fixed: pricing.fixed,
          calculationType: pricing.calculationType,
          pl1: {
            price: parseFloat(String(pricing.pl1.price)),
            remarks: pricing.pl1.remarks,
          },
          pl2: {
            price: pricing.fixed
              ? parseFloat(String(pricing.pl2.price))
              : pricing.pl2.calculatedPrice || 0,
            adjustment: pricing.fixed
              ? 0
              : parseFloat(String(pricing.pl2.adjustment)),
            remarks: pricing.pl2.remarks,
          },
          pl3: {
            price: pricing.fixed
              ? parseFloat(String(pricing.pl3.price))
              : pricing.pl3.calculatedPrice || 0,
            adjustment: pricing.fixed
              ? 0
              : parseFloat(String(pricing.pl3.adjustment)),
            remarks: pricing.pl3.remarks,
          },
          pl4: {
            price: pricing.fixed
              ? parseFloat(String(pricing.pl4.price))
              : pricing.pl4.calculatedPrice || 0,
            adjustment: pricing.fixed
              ? 0
              : parseFloat(String(pricing.pl4.adjustment)),
            remarks: pricing.pl4.remarks,
          },
        },
      };

      await apiClient.createProduct(productData);
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
                    SKU Code
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={form.sku}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., SKU-001"
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., GIFT-001"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={form.brand}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Aashirvaad"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Product description"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Purchase Price */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Purchase
              </h2>

              <div className="max-w-md">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Purchase Price *
                </label>
                <div className="flex items-center">
                  <span className="text-gray-600 dark:text-gray-400 mr-2">
                    ₹
                  </span>
                  <input
                    type="number"
                    name="purchasePrice"
                    value={form.purchasePrice}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Pricing
              </h2>

              {/* Fixed Toggle */}
              <div className="mb-6 flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Fixed Pricing
                </label>
                <button
                  type="button"
                  onClick={handleFixedToggle}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    pricing.fixed
                      ? "bg-blue-600 text-white dark:bg-blue-700"
                      : "bg-gray-200 text-gray-700 dark:bg-slate-700 dark:text-gray-300"
                  }`}
                >
                  {pricing.fixed ? "ON" : "OFF"}
                </button>
              </div>

              {/* Calculation Method (when Fixed = OFF) */}
              {!pricing.fixed && (
                <div className="mb-6 border-t border-gray-200 dark:border-slate-700 pt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Calculation Method
                  </label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="calculationType"
                        value="percentage"
                        checked={pricing.calculationType === "percentage"}
                        onChange={(e) =>
                          handleCalculationMethodChange(
                            e.target.value as "percentage" | "value",
                          )
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Percentage
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="calculationType"
                        value="value"
                        checked={pricing.calculationType === "value"}
                        onChange={(e) =>
                          handleCalculationMethodChange(
                            e.target.value as "percentage" | "value",
                          )
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Value (₹)
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Price Levels */}
              <div className="space-y-6 border-t border-gray-200 dark:border-slate-700 pt-4">
                {/* PL1 */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    PL1 – B2C Retail
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Price
                      </label>
                      <div className="flex items-center">
                        <span className="text-gray-600 dark:text-gray-400 mr-2">
                          ₹
                        </span>
                        <input
                          type="number"
                          value={pricing.pl1.price}
                          onChange={(e) =>
                            handlePricingChange("pl1", "price", e.target.value)
                          }
                          step="0.01"
                          min="0"
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="0.00"
                        />
                      </div>
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
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Optional remarks"
                      />
                    </div>
                  </div>
                </div>

                {/* PL2 */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    PL2 – B2C Bulk
                  </h3>
                  <div className="space-y-2">
                    {pricing.fixed ? (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Price
                        </label>
                        <div className="flex items-center">
                          <span className="text-gray-600 dark:text-gray-400 mr-2">
                            ₹
                          </span>
                          <input
                            type="number"
                            value={pricing.pl2.price}
                            onChange={(e) =>
                              handlePricingChange(
                                "pl2",
                                "price",
                                e.target.value,
                              )
                            }
                            step="0.01"
                            min="0"
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Reduce by (
                            {pricing.calculationType === "percentage"
                              ? "%"
                              : "₹"}
                            )
                          </label>
                          <input
                            type="number"
                            value={pricing.pl2.adjustment}
                            onChange={(e) =>
                              handlePricingChange(
                                "pl2",
                                "adjustment",
                                e.target.value,
                              )
                            }
                            step="0.01"
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="0"
                          />
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded-lg">
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Calculated Price
                          </p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            ₹{(pricing.pl2.calculatedPrice || 0).toFixed(2)}
                          </p>
                        </div>
                      </>
                    )}
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
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Optional remarks"
                      />
                    </div>
                  </div>
                </div>

                {/* PL3 */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    PL3 – B2B Retail
                  </h3>
                  <div className="space-y-2">
                    {pricing.fixed ? (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Price
                        </label>
                        <div className="flex items-center">
                          <span className="text-gray-600 dark:text-gray-400 mr-2">
                            ₹
                          </span>
                          <input
                            type="number"
                            value={pricing.pl3.price}
                            onChange={(e) =>
                              handlePricingChange(
                                "pl3",
                                "price",
                                e.target.value,
                              )
                            }
                            step="0.01"
                            min="0"
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Reduce by (
                            {pricing.calculationType === "percentage"
                              ? "%"
                              : "₹"}
                            )
                          </label>
                          <input
                            type="number"
                            value={pricing.pl3.adjustment}
                            onChange={(e) =>
                              handlePricingChange(
                                "pl3",
                                "adjustment",
                                e.target.value,
                              )
                            }
                            step="0.01"
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="0"
                          />
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded-lg">
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Calculated Price
                          </p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            ₹{(pricing.pl3.calculatedPrice || 0).toFixed(2)}
                          </p>
                        </div>
                      </>
                    )}
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
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Optional remarks"
                      />
                    </div>
                  </div>
                </div>

                {/* PL4 */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    PL4 – B2B Wholesale
                  </h3>
                  <div className="space-y-2">
                    {pricing.fixed ? (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Price
                        </label>
                        <div className="flex items-center">
                          <span className="text-gray-600 dark:text-gray-400 mr-2">
                            ₹
                          </span>
                          <input
                            type="number"
                            value={pricing.pl4.price}
                            onChange={(e) =>
                              handlePricingChange(
                                "pl4",
                                "price",
                                e.target.value,
                              )
                            }
                            step="0.01"
                            min="0"
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Reduce by (
                            {pricing.calculationType === "percentage"
                              ? "%"
                              : "₹"}
                            )
                          </label>
                          <input
                            type="number"
                            value={pricing.pl4.adjustment}
                            onChange={(e) =>
                              handlePricingChange(
                                "pl4",
                                "adjustment",
                                e.target.value,
                              )
                            }
                            step="0.01"
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="0"
                          />
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded-lg">
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Calculated Price
                          </p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            ₹{(pricing.pl4.calculatedPrice || 0).toFixed(2)}
                          </p>
                        </div>
                      </>
                    )}
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
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Optional remarks"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 justify-end">
              <Link
                href="/admin/products"
                className="px-6 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
