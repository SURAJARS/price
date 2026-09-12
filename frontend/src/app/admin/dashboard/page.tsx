"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import Navigation from "@/components/Navigation";
import Link from "next/link";
import { useLanguageStore } from "@/stores/languageStore";
import { t } from "@/lib/translations";
import { apiClient } from "@/services/apiClient";
export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { language } = useLanguageStore();

  const [mounted, setMounted] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [activeProducts, setActiveProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  // Redirect if not authenticated or not owner
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }

    if (user.role !== "admin") {
      router.push("/staff/search");
    }
  }, [isAuthenticated, user, router]);

  // Load product stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await apiClient.getAllProducts("", undefined, 1, 100);
        const allProducts = response.data?.data || [];

        setTotalProducts(allProducts.length);
        setActiveProducts(allProducts.filter((p: any) => p.isActive).length);
      } catch (err) {
        console.error("Failed to load stats:", err);
      } finally {
        setLoading(false);
      }
    };

    if (mounted && isAuthenticated && user?.role === "admin") {
      loadStats();
    }
  }, [mounted, isAuthenticated, user]);

  if (!mounted) {
    return null;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const menuItems = [
    {
      title: t("categories.title", language),
      description: t("dashboard.categoriesDescription", language),
      icon: "🏷️",
      href: "/admin/categories",
      color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
    },
    {
      title: t("products.title", language),
      description: t("dashboard.productsDescription", language),
      icon: "📦",
      href: "/admin/products",
      color: "bg-green-50 border-green-200 hover:bg-green-100",
    },
    {
      title: t("staff.title", language),
      description: t("dashboard.staffDescription", language),
      icon: "👥",
      href: "/admin/staff",
      color: "bg-orange-50 border-orange-200 hover:bg-orange-100",
    },
    {
      title: t("nav.analytics", language),
      description: t("dashboard.analyticsDescription", language),
      icon: "📊",
      href: "/admin/analytics",
      color: "bg-red-50 border-red-200 hover:bg-red-100",
    },
    {
      title: t("settings.title", language),
      description: t("dashboard.settingsDescription", language),
      icon: "⚙️",
      href: "/admin/settings",
      color: "bg-gray-50 border-gray-200 hover:bg-gray-100",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <Navigation />

      {/* Page Title */}
      <div className="bg-white dark:bg-slate-900 shadow-sm border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("dashboard.title", language)}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t("dashboard.welcome", language)}, {user.name}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border-l-4 border-blue-500">
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
              {t("dashboard.totalProducts", language)}
            </p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">
              {loading ? "-" : totalProducts}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              {loading
                ? t("dashboard.loading", language)
                : t("dashboard.products", language)}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border-l-4 border-green-500">
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
              {t("dashboard.activeVariants", language)}
            </p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">
              {loading ? "-" : activeProducts}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              {loading
                ? t("dashboard.loading", language)
                : t("dashboard.active", language)}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border-l-4 border-purple-500">
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
              {t("dashboard.staffMembers", language)}
            </p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">
              1
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              {t("dashboard.includingYou", language)}
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t("dashboard.management", language)}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`p-6 rounded-lg border-2 transition cursor-pointer group dark:hover:bg-slate-800 ${item.color}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-3xl mb-2 group-hover:scale-110 transition">
                      {item.icon}
                    </p>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                  <span className="text-gray-400 group-hover:text-gray-600 transition">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-12 bg-white rounded-lg shadow p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {t("dashboard.gettingStarted", language)}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                1. {t("dashboard.setupCategories", language)}
              </h3>
              <p className="text-gray-600 text-sm">
                {t("dashboard.setupCategoriesDescription", language)}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                2. {t("dashboard.addProducts", language)}
              </h3>
              <p className="text-gray-600 text-sm">
                {t("dashboard.addProductsDescription", language)}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                3. {t("dashboard.managePricing", language)}
              </h3>
              <p className="text-gray-600 text-sm">
                {t("dashboard.managePricingDescription", language)}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                4. {t("dashboard.staffAccess", language)}
              </h3>
              <p className="text-gray-600 text-sm">
                {t("dashboard.staffAccessDescription", language)}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
