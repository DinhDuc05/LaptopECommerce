export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logoUrl?: string;
}

export interface ProductVariant {
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
  summary?: string;
  description?: string;
  isFeatured: boolean;
  isActive: boolean;
  category?: Category;
  brand?: Brand;
  variants?: ProductVariant[];
  reviews?: Review[];
}

export interface CartItem {
  variantId: number;
  productId: number;
  productName: string;
  thumbnailUrl: string;
  variantInfo: string;
  price: number;
  quantity: number;
  stockQuantity: number;
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
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: string;
  note?: string;
  totalAmount: number;
  paymentMethod: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  items?: OrderItem[];
}

// Role từ backend (uppercase)
export type UserRole = 'CUSTOMER' | 'ADMIN' | 'STAFF';

// Role cho hệ thống demo local (lowercase) — dùng khi không có backend
export type DemoRole = 'admin' | 'user';

// User lưu trong Global State — hỗ trợ cả backend lẫn demo local
export interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string | null;
  // role có thể là uppercase (backend) hoặc lowercase (demo)
  role: UserRole | DemoRole;
  isActive: boolean;
  createdAt: string;
}

// Dùng để lưu danh sách users trong demo (không có backend)
export interface DemoUser {
  id: number;
  email: string;
  fullName: string;
  role: DemoRole;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
}

