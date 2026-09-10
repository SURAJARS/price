import axios, { AxiosInstance } from "axios";
import { ApiResponse } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add token to requests if available
    this.axiosInstance.interceptors.request.use(
      (config) => {
  const token =
    typeof window !== "undefined" && localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Let Axios/browser set the correct Content-Type for FormData
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
},
      (error) => Promise.reject(error)
    );
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.axiosInstance.post<ApiResponse>("/auth/login", {
      email,
      password,
    });
    return response.data;
  }

  async register(email: string, password: string, name: string, role: string) {
    const response = await this.axiosInstance.post<ApiResponse>("/auth/register", {
      email,
      password,
      name,
      role,
    });
    return response.data;
  }

  async getProfile() {
    const response = await this.axiosInstance.get<ApiResponse>("/auth/profile");
    return response.data;
  }

  // Product endpoints
  async searchProducts(query: string, limit: number = 20) {
    const response = await this.axiosInstance.get<ApiResponse>("/products/search", {
      params: { q: query, limit },
    });
    return response.data;
  }

  async getProductDetails(productId: string) {
    const response = await this.axiosInstance.get<ApiResponse>(
      `/products/${productId}`
    );
    return response.data;
  }

  // Category endpoints
  async getCategories() {
    const response = await this.axiosInstance.get<ApiResponse>("/categories");
    return response.data;
  }

  async createCategory(name: string, description?: string) {
    const response = await this.axiosInstance.post<ApiResponse>("/categories", {
      name,
      description,
    });
    return response.data;
  }

  async updateCategory(categoryId: string, name: string, description?: string) {
    const response = await this.axiosInstance.patch<ApiResponse>(
      `/categories/${categoryId}`,
      { name, description }
    );
    return response.data;
  }

  async toggleCategoryStatus(categoryId: string) {
    const response = await this.axiosInstance.patch<ApiResponse>(
      `/categories/${categoryId}/status`
    );
    return response.data;
  }

  // Subcategory endpoints
  async getSubcategories(categoryId: string) {
    const response = await this.axiosInstance.get<ApiResponse>(
      `/categories/${categoryId}/subcategories`
    );
    return response.data;
  }

  async createSubcategory(categoryId: string, name: string, description?: string) {
    const response = await this.axiosInstance.post<ApiResponse>(
      `/categories/${categoryId}/subcategories`,
      { name, description }
    );
    return response.data;
  }

  async updateSubcategory(
    categoryId: string,
    subcategoryId: string,
    name: string,
    description?: string
  ) {
    const response = await this.axiosInstance.patch<ApiResponse>(
      `/categories/${categoryId}/subcategories/${subcategoryId}`,
      { name, description }
    );
    return response.data;
  }

  async toggleSubcategoryStatus(categoryId: string, subcategoryId: string) {
    const response = await this.axiosInstance.patch<ApiResponse>(
      `/categories/${categoryId}/subcategories/${subcategoryId}/status`
    );
    return response.data;
  }

  // Product management endpoints
  async getAllProducts(categoryId?: string, subcategoryId?: string, page: number = 1, limit: number = 20, isActive?: boolean) {
    const params: any = { categoryId, subcategoryId, page, limit };
    if (isActive !== undefined) {
      params.isActive = isActive;
    }
    const response = await this.axiosInstance.get<ApiResponse>("/products", {
      params,
    });
    return response.data;
  }

  async createProduct(data: {
    englishName: string;
    tamilName?: string;
    categoryId: string;
    subcategoryId?: string;
    sku?: string;
    giftCode?: string;
    brand?: string;
    description?: string;
    image?: string;
    purchasePrice: number;
    pricing: {
      fixed: boolean;
      calculationType: "percentage" | "value";
      pl1: { price: number; remarks?: string };
      pl2: { price: number; adjustment: number; remarks?: string };
      pl3: { price: number; adjustment: number; remarks?: string };
      pl4: { price: number; adjustment: number; remarks?: string };
    };
  }) {
    const response = await this.axiosInstance.post<ApiResponse>("/products", data);
    return response.data;
  }

  async updateProduct(productId: string, data: {
    englishName?: string;
    tamilName?: string;
    categoryId?: string;
    subcategoryId?: string;
    sku?: string;
    giftCode?: string;
    brand?: string;
    description?: string;
    image?: string;
    purchasePrice?: number;
    pricing?: {
      fixed: boolean;
      calculationType: "percentage" | "value";
      pl1: { price: number; remarks?: string };
      pl2: { price: number; adjustment: number; remarks?: string };
      pl3: { price: number; adjustment: number; remarks?: string };
      pl4: { price: number; adjustment: number; remarks?: string };
    };
  }) {
    const response = await this.axiosInstance.patch<ApiResponse>(
      `/products/${productId}`,
      data
    );
    return response.data;
  }

  async toggleProductStatus(productId: string) {
    const response = await this.axiosInstance.patch<ApiResponse>(
      `/products/${productId}/status`
    );
    return response.data;
  }

  async deleteProduct(productId: string) {
    const response = await this.axiosInstance.delete<ApiResponse>(
      `/products/${productId}`
    );
    return response.data;
  }

  // Staff management endpoints
  async listStaff() {
    const response = await this.axiosInstance.get<ApiResponse>("/auth/staff");
    return response.data;
  }

  async createStaff(name: string, email: string, password: string) {
    const response = await this.axiosInstance.post<ApiResponse>("/auth/register", {
      name,
      email,
      password,
      role: "staff",
    });
    return response.data;
  }

  async editStaff(staffId: string, name: string, email: string) {
    const response = await this.axiosInstance.patch<ApiResponse>(
      `/auth/staff/${staffId}`,
      { name, email }
    );
    return response.data;
  }

  async toggleStaffStatus(staffId: string) {
    const response = await this.axiosInstance.patch<ApiResponse>(
      `/auth/staff/${staffId}/status`
    );
    return response.data;
  }

  // Image upload
  async uploadProductImage(productId: string, file: File) {
    const formData = new FormData();
    formData.append("image", file);

    const response = await this.axiosInstance.post<ApiResponse>(
      `/products/${productId}/upload-image`,
      formData
    );

    return response.data;
  }
}

export const apiClient = new ApiClient();
