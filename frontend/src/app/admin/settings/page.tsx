"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useLanguageStore } from "@/stores/languageStore";
import { useThemeStore } from "@/stores/themeStore";
import { t } from "@/lib/translations";
import Navigation from "@/components/Navigation";

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, isOwner } = useAuthStore();

  const { language, setLanguage } = useLanguageStore();
  const { theme, setTheme } = useThemeStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!isOwner) {
      router.push("/staff/search");
    }
  }, [mounted, isAuthenticated, isOwner, router]);

  if (!mounted || !isAuthenticated || !isOwner) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <Navigation />

      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t("settings.title", language)}
            </h1>

            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {t("settings.subtitle", language)}
            </p>
          </div>

          <div className="space-y-6">
            {/* Preferences */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
                {t("settings.preferences", language)}
              </h2>

              <div className="space-y-6">
                {/* Language */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("settings.language", language)}
                  </label>

                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as "en" | "ta")}
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="ta">தமிழ்</option>
                  </select>
                </div>

                {/* Theme */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("settings.theme", language)}
                  </label>

                  <select
                    value={theme}
                    onChange={(e) =>
                      setTheme(e.target.value as "light" | "dark")
                    }
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="light">
                      {t("settings.lightMode", language)}
                    </option>
                    <option value="dark">
                      {t("settings.darkMode", language)}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* Application */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
                {t("settings.application", language)}
              </h2>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t("settings.applicationName", language)}
                  </span>

                  <span className="font-medium text-gray-900 dark:text-white">
                    GroceryPrice
                  </span>
                </div>

                <div className="border-t border-gray-200 dark:border-slate-700" />

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t("settings.version", language)}
                  </span>

                  <span className="font-medium text-gray-900 dark:text-white">
                    1.0.0
                  </span>
                </div>
              </div>
            </div>

            {/* Future Settings */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <div className="flex items-start gap-4">
                <div className="text-3xl shrink-0">⚙️</div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {t("settings.futureSettings", language)}
                  </h2>

                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-6">
                    {t("settings.futureSettingsDescription", language)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
