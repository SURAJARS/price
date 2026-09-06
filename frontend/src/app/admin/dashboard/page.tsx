"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import Link from "next/link";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  // Redirect if not authenticated or not owner
  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }

    if (user.role !== "admin") {
      router.push("/staff/search");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const menuItems = [
    {
      title: "Categories",
      description: "Manage product categories and subcategories",
      icon: "🏷️",
      href: "/admin/categories",
      color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
    },
    {
      title: "Products",
      description: "Manage products and variants",
      icon: "📦",
      href: "/admin/products",
      color: "bg-green-50 border-green-200 hover:bg-green-100",
    },
    {
      title: "Pricing",
      description: "Manage prices and price history",
      icon: "💰",
      href: "/admin/products",
      color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
    },
    {
      title: "Staff",
      description: "Manage staff accounts and access",
      icon: "👥",
      href: "/admin/staff",
      color: "bg-orange-50 border-orange-200 hover:bg-orange-100",
    },
    {
      title: "Analytics",
      description: "View trends and performance metrics",
      icon: "📊",
      href: "/admin/analytics",
      color: "bg-red-50 border-red-200 hover:bg-red-100",
    },
    {
      title: "Settings",
      description: "Manage application settings",
      icon: "⚙️",
      href: "/admin/settings",
      color: "bg-gray-50 border-gray-200 hover:bg-gray-100",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Welcome, {user.name}</p>
          </div>
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

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {[
              { id: "overview", label: "Overview", icon: "📊" },
              { id: "products", label: "Products", icon: "📦" },
              { id: "pricing", label: "Pricing", icon: "💰" },
              { id: "staff", label: "Staff", icon: "👥" },
              { id: "settings", label: "Settings", icon: "⚙️" },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm font-medium">Total Products</p>
            <p className="text-4xl font-bold text-gray-900 mt-2">0</p>
            <p className="text-xs text-gray-500 mt-2">Coming soon</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <p className="text-gray-600 text-sm font-medium">Active Variants</p>
            <p className="text-4xl font-bold text-gray-900 mt-2">0</p>
            <p className="text-xs text-gray-500 mt-2">Coming soon</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <p className="text-gray-600 text-sm font-medium">Staff Members</p>
            <p className="text-4xl font-bold text-gray-900 mt-2">1</p>
            <p className="text-xs text-gray-500 mt-2">Including you</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`p-6 rounded-lg border-2 transition cursor-pointer group ${item.color}`}
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
            Getting Started
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                1. Set Up Categories
              </h3>
              <p className="text-gray-600 text-sm">
                Start by creating product categories and subcategories to
                organize your products.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                2. Add Products
              </h3>
              <p className="text-gray-600 text-sm">
                Create products with multiple variants (pack sizes) and prices.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                3. Manage Pricing
              </h3>
              <p className="text-gray-600 text-sm">
                Update prices and view complete price history for audit
                purposes.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                4. Staff Access
              </h3>
              <p className="text-gray-600 text-sm">
                Add staff members who can search for product prices on mobile.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
