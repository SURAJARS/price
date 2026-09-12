"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import { useAuthStore } from "@/stores/authStore";
import { useLanguageStore } from "@/stores/languageStore";
import { useProductStore } from "@/stores/productStore";
import { apiClient } from "@/services/apiClient";
import {
  initSocket,
  joinUserRoom,
  onPriceUpdate,
  offPriceUpdate,
} from "@/services/socket";
import { Product } from "@/types";

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onresult: ((event: any) => void) | null;
}
interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const levelNames = [
  "PL1 (B2C Retail)",
  "PL2 (B2C Bulk)",
  "PL3 (B2B Retail)",
  "PL4 (B2B Wholesale)",
];
const levelColors = [
  "border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
  "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
  "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20 text-green-600 dark:text-green-400",
  "border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
];

export default function StaffSearchPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { language } = useLanguageStore();
  const {
    products,
    setProducts,
    selectedProduct,
    setSelectedProduct,
    updatePrice,
    lastUpdated,
  } = useProductStore();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isAutocompleteLoading, setIsAutocompleteLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }
    initSocket();
    joinUserRoom(user._id, user.role);
    onPriceUpdate(updatePrice);
    return () => offPriceUpdate();
  }, [mounted, isAuthenticated, user, router, updatePrice]);

  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      if (!query.trim()) {
        setSuggestions([]);
        setIsAutocompleteOpen(false);
        setProducts([]);
        return;
      }
      setIsAutocompleteLoading(true);
      setError("");
      try {
        const response = await apiClient.searchProducts(query.trim(), 10);
        setSuggestions(response.data || []);
        setIsAutocompleteOpen(true);
      } catch (err) {
        console.error("Search error:", err);
        setError("Failed to search products");
        setSuggestions([]);
      } finally {
        setIsAutocompleteLoading(false);
      }
    },
    [setProducts],
  );

  const handleSearchInput = (value: string) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => handleSearch(value), 300);
  };
  const selectProduct = (product: Product) => {
    setSearchQuery(product.englishName);
    setSuggestions([]);
    setIsAutocompleteOpen(false);
    setSelectedProduct(product);
    setProducts([product]);
  };
  const handleBack = () => {
    setSelectedProduct(null);
    setProducts([]);
    setSuggestions([]);
    setIsAutocompleteOpen(false);
  };

  useEffect(() => {
    if (!mounted) return;
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language === "ta" ? "ta-IN" : "en-US";
    recognition.onstart = () => {
      setIsListening(true);
      setVoiceError("");
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => {
      setVoiceError(
        event.error === "no-speech"
          ? "No speech detected. Please try again."
          : `Voice search error: ${event.error}`,
      );
      setIsListening(false);
    };
    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++)
        if (event.results[i].isFinal)
          transcript += event.results[i][0].transcript;
      if (transcript) handleSearchInput(transcript);
    };
    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [mounted, language]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  const updatedText = (id: string) => {
    const timestamp = lastUpdated.get(id);
    if (!timestamp)
      return language === "ta" ? "புதுப்பிக்கப்படவில்லை" : "Never";
    const minutes = Math.floor(
      (Date.now() - new Date(timestamp).getTime()) / 60000,
    );
    if (minutes < 1) return language === "ta" ? "இப்போதுதான்" : "Just now";
    if (minutes < 60)
      return `${minutes}m ${language === "ta" ? "முன்" : "ago"}`;
    if (minutes < 1440)
      return `${Math.floor(minutes / 60)}h ${language === "ta" ? "முன்" : "ago"}`;
    return `${Math.floor(minutes / 1440)}d ${language === "ta" ? "முன்" : "ago"}`;
  };
  const startVoiceSearch = () => {
    if (recognitionRef.current && !isListening) recognitionRef.current.start();
  };
  const stopVoiceSearch = () => {
    if (recognitionRef.current && isListening) recognitionRef.current.stop();
  };

  if (!mounted) return null;
  const pricing = selectedProduct?.pricing;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navigation />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                onFocus={() =>
                  suggestions.length > 0 && setIsAutocompleteOpen(true)
                }
                placeholder={
                  language === "ta" ? "பொருளைத் தேடுக..." : "Search products..."
                }
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {isAutocompleteOpen && suggestions.length > 0 && (
                <div
                  ref={dropdownRef}
                  className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
                >
                  {suggestions.map((product, index) => (
                    <button
                      key={product._id}
                      onClick={() => selectProduct(product)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-slate-700 transition ${index === selectedSuggestionIndex ? "bg-gray-100 dark:bg-slate-700" : ""}`}
                    >
                      <div className="flex gap-3">
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.englishName}
                            className="w-12 h-12 rounded object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white">
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
                            {product.pricing && (
                              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                                PL1: {formatPrice(product.pricing.pl1.price)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={isListening ? stopVoiceSearch : startVoiceSearch}
              className={`px-4 py-3 rounded-lg font-medium transition ${isListening ? "bg-red-500 hover:bg-red-600 text-white" : "bg-orange-500 hover:bg-orange-600 text-white"}`}
            >
              {isListening
                ? language === "ta"
                  ? "⏹️ நிறுத்தவும்"
                  : "⏹️ Stop"
                : language === "ta"
                  ? "🎤 குரல்"
                  : "🎤 Voice"}
            </button>
          </div>
          {voiceError && (
            <p className="mt-2 text-sm text-red-500">{voiceError}</p>
          )}
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>

        {selectedProduct && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8">
            <button
              onClick={handleBack}
              className="mb-6 px-4 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-white rounded-lg font-medium transition"
            >
              {language === "ta" ? "← திரும்பவும்" : "← Back"}
            </button>
            <div className="flex flex-col sm:flex-row gap-6 mb-8">
              {selectedProduct.image && (
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.englishName}
                  className="w-40 h-40 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedProduct.englishName}
                </h1>
                {selectedProduct.tamilName && (
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                    {selectedProduct.tamilName}
                  </p>
                )}
                <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                  {selectedProduct.category && (
                    <p>
                      <strong>
                        {language === "ta" ? "வகை:" : "Category:"}
                      </strong>{" "}
                      {selectedProduct.category.name}
                    </p>
                  )}
                  {selectedProduct.sku && (
                    <p>
                      <strong>SKU:</strong> {selectedProduct.sku}
                    </p>
                  )}
                  {selectedProduct.brand && (
                    <p>
                      <strong>
                        {language === "ta" ? "பிராண்ட்:" : "Brand:"}
                      </strong>{" "}
                      {selectedProduct.brand}
                    </p>
                  )}
                </div>
                <span className="inline-block text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-3 py-1 rounded-full font-semibold">
                  {language === "ta" ? "செயலில்" : "Active"}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {language === "ta" ? "விலை நிலைகள்" : "Price Levels"}
              </h3>
              {pricing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(
                    [
                      pricing.pl1,
                      pricing.pl2,
                      pricing.pl3,
                      pricing.pl4,
                    ] as any[]
                  ).map((level, index) => (
                    <div
                      key={index}
                      className={`p-4 border rounded-xl ${levelColors[index]}`}
                    >
                      <p className="text-sm mb-2 font-semibold">
                        {language === "ta"
                          ? `விலை நிலை ${index + 1}`
                          : levelNames[index]}
                      </p>
                      <p className="text-2xl font-bold mb-3">
                        {formatPrice(level.price)}
                      </p>
                      {level.remarks && (
                        <div className="pt-2 border-t border-gray-300 dark:border-gray-600">
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {language === "ta" ? "குறிப்பு:" : "Remarks:"}
                          </p>
                          <p className="text-xs text-gray-700 dark:text-gray-200 italic">
                            {level.remarks}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">
                  {language === "ta"
                    ? "விலைத் தகவல் இல்லை"
                    : "No pricing information available"}
                </p>
              )}
              {pricing && (
                <div className="mt-4 p-4 bg-gray-100 dark:bg-slate-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>{language === "ta" ? "முறை:" : "Mode:"}</strong>{" "}
                    {pricing.fixed
                      ? language === "ta"
                        ? "நிலையானது (கைமுறை)"
                        : "Fixed (Manual)"
                      : language === "ta"
                        ? "தானியங்கி"
                        : "Auto"}
                    {!pricing.fixed && (
                      <>
                        {" "}
                        -{" "}
                        {pricing.calculationType === "percentage"
                          ? language === "ta"
                            ? "சதவீதம்"
                            : "Percentage (%)"
                          : language === "ta"
                            ? "மதிப்பு (₹)"
                            : "Value (₹)"}
                      </>
                    )}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-6 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {language === "ta"
                  ? "கடைசியாக புதுப்பிக்கப்பட்டது:"
                  : "Last updated:"}{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {updatedText(selectedProduct._id)}
                </span>
              </p>
            </div>
          </div>
        )}

        {!selectedProduct && products.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery
                ? language === "ta"
                  ? "எந்தப் பொருளும் கிடைக்கவில்லை. வேறு தேடலை முயற்சிக்கவும்."
                  : "No products found. Try a different search."
                : language === "ta"
                  ? "தொடங்க ஒரு பொருளைத் தேடுங்கள்."
                  : "Search for a product to get started."}
            </p>
          </div>
        )}
        {isAutocompleteLoading && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              {language === "ta" ? "தேடுகிறது..." : "Searching..."}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
