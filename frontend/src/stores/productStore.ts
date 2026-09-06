import { create } from "zustand";
import { Product, PriceUpdate } from "@/types";

interface ProductStore {
  products: Product[];
  selectedProduct: Product | null;
  priceUpdates: Map<string, PriceUpdate>;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Map<string, Date>;

  setProducts: (products: Product[]) => void;
  setSelectedProduct: (product: Product | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updatePrice: (update: PriceUpdate) => void;
  clearProducts: () => void;
  getProductVariantPrice: (variantId: string) => PriceUpdate | undefined;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  selectedProduct: null,
  priceUpdates: new Map(),
  isLoading: false,
  error: null,
  lastUpdated: new Map(),

  setProducts: (products) => set({ products }),
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  updatePrice: (update) => {
    const { priceUpdates, lastUpdated } = get();
    const newUpdates = new Map(priceUpdates);
    const newTimestamps = new Map(lastUpdated);

    newUpdates.set(update.productVariantId, update);
    newTimestamps.set(update.productVariantId, new Date(update.timestamp));

    set({ priceUpdates: newUpdates, lastUpdated: newTimestamps });
  },

  clearProducts: () =>
    set({
      products: [],
      selectedProduct: null,
      error: null,
    }),

  getProductVariantPrice: (variantId) => {
    return get().priceUpdates.get(variantId);
  },
}));
