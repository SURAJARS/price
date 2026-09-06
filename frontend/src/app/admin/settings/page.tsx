"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import Navigation from "@/components/Navigation";

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, isOwner } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !isOwner) {
      router.push("/login");
    }
  }, [isAuthenticated, isOwner, router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <Navigation />
      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Manage application settings and preferences
          </p>

          <div className="space-y-6">
            {/* General Settings */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                General Settings
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Application Name
                  </label>
                  <input
                    type="text"
                    value="GroceryPrice"
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Currency
                  </label>
                  <select
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-gray-400"
                  >
                    <option>₹ INR (Indian Rupee)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Notifications
              </h2>
              <div className="space-y-3">
                {[
                  "Price change alerts",
                  "Staff login notifications",
                  "Low stock warnings",
                ].map((setting, i) => (
                  <label
                    key={i}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      disabled
                      defaultChecked
                      className="rounded"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      {setting}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* About */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                About
              </h2>
              <div className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                <p>
                  <span className="font-medium text-gray-900 dark:text-white">
                    Application:
                  </span>{" "}
                  GroceryPrice
                </p>
                <p>
                  <span className="font-medium text-gray-900 dark:text-white">
                    Version:
                  </span>{" "}
                  1.0.0
                </p>
                <p>
                  <span className="font-medium text-gray-900 dark:text-white">
                    Build Date:
                  </span>{" "}
                  2026-09-04
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
