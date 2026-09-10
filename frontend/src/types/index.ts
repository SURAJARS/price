export enum UserRole {
  OWNER = "admin",
  STAFF = "staff",
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

// Price level interface
export interface PriceLevel {
  price: number;
  adjustment?: number;
  remarks?: string;
}

// Product pricing interface
export interface ProductPricing {
  fixed: boolean;
  calculationType: "percentage" | "value";
  pl1: PriceLevel;
  pl2: PriceLevel;
  pl3: PriceLevel;
  pl4: PriceLevel;
}

// Product interface (new structure without variants)
export interface Product {
  _id: string;
  englishName: string;
  tamilName?: string;
  category?: {
    _id: string;
    name: string;
  };
  subcategory?: {
    _id: string;
    name: string;
  };
  sku?: string;
  giftCode?: string;
  brand?: string;
  description?: string;
  image?: string;
  purchasePrice: number;
  pricing: ProductPricing;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Product variant (for backward compatibility)
export interface ProductVariant {
  _id: string;
  productId: string;
  packSize: number;
  unit: string;
  b2bPrice: number;
  b2cPrice: number;
  purchaseCost?: number; // Only visible to admin
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SearchResult extends Product {
  score?: number;
}

export interface PriceUpdate {
  productVariantId: string;
  prices: {
    b2bPrice: number;
    b2cPrice: number;
  };
  timestamp: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
