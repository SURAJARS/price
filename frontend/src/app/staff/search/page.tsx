"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useProductStore } from "@/stores/productStore";
import { apiClient } from "@/services/apiClient";
import {
  initSocket,
  joinUserRoom,
  onPriceUpdate,
  offPriceUpdate,
} from "@/services/socket";
import { Product } from "@/types";

export default function StaffSearchPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const {
    products,
    setProducts,
    selectedProduct,
    setSelectedProduct,
    updatePrice,
    lastUpdated,
  } = useProductStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }

    // Initialize socket connection
    const socket = initSocket();
    joinUserRoom(user._id, user.role);

    // Listen for price updates
    onPriceUpdate((update) => {
      updatePrice(update);
    });

    return () => {
      offPriceUpdate();
    };
  }, [isAuthenticated, user, router, updatePrice]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await apiClient.searchProducts(searchQuery);

      if (response.success && response.data) {
        setProducts(response.data);
      } else {
        setError("No products found");
        setProducts([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Search failed");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const getLastUpdatedText = (productId: string): string => {
    const lastUpdate = lastUpdated.get(productId);
    if (!lastUpdate) return "Not updated yet";

    const now = new Date();
    const diffMs = now.getTime() - lastUpdate.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins === 1) return "1 minute ago";
    if (diffMins < 60) return `${diffMins} minutes ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return "1 hour ago";
    if (diffHours < 24) return `${diffHours} hours ago`;

    return lastUpdate.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Price Lookup</h1>
          <button
            onClick={() => {
              useAuthStore.setState({ user: null, token: null });
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              router.push("/login");
            }}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search product name, Tamil name, SKU, or brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? "Searching..." : "Search"}
              </button>
            </div>
          </form>

          {/* Microphone Button Placeholder */}
          <div className="mt-4 text-center text-sm text-gray-600">
            🎤 Voice search coming soon
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Selected Product Detail */}
        {selectedProduct && (
          <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
            <button
              onClick={() => setSelectedProduct(null)}
              className="mb-4 text-sm text-blue-600 hover:text-blue-800"
            >
              ← Back to results
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {selectedProduct.englishName}
            </h2>
            {selectedProduct.tamilName && (
              <p className="text-lg text-gray-600 mb-4">
                {selectedProduct.tamilName}
              </p>
            )}

            {selectedProduct.image && (
              <img
                src={selectedProduct.image}
                alt={selectedProduct.englishName}
                className="w-48 h-48 object-cover rounded-md mb-4"
              />
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              {selectedProduct.category && (
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-medium">{selectedProduct.category.name}</p>
                </div>
              )}
              {selectedProduct.sku && (
                <div>
                  <p className="text-sm text-gray-600">SKU</p>
                  <p className="font-medium">{selectedProduct.sku}</p>
                </div>
              )}
            </div>

            {/* Variants */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Available Sizes
              </h3>
              {selectedProduct.variants?.map((variant) => (
                <div
                  key={variant._id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-gray-900">
                      {variant.packSize} {variant.unit}
                    </p>
                    <span className="text-xs text-gray-500">
                      Updated {getLastUpdatedText(variant._id)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">B2B Price</p>
                      <p className="text-2xl font-bold text-blue-600">
                        ₹{variant.b2bPrice}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">B2C Price</p>
                      <p className="text-2xl font-bold text-green-600">
                        ₹{variant.b2cPrice}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {!selectedProduct && products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product: Product) => (
              <div
                key={product._id}
                onClick={() => handleSelectProduct(product)}
                className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg cursor-pointer transition transform hover:scale-105"
              >
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.englishName}
                    className="w-full h-32 object-cover rounded-md mb-4"
                  />
                )}

                <h3 className="font-bold text-gray-900 mb-1">
                  {product.englishName}
                </h3>
                {product.tamilName && (
                  <p className="text-sm text-gray-600 mb-3">
                    {product.tamilName}
                  </p>
                )}

                {product.variants && product.variants.length > 0 && (
                  <div className="space-y-2">
                    {product.variants.slice(0, 2).map((variant) => (
                      <div key={variant._id} className="text-sm">
                        <p className="text-gray-600">
                          {variant.packSize} {variant.unit}
                        </p>
                        <p className="font-semibold text-blue-600">
                          ₹{variant.b2bPrice}
                        </p>
                      </div>
                    ))}
                    {product.variants.length > 2 && (
                      <p className="text-xs text-gray-500">
                        +{product.variants.length - 2} more sizes
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!selectedProduct && products.length === 0 && !error && searchQuery && (
          <div className="text-center py-12">
            <p className="text-gray-600">
              No products found. Try a different search.
            </p>
          </div>
        )}

        {!selectedProduct &&
          products.length === 0 &&
          !error &&
          !searchQuery && (
            <div className="text-center py-12">
              <p className="text-gray-600">
                Search for a product to get started
              </p>
            </div>
          )}
      </main>
    </div>
  );
}
