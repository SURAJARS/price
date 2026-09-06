"use client";

import { useEffect } from "react";
import { useLanguageStore } from "@/stores/languageStore";

export default function LanguageInitializer() {
  const { initializeLanguage } = useLanguageStore();

  useEffect(() => {
    initializeLanguage();
  }, [initializeLanguage]);

  return null;
}
