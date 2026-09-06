"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import Link from "next/link";
import { UserRole } from "@/types";

interface NavItem {
  label: string;
  href: string;
  icon?: string;
}

const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "📊" },
  { label: "Products", href: "/admin/products", icon: "📦" },
  { label: "Categories", href: "/admin/categories", icon: "🏷️" },
  { label: "Staff", href: "/admin/staff", icon: "👥" },
  { label: "Analytics", href: "/admin/analytics", icon: "📈" },
  { label: "Settings", href: "/admin/settings", icon: "⚙️" },
];

const STAFF_NAV_ITEMS: NavItem[] = [
  { label: "Search", href: "/staff/search", icon: "🔍" },
];

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const isAuthenticated = !!user;
  const isOwner = user?.role === UserRole.OWNER;
  const isStaff = user?.role === UserRole.STAFF;
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Determine which nav items to show based on role
  const navItems =
    user?.role === UserRole.OWNER
      ? ADMIN_NAV_ITEMS
      : user?.role === UserRole.STAFF
        ? STAFF_NAV_ITEMS
        : [];

  // Check if a path is active
  const isActive = (href: string) => {
    if (href === "/admin/dashboard" || href === "/staff/search") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  // Close drawer when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Set mounted to true for hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-3 flex items-center justify-between">
          {/* Hamburger Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* App Name/Logo */}
          <div className="flex-1 ml-4 lg:ml-0">
            <Link
              href={
                user?.role === UserRole.OWNER
                  ? "/admin/dashboard"
                  : "/staff/search"
              }
            >
              <h1 className="text-lg font-bold text-gray-900">Grocery Price</h1>
            </Link>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-600">
                {user?.role === UserRole.OWNER
                  ? "Owner"
                  : user?.role === UserRole.STAFF
                    ? "Staff"
                    : ""}
              </p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Drawer */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <nav
        className={`fixed left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-40 lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close button */}
        <div className="flex justify-between items-center px-4 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation Items */}
        <div className="py-4 px-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1 ${
                isActive(item.href)
                  ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <span>🚪</span>
            Logout
          </button>
        </div>
      </nav>

      {/* Desktop Navigation - Hidden by default, visible on lg */}
      <div className="hidden lg:block bg-white shadow-sm border-b border-gray-200">
        <nav className="max-w-full px-6 py-4">
          <div className="flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                  isActive(item.href)
                    ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            ))}

            {/* Desktop Logout */}
            <div className="ml-auto">
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
