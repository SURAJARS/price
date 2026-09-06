"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import Navigation from "@/components/Navigation";
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

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isAutocompleteLoading, setIsAutocompleteLoading] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const requestIdRef = useRef<number>(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Handle click outside autocomplete dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsAutocompleteOpen(false);
      }
    };

    if (isAutocompleteOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isAutocompleteOpen]);

  // Debounced autocomplete search
  const performAutocompleteSearch = useCallback(
    async (query: string, currentRequestId: number) => {
      try {
        setIsAutocompleteLoading(true);
        const response = await apiClient.searchProducts(query, 10);

        // Ignore if this is a stale request
        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        if (response.success && response.data) {
          setSuggestions(response.data);
          setIsAutocompleteOpen(true);
          setSelectedSuggestionIndex(-1);
        } else {
          setSuggestions([]);
        }
      } catch (err: any) {
        // Ignore errors for autocomplete
        if (currentRequestId === requestIdRef.current) {
          setSuggestions([]);
        }
      } finally {
        setIsAutocompleteLoading(false);
      }
    },
    [],
  );

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSelectedSuggestionIndex(-1);

    // Clear previous timeout
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (value.trim().length < 2) {
      setIsAutocompleteOpen(false);
      setSuggestions([]);
      return;
    }

    // Set new timeout for debounced search
    const currentRequestId = ++requestIdRef.current;
    debounceTimerRef.current = setTimeout(() => {
      performAutocompleteSearch(value, currentRequestId);
    }, 300);
  };

  // Handle keyboard navigation in autocomplete
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isAutocompleteOpen || suggestions.length === 0) {
      if (e.key === "Enter") {
        handleSearch(e as any);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSelectSuggestion(suggestions[selectedSuggestionIndex]);
        } else {
          handleSearch(e as any);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsAutocompleteOpen(false);
        break;
    }
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (product: Product) => {
    setSelectedProduct(product);
    setIsAutocompleteOpen(false);
    setSearchQuery("");
    setSuggestions([]);
    setSelectedSuggestionIndex(-1);
  };

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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <Navigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="mb-8">
          <div className="relative" ref={dropdownRef}>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search product name, Tamil name, SKU, or brand..."
                    value={searchQuery}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                      if (suggestions.length > 0) {
                        setIsAutocompleteOpen(true);
                      }
                    }}
                    disabled={isLoading}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white bg-white dark:bg-slate-800 placeholder-gray-400 dark:placeholder-gray-500"
                  />

                  {/* Autocomplete Dropdown */}
                  {isAutocompleteOpen && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
                      {isAutocompleteLoading && (
                        <div className="p-3 text-center text-sm text-gray-500 dark:text-gray-400">
                          Loading...
                        </div>
                      )}
                      {!isAutocompleteLoading && suggestions.length === 0 && (
                        <div className="p-3 text-center text-sm text-gray-500 dark:text-gray-400">
                          No products found
                        </div>
                      )}
                      {!isAutocompleteLoading &&
                        suggestions.map((product, index) => (
                          <div
                            key={product._id}
                            onClick={() => handleSelectSuggestion(product)}
                            className={`p-3 cursor-pointer border-b border-gray-100 dark:border-slate-700 transition ${
                              index === selectedSuggestionIndex
                                ? "bg-blue-50 dark:bg-blue-900"
                                : "hover:bg-gray-50 dark:hover:bg-slate-700"
                            }`}
                          >
                            <div className="flex gap-3 items-start">
                              {product.image && (
                                <img
                                  src={product.image}
                                  alt={product.englishName}
                                  className="w-10 h-10 object-cover rounded flex-shrink-0"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                                  {product.englishName}
                                </p>
                                {product.tamilName && (
                                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                    {product.tamilName}
                                  </p>
                                )}
                                <div className="flex gap-2 mt-1 flex-wrap">
                                  {product.category && (
                                    <span className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded">
                                      {product.category.name}
                                    </span>
                                  )}
                                  {product.variants &&
                                    product.variants.length > 0 && (
                                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                                        {product.variants.length} size
                                        {product.variants.length !== 1
                                          ? "s"
                                          : ""}
                                      </span>
                                    )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* No results message */}
                  {isAutocompleteOpen &&
                    suggestions.length === 0 &&
                    !isAutocompleteLoading &&
                    searchQuery.trim().length >= 2 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md shadow-lg z-50 p-3 text-center text-sm text-gray-500 dark:text-gray-400">
                        No products found
                      </div>
                    )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 whitespace-nowrap"
                >
                  {isLoading ? "Searching..." : "Search"}
                </button>
              </div>
            </form>
          </div>

          {/* Microphone Button Placeholder */}
          <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            🎤 Voice search coming soon
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Selected Product Detail */}
        {selectedProduct && (
          <div className="mb-8 p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
            <button
              onClick={() => setSelectedProduct(null)}
              className="mb-4 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              ← Back to results
            </button>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {selectedProduct.englishName}
            </h2>
            {selectedProduct.tamilName && (
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Category
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedProduct.category.name}
                  </p>
                </div>
              )}
              {selectedProduct.sku && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    SKU
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedProduct.sku}
                  </p>
                </div>
              )}
            </div>

            {/* Variants */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Available Sizes
              </h3>
              {selectedProduct.variants?.map((variant) => (
                <div
                  key={variant._id}
                  className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 transition bg-white dark:bg-slate-700"
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {variant.packSize} {variant.unit}
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Updated {getLastUpdatedText(variant._id)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        B2B Price
                      </p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        ₹{variant.b2bPrice}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        B2C Price
                      </p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
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
                className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg cursor-pointer transition transform hover:scale-105"
              >
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.englishName}
                    className="w-full h-32 object-cover rounded-md mb-4"
                  />
                )}

                <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                  {product.englishName}
                </h3>
                {product.tamilName && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {product.tamilName}
                  </p>
                )}

                {product.variants && product.variants.length > 0 && (
                  <div className="space-y-2">
                    {product.variants.slice(0, 2).map((variant) => (
                      <div key={variant._id} className="text-sm">
                        <p className="text-gray-600 dark:text-gray-400">
                          {variant.packSize} {variant.unit}
                        </p>
                        <p className="font-semibold text-blue-600 dark:text-blue-400">
                          ₹{variant.b2bPrice}
                        </p>
                      </div>
                    ))}
                    {product.variants.length > 2 && (
                      <p className="text-xs text-gray-500 dark:text-gray-500">
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
            <p className="text-gray-600 dark:text-gray-400">
              No products found. Try a different search.
            </p>
          </div>
        )}

        {!selectedProduct &&
          products.length === 0 &&
          !error &&
          !searchQuery && (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                Search for a product to get started
              </p>
            </div>
          )}
      </main>
    </div>
  );
}
