"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isOwner } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      if (isOwner) {
        router.push("/admin/dashboard");
      } else {
        router.push("/staff/search");
      }
    } else {
      router.push("/login");
    }
  }, [isAuthenticated, isOwner, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">
          Grocery Price Management System
        </h1>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
