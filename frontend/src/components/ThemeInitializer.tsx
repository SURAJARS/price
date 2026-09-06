"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/stores/themeStore";

/**
 * ThemeInitializer: Applies the user's theme to the DOM after hydration.
 * This component prevents hydration mismatches by:
 * 1. Not modifying the DOM during server render
 * 2. Waiting until after hydration to apply the theme
 * 3. Reading theme from localStorage/system preference and applying it
 */
export default function ThemeInitializer() {
  const { initializeTheme } = useThemeStore();

  useEffect(() => {
    // Apply theme from localStorage after hydration is complete
    initializeTheme();
  }, [initializeTheme]);

  return null;
}
