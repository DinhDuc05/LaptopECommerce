// ============================================================================
// TypeScript Interfaces & Models cho Toàn Bộ Hệ Thống (Frontend & Backend)
// ============================================================================

export type UserRoleType = 'ADMIN' | 'CUSTOMER' | 'admin' | 'user';

export interface IUser {
  id: number;
  email: string;
  fullName: string;
  phone?: string | null;
  role: UserRoleType;
  isActive: boolean;
  password?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ICategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
}

export interface IBrand {
  id: number;
  name: string;
  slug: string;
  logoUrl?: string;
}

export interface IProductVariant {
  id: number;
  productId: number;
  sku: string;
  cpu: string;
  ramGb: number;
  storage: string;
  vga?: string;
  screenSize: string;
  color: string;
  price: number;
  originalPrice?: number;
  stockQuantity: number;
  isActive: boolean;
}

export interface IProduct {
  id: number;
  categoryId: number;
  brandId: number;
  name: string;
  slug: string;
  thumbnailUrl: string;
  summary?: string;
  description?: string;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  category?: ICategory;
  brand?: IBrand;
  variants: IProductVariant[];
}

export interface CreateProductInput {
  name: string;
  slug?: string;
  categoryId: number;
  brandId: number;
  thumbnailUrl?: string;
  summary?: string;
  description?: string;
  isFeatured?: boolean;
  variants: Array<{
    sku?: string;
    cpu: string;
    ramGb: number;
    storage: string;
    vga?: string;
    screenSize?: string;
    color?: string;
    price: number;
    originalPrice?: number;
    stockQuantity?: number;
  }>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: {
    total: number;
    page: number;
    totalPages: number;
  };
}
