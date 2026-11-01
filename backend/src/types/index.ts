export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  displayOrder: number;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logoUrl?: string | null;
}

export interface ProductVariant {
  id: number;
  productId: number;
  sku: string;
  cpu: string;
  ramGb: number;
  storage: string;
  vga?: string | null;
  screenSize: string;
  color: string;
  price: number;
  originalPrice?: number | null;
  stockQuantity: number;
  isActive: boolean;
}

export interface Review {
  id: number;
  productId: number;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Product {
  id: number;
  categoryId: number;
  brandId: number;
  name: string;
  slug: string;
  thumbnailUrl: string;
  summary?: string | null;
  description?: string | null;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  brand?: Brand;
  variants?: ProductVariant[];
  reviews?: Review[];
}

export interface OrderItem {
  id: number;
  orderId: number;
  variantId: number;
  productName: string;
  variantInfo: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: number;
  orderCode: string;
  userId?: number | null;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  shippingAddress: string;
  note?: string | null;
  totalAmount: number;
  paymentMethod: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
}

export type UserRole = 'CUSTOMER' | 'ADMIN' | 'STAFF';

export interface User {
  id: number;
  email: string;
  passwordHash: string;
  fullName: string;
  phone?: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  phone?: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface AuthTokenPayload {
  userId: number;
  email: string;
  role: UserRole;
}
