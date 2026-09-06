import { create } from "zustand";

type Theme = "light" | "dark";

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initializeTheme: () => void;
}

const getStoredTheme = (): Theme => {
  if (typeof window === "undefined") {
    return "light";
  }

  const stored = localStorage.getItem("theme");
  if (stored === "dark" || stored === "light") {
    return stored as Theme;
  }

  // Check system preference
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }

  return "light";
};

export const useThemeStore = create<ThemeStore>((set) => {
  const initialTheme = getStoredTheme();

  return {
    theme: initialTheme,
    setTheme: (theme: Theme) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", theme);
        const html = document.documentElement;
        if (theme === "dark") {
          html.classList.add("dark");
        } else {
          html.classList.remove("dark");
        }
      }
      set({ theme });
    },
    toggleTheme: () => {
      set((state) => {
        const newTheme = state.theme === "light" ? "dark" : "light";
        if (typeof window !== "undefined") {
          localStorage.setItem("theme", newTheme);
          const html = document.documentElement;
          if (newTheme === "dark") {
            html.classList.add("dark");
          } else {
            html.classList.remove("dark");
          }
        }
        return { theme: newTheme };
      });
    },
    initializeTheme: () => {
      set((state) => {
        if (typeof window !== "undefined") {
          const html = document.documentElement;
          if (state.theme === "dark") {
            html.classList.add("dark");
          } else {
            html.classList.remove("dark");
          }
        }
        return state;
      });
    },
  };
});
