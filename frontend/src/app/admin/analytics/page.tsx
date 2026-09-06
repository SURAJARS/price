"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useLanguageStore } from "@/stores/languageStore";
import { t } from "@/lib/translations";
import Navigation from "@/components/Navigation";

export default function AnalyticsPage() {
  const router = useRouter();
  const { isAuthenticated, isOwner } = useAuthStore();
  const { language } = useLanguageStore();

  useEffect(() => {
    if (!isAuthenticated || !isOwner) {
      router.push("/login");
    }
  }, [isAuthenticated, isOwner, router]);

  const features = [
    "analytics.frequentlySearched",
    "analytics.noResultSearches",
    "analytics.priceChangeFrequency",
    "analytics.pricesTrends",
    "analytics.marginAnalysis",
    "analytics.productPerformance",
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <Navigation />
      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {t("analytics.title", language)}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {t("analytics.subtitle", language)}
            </p>
          </div>

          {/* Coming Soon Card */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8 md:p-12">
            <div className="text-center">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-6">
                <span className="text-3xl">📊</span>
              </div>

              {/* Heading */}
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {t("analytics.comingSoon", language)}
              </h2>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                {t("analytics.futureFeatures", language)}
              </p>

              {/* Features List */}
              <ul className="space-y-3 text-gray-700 dark:text-gray-300 mb-8 inline-block text-left">
                {features.map((key) => (
                  <li
                    key={key}
                    className="flex items-center gap-3 text-sm md:text-base"
                  >
                    <span className="text-blue-600 dark:text-blue-400 font-bold">
                      •
                    </span>
                    <span>{t(key, language)}</span>
                  </li>
                ))}
              </ul>

              {/* Footer text */}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("dashboard.comingSoon", language)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
