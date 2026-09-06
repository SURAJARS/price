"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import Navigation from "@/components/Navigation";

export default function AnalyticsPage() {
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
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Track trends and performance metrics
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: "Total Products", value: "-", icon: "📦" },
              { label: "Active Variants", value: "-", icon: "📊" },
              { label: "Price Changes (30d)", value: "-", icon: "💹" },
              { label: "Search Volume", value: "-", icon: "🔍" },
            ].map((card, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 rounded-lg shadow p-6"
              >
                <div className="text-2xl mb-2">{card.icon}</div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {card.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {card.value}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Analytics Data
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-center py-12">
              Analytics features coming soon. This will include:
            </p>
            <ul className="text-gray-600 dark:text-gray-400 space-y-2 text-center">
              <li>• Frequently searched products</li>
              <li>• No-result searches</li>
              <li>• Price change frequency</li>
              <li>• B2B/B2C trends</li>
              <li>• Margin analysis</li>
              <li>• Product performance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
