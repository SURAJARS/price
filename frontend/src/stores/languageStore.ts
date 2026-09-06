import { create } from "zustand";

export type Language = "en" | "ta";

interface LanguageStore {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  initializeLanguage: () => void;
}

export const useLanguageStore = create<LanguageStore>((set) => ({
  // Always use English for the initial server/client render.
  // The saved language is applied after hydration.
  language: "en",

  setLanguage: (language: Language) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("language", language);
    }

    set({ language });
  },

  toggleLanguage: () => {
    set((state) => {
      const newLanguage = state.language === "en" ? "ta" : "en";

      if (typeof window !== "undefined") {
        localStorage.setItem("language", newLanguage);
      }

      return { language: newLanguage };
    });
  },

  initializeLanguage: () => {
    if (typeof window === "undefined") {
      return;
    }

    const stored = localStorage.getItem("language");

    if (stored === "en" || stored === "ta") {
      set({ language: stored });
    }
  },
}));