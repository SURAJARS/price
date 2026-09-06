"use client";

import { useEffect, useState, useRef, useCallback, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useLanguageStore } from "@/stores/languageStore";
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isAutocompleteLoading, setIsAutocompleteLoading] = useState(false);

  // Voice state
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef<number>(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  /*
   * Hydration protection
   */
  useEffect(() => {
    setMounted(true);
  }, []);

  /*
   * Authentication + Socket.IO
   */
  useEffect(() => {
    if (!mounted) return;

    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }

    initSocket();
    joinUserRoom(user._id, user.role);

    onPriceUpdate((update) => {
      updatePrice(update);
    });

    return () => {
      offPriceUpdate();
    };
  }, [mounted, isAuthenticated, user, router, updatePrice]);

  /*
   * Cleanup speech recognition
   */
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, []);

  /*
   * Click outside autocomplete dropdown
   */
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
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAutocompleteOpen]);

  /*
   * Search products
   */
  const executeSearch = useCallback(
    async (query: string) => {
      const trimmedQuery = query.trim();

      if (!trimmedQuery) return;

      setIsLoading(true);
      setError("");
      setSelectedProduct(null);

      try {
        const response = await apiClient.searchProducts(trimmedQuery);

        if (response.success && response.data) {
          setProducts(response.data);

          if (response.data.length === 0) {
            setError("staffSearch.noProducts");
          }
        } else {
          setProducts([]);
          setError("staffSearch.noProducts");
        }
      } catch (err: any) {
        setProducts([]);
        setError(err.response?.data?.message || "staffSearch.searchFailed");
      } finally {
        setIsLoading(false);
      }
    },
    [setProducts, setSelectedProduct],
  );

  /*
   * Debounced autocomplete search
   */
  const performAutocompleteSearch = useCallback(
    async (query: string, currentRequestId: number) => {
      try {
        setIsAutocompleteLoading(true);

        const response = await apiClient.searchProducts(query, 10);

        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        if (response.success && response.data) {
          setSuggestions(response.data);
          setIsAutocompleteOpen(true);
          setSelectedSuggestionIndex(-1);
        } else {
          setSuggestions([]);
          setIsAutocompleteOpen(true);
        }
      } catch {
        if (currentRequestId === requestIdRef.current) {
          setSuggestions([]);
        }
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setIsAutocompleteLoading(false);
        }
      }
    },
    [],
  );

  /*
   * Input change
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setSearchQuery(value);
    setSelectedSuggestionIndex(-1);
    setError("");

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (value.trim().length < 2) {
      setIsAutocompleteOpen(false);
      setSuggestions([]);
      return;
    }

    const currentRequestId = ++requestIdRef.current;

    debounceTimerRef.current = setTimeout(() => {
      performAutocompleteSearch(value, currentRequestId);
    }, 300);
  };

  /*
   * Keyboard navigation
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isAutocompleteOpen || suggestions.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        executeSearch(searchQuery);
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
          setIsAutocompleteOpen(false);
          executeSearch(searchQuery);
        }

        break;

      case "Escape":
        e.preventDefault();
        setIsAutocompleteOpen(false);
        break;
    }
  };

  /*
   * Select autocomplete suggestion
   */
  const handleSelectSuggestion = (product: Product) => {
    setSelectedProduct(product);
    setIsAutocompleteOpen(false);
    setSearchQuery("");
    setSuggestions([]);
    setSelectedSuggestionIndex(-1);
    setError("");
  };

  /*
   * Form submit
   */
  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();

    setIsAutocompleteOpen(false);

    await executeSearch(searchQuery);
  };

  /*
   * Select product from results
   */
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  /*
   * Voice search
   */
  const handleVoiceSearch = () => {
    setVoiceError("");

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setVoiceError("staffSearch.voiceNotSupported");
      return;
    }

    const recognition = new SpeechRecognitionAPI();

    recognition.lang = language === "ta" ? "ta-IN" : "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceError("");
      setIsAutocompleteOpen(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim() || "";

      if (!transcript) return;

      setSearchQuery(transcript);
      setSuggestions([]);
      setIsAutocompleteOpen(false);

      executeSearch(transcript);
    };

    recognition.onerror = (event) => {
      setIsListening(false);

      if (event.error === "not-allowed") {
        setVoiceError("staffSearch.microphonePermission");
      } else if (event.error === "no-speech") {
        setVoiceError("staffSearch.noSpeech");
      } else {
        setVoiceError("staffSearch.voiceFailed");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  /*
   * Last updated text
   */
  const getLastUpdatedText = (variantId: string): string => {
    const lastUpdate = lastUpdated.get(variantId);

    if (!lastUpdate) {
      return "staffSearch.notUpdated";
    }

    const now = new Date();
    const diffMs = now.getTime() - lastUpdate.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "staffSearch.justNow";

    if (diffMins === 1) {
      return "staffSearch.oneMinuteAgo";
    }

    if (diffMins < 60) {
      return `staffSearch.minutesAgo:${diffMins}`;
    }

    const diffHours = Math.floor(diffMins / 60);

    if (diffHours === 1) {
      return "staffSearch.oneHourAgo";
    }

    if (diffHours < 24) {
      return `staffSearch.hoursAgo:${diffHours}`;
    }

    return lastUpdate.toLocaleString(language === "ta" ? "ta-IN" : "en-IN");
  };

  /*
   * Translate relative time text
   */
  const translateUpdatedText = (value: string): string => {
    if (value === "staffSearch.notUpdated") {
      return language === "ta"
        ? "இன்னும் புதுப்பிக்கப்படவில்லை"
        : "Not updated yet";
    }

    if (value === "staffSearch.justNow") {
      return language === "ta" ? "இப்போதுதான்" : "Just now";
    }

    if (value === "staffSearch.oneMinuteAgo") {
      return language === "ta" ? "1 நிமிடத்திற்கு முன்" : "1 minute ago";
    }

    if (value.startsWith("staffSearch.minutesAgo:")) {
      const minutes = value.split(":")[1];

      return language === "ta"
        ? `${minutes} நிமிடங்களுக்கு முன்`
        : `${minutes} minutes ago`;
    }

    if (value === "staffSearch.oneHourAgo") {
      return language === "ta" ? "1 மணி நேரத்திற்கு முன்" : "1 hour ago";
    }

    if (value.startsWith("staffSearch.hoursAgo:")) {
      const hours = value.split(":")[1];

      return language === "ta"
        ? `${hours} மணி நேரத்திற்கு முன்`
        : `${hours} hours ago`;
    }

    return value;
  };

  if (!mounted || !isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {language === "ta" ? "பொருட்களைத் தேடுக" : "Search Products"}
          </h1>

          <p className="mt-1 text-sm md:text-base text-gray-600 dark:text-gray-400">
            {language === "ta"
              ? "தற்போதைய B2B மற்றும் B2C விலைகளை உடனடியாகப் பார்க்கவும்"
              : "Find current B2B and B2C prices instantly"}
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative" ref={dropdownRef}>
            <form onSubmit={handleSearch}>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder={
                      language === "ta"
                        ? "பொருளின் பெயர், தமிழ்ப் பெயர், SKU அல்லது பிராண்டைத் தேடுக..."
                        : "Search product name, Tamil name, SKU, or brand..."
                    }
                    value={searchQuery}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                      if (suggestions.length > 0) {
                        setIsAutocompleteOpen(true);
                      }
                    }}
                    disabled={isLoading}
                    className="w-full px-4 py-3 pr-14 border border-gray-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white bg-white dark:bg-slate-800 placeholder-gray-400 dark:placeholder-gray-500"
                  />

                  {/* Voice button */}
                  <button
                    type="button"
                    onClick={handleVoiceSearch}
                    disabled={isLoading}
                    aria-label={
                      isListening ? "Stop voice search" : "Start voice search"
                    }
                    className={`absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg flex items-center justify-center transition ${
                      isListening
                        ? "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 animate-pulse"
                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400"
                    }`}
                  >
                    {isListening ? "⏹" : "🎤"}
                  </button>

                  {/* Autocomplete */}
                  {isAutocompleteOpen &&
                    (suggestions.length > 0 || isAutocompleteLoading) && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
                        {isAutocompleteLoading && (
                          <div className="p-3 text-center text-sm text-gray-500 dark:text-gray-400">
                            {language === "ta"
                              ? "தேடுகிறது..."
                              : "Searching..."}
                          </div>
                        )}

                        {!isAutocompleteLoading &&
                          suggestions.map((product, index) => (
                            <button
                              key={product._id}
                              type="button"
                              onClick={() => handleSelectSuggestion(product)}
                              className={`w-full text-left p-3 cursor-pointer border-b border-gray-100 dark:border-slate-700 transition ${
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
                                          {product.variants.length}{" "}
                                          {language === "ta"
                                            ? "அளவுகள்"
                                            : product.variants.length === 1
                                              ? "size"
                                              : "sizes"}
                                        </span>
                                      )}
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                      </div>
                    )}

                  {isAutocompleteOpen &&
                    suggestions.length === 0 &&
                    !isAutocompleteLoading &&
                    searchQuery.trim().length >= 2 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-xl shadow-lg z-50 p-3 text-center text-sm text-gray-500 dark:text-gray-400">
                        {language === "ta"
                          ? "பொருட்கள் எதுவும் கிடைக்கவில்லை"
                          : "No products found"}
                      </div>
                    )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 md:px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 whitespace-nowrap font-medium"
                >
                  {isLoading
                    ? language === "ta"
                      ? "தேடுகிறது..."
                      : "Searching..."
                    : language === "ta"
                      ? "தேடு"
                      : "Search"}
                </button>
              </div>
            </form>

            {/* Voice status */}
            {isListening && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {language === "ta"
                  ? "🎤 கேட்கிறது... பேசவும்"
                  : "🎤 Listening... speak now"}
              </p>
            )}

            {voiceError && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {language === "ta"
                  ? voiceError === "staffSearch.microphonePermission"
                    ? "மைக்ரோஃபோன் அனுமதி தேவை"
                    : voiceError === "staffSearch.noSpeech"
                      ? "குரல் எதுவும் கேட்கப்படவில்லை"
                      : "குரல் தேடல் தோல்வியடைந்தது"
                  : voiceError === "staffSearch.microphonePermission"
                    ? "Microphone permission is required"
                    : voiceError === "staffSearch.noSpeech"
                      ? "No speech was detected"
                      : "Voice search failed"}
              </p>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl">
            <p className="text-red-800 dark:text-red-200">
              {error === "staffSearch.noProducts"
                ? language === "ta"
                  ? "பொருட்கள் எதுவும் கிடைக்கவில்லை. வேறு தேடலை முயற்சிக்கவும்."
                  : "No products found. Try a different search."
                : language === "ta"
                  ? "தேடல் தோல்வியடைந்தது"
                  : "Search failed"}
            </p>
          </div>
        )}

        {/* Selected Product Detail */}
        {selectedProduct && (
          <div className="mb-8 p-4 md:p-6 bg-white dark:bg-slate-800 rounded-xl shadow-md">
            <button
              onClick={() => setSelectedProduct(null)}
              className="mb-5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              ←{" "}
              {language === "ta"
                ? "முடிவுகளுக்குத் திரும்பவும்"
                : "Back to results"}
            </button>

            <div className="flex flex-col md:flex-row gap-5 mb-6">
              {selectedProduct.image && (
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.englishName}
                  className="w-full md:w-40 h-40 object-cover rounded-xl"
                />
              )}

              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedProduct.englishName}
                </h2>

                {selectedProduct.tamilName && (
                  <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                    {selectedProduct.tamilName}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mt-4">
                  {selectedProduct.category && (
                    <span className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                      {selectedProduct.category.name}
                    </span>
                  )}

                  {selectedProduct.sku && (
                    <span className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                      SKU: {selectedProduct.sku}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Variants */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {language === "ta"
                  ? "கிடைக்கக்கூடிய அளவுகள்"
                  : "Available Sizes"}
              </h3>

              {selectedProduct.variants?.map((variant) => (
                <div
                  key={variant._id}
                  className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-700"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {variant.packSize} {variant.unit}
                    </p>

                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {language === "ta" ? "புதுப்பிப்பு: " : "Updated "}
                      {translateUpdatedText(getLastUpdatedText(variant._id))}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                        {language === "ta" ? "B2B விலை" : "B2B Price"}
                      </p>

                      <p className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">
                        ₹{variant.b2bPrice}
                      </p>
                    </div>

                    <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                        {language === "ta" ? "B2C விலை" : "B2C Price"}
                      </p>

                      <p className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">
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
                className="p-4 md:p-5 bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-lg cursor-pointer transition"
              >
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.englishName}
                    className="w-full h-32 object-cover rounded-lg mb-4"
                  />
                )}

                <h3 className="font-bold text-gray-900 dark:text-white">
                  {product.englishName}
                </h3>

                {product.tamilName && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-4">
                    {product.tamilName}
                  </p>
                )}

                {product.variants && product.variants.length > 0 && (
                  <div className="space-y-3">
                    {product.variants.map((variant) => (
                      <div
                        key={variant._id}
                        className="p-3 rounded-lg border border-gray-200 dark:border-slate-700"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {variant.packSize} {variant.unit}
                          </p>

                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {translateUpdatedText(
                              getLastUpdatedText(variant._id),
                            )}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {language === "ta" ? "B2B" : "B2B Price"}
                            </p>

                            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                              ₹{variant.b2bPrice}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {language === "ta" ? "B2C" : "B2C Price"}
                            </p>

                            <p className="text-lg font-bold text-green-600 dark:text-green-400">
                              ₹{variant.b2cPrice}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!selectedProduct && products.length === 0 && !error && searchQuery && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              {language === "ta"
                ? "பொருட்கள் எதுவும் கிடைக்கவில்லை. வேறு தேடலை முயற்சிக்கவும்."
                : "No products found. Try a different search."}
            </p>
          </div>
        )}

        {!selectedProduct &&
          products.length === 0 &&
          !error &&
          !searchQuery && (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🔎</div>

              <p className="text-gray-700 dark:text-gray-300 font-medium">
                {language === "ta"
                  ? "தொடங்குவதற்கு ஒரு பொருளைத் தேடுக"
                  : "Search for a product to get started"}
              </p>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {language === "ta"
                  ? "ஆங்கிலம், தமிழ், SKU அல்லது பிராண்ட் மூலம் தேடலாம்"
                  : "Search by English name, Tamil name, SKU, or brand"}
              </p>
            </div>
          )}
      </main>
    </div>
  );
}
