import { create } from "zustand";
import { User, UserRole } from "@/types";

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isOwner: boolean;
  isStaff: boolean;
}

const getStoredAuth = () => {
  if (typeof window === "undefined") {
    return {
      token: null,
      user: null,
    };
  }

  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  if (!token || !storedUser) {
    return {
      token: null,
      user: null,
    };
  }

  try {
    return {
      token,
      user: JSON.parse(storedUser) as User,
    };
  } catch (error) {
    console.error("Failed to restore auth state:", error);
    return {
      token: null,
      user: null,
    };
  }
};

const storedAuth = getStoredAuth();

export const useAuthStore = create<AuthStore>((set) => ({
  user: storedAuth.user,
  token: storedAuth.token,
  isLoading: false,
  error: null,

  isAuthenticated: !!storedAuth.user,
  isOwner: storedAuth.user?.role === UserRole.OWNER,
  isStaff: storedAuth.user?.role === UserRole.STAFF,

  setUser: (user) => set({ user,
    isAuthenticated: !!user,
    isOwner: user?.role === UserRole.OWNER,
    isStaff: user?.role === UserRole.STAFF, }),

  setToken: (token) => set({ token }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  logout: () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    isOwner: false,
    isStaff: false,
    });

    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },
}));