import { IUser, IProduct, CreateProductInput, ApiResponse } from '../types/models';
import { Category, Brand, Order } from '../types';

const rawConfiguredApiUrl = (
  typeof window === 'undefined'
    ? process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL
    : process.env.NEXT_PUBLIC_API_URL
)?.trim();
// This URL belonged to the retired Vercel deployment. Ignore it even if an
// old Render environment variable still exists.
const configuredApiUrl = rawConfiguredApiUrl?.includes('laptop-e-commerce-k474.vercel.app')
  ? undefined
  : rawConfiguredApiUrl;
// Browser requests use the same-origin `/api` route when no external API is
// configured. Server components read the local store directly in getProducts.
const API_BASE_URL = configuredApiUrl || '';
const API_BASE = API_BASE_URL.endsWith('/api')
  ? API_BASE_URL
  : `${API_BASE_URL}/api`;

function getFallbackApiBase(): string {
  if (typeof window !== 'undefined') return '/api';
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}/api`;
  if (process.env.RENDER_EXTERNAL_URL) return `${process.env.RENDER_EXTERNAL_URL}/api`;
  return `http://127.0.0.1:${process.env.PORT || '3000'}/api`;
}

// Helper lấy Auth Header từ Cookie hoặc LocalStorage
function getBrowserToken(): string | null {
  if (typeof window === 'undefined') return null;

  const cookieToken = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith('laptop_store_token_v1='))
    ?.split('=').slice(1).join('=');

  return cookieToken
    ? decodeURIComponent(cookieToken)
    : window.localStorage.getItem('laptop_store_token_v1');
}

export function getAuthHeaders(): HeadersInit {
  const token = getBrowserToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function fetchAdminData(path: string): Promise<any | null> {
  const headers = getAuthHeaders();
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      headers,
      cache: 'no-store',
    });
    if (response.ok) return await response.json();
  } catch (error) {
    console.error(`Lỗi API quản trị ${path}:`, error);
  }

  if (API_BASE !== getFallbackApiBase()) {
    try {
      const response = await fetch(`${getFallbackApiBase()}${path}`, {
        headers,
        cache: 'no-store',
      });
      if (response.ok) return await response.json();
    } catch (error) {
      console.error(`Lỗi fallback API quản trị ${path}:`, error);
    }
  }

  return null;
}

// ================= DỮ LIỆU TĨNH FALLBACK =================
export const FALLBACK_CATEGORIES: Category[] = [
  { id: 1, name: 'Laptop Mỏng Nhẹ', slug: 'laptop-mong-nhe', description: 'Ultrabook siêu nhẹ, pin lâu', displayOrder: 1 },
  { id: 2, name: 'Laptop Doanh Nhân', slug: 'laptop-doanh-nhan', description: 'Thiết kế sang trọng, bảo mật cao cấp', displayOrder: 2 },
  { id: 3, name: 'Laptop Gaming', slug: 'laptop-gaming', description: 'Cấu hình khủng, card đồ họa rời', displayOrder: 3 },
  { id: 4, name: 'Laptop Sinh Viên - Văn Phòng', slug: 'laptop-sinh-vien-van-phong', description: 'Giá hợp lý cho học tập', displayOrder: 4 },
  { id: 5, name: 'Laptop Đồ Họa - Kỹ Thuật', slug: 'laptop-do-hoa-ky-thuat', description: 'Màn hình chuẩn màu, đa nhiệm', displayOrder: 5 },
];

export const FALLBACK_BRANDS: Brand[] = [
  { id: 1, name: 'Apple', slug: 'apple', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
  { id: 2, name: 'Dell', slug: 'dell', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/48/Dell_Logo.svg' },
  { id: 3, name: 'Asus', slug: 'asus', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/ASUS_Logo.svg' },
  { id: 4, name: 'Lenovo', slug: 'lenovo', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/28/Lenovo_logo_2015.svg' },
  { id: 5, name: 'HP', slug: 'hp', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg' },
];

// ================= AUTH API =================
export async function loginApi(email: string, password: string) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) return await res.json();

    // Keep the original demo account usable when Express is unavailable.
    if (API_BASE !== '/api') {
      const fallbackRes = await fetch(`${getFallbackApiBase()}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return await fallbackRes.json();
    }

    return await res.json();
  } catch (error: any) {
    try {
      const fallbackRes = await fetch(`${getFallbackApiBase()}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return await fallbackRes.json();
    } catch {
      return { success: false, message: error.message || 'Lỗi kết nối máy chủ khi đăng nhập.' };
    }
  }
}

export async function registerApi(data: {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}) {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error: any) {
    return { success: false, message: error.message || 'Lỗi kết nối máy chủ khi đăng ký.' };
  }
}

// ================= PRODUCTS & CATEGORIES =================
export async function getProducts(params?: Record<string, string | number | boolean | undefined>): Promise<{
  products: IProduct[];
  pagination: { total: number; page: number; totalPages: number };
}> {
  // The home page is a Server Component. Read the local store directly there
  // instead of making an HTTP request to 127.0.0.1, whose port is not known at
  // build time on Render (Render commonly assigns PORT=10000).
  if (typeof window === 'undefined' && !configuredApiUrl) {
    const { getProductsFromDb } = await import('./db');
    const products = (await getProductsFromDb()).filter((product) => {
      if (!product.isActive) return false;
      if (params?.brand && product.brand?.slug !== String(params.brand)) return false;
      if (params?.category && product.category?.slug !== String(params.category)) return false;
      const search = params?.search ? String(params.search).trim().toLowerCase() : '';
      if (search && !product.name.toLowerCase().includes(search)) return false;
      return true;
    });

    return {
      products,
      pagination: { total: products.length, page: 1, totalPages: 1 },
    };
  }

  try {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          query.append(key, String(value));
        }
      });
    }

    const requestPath = `/products?${query.toString()}`;
    const res = await fetch(`${API_BASE}${requestPath}`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return {
          products: json.data,
          pagination: { total: json.data.length, page: 1, totalPages: 1 },
        };
      }
    }

    if (API_BASE !== getFallbackApiBase()) {
      const fallbackRes = await fetch(`${getFallbackApiBase()}${requestPath}`, {
        cache: 'no-store',
      });
      if (fallbackRes.ok) {
        const json = await fallbackRes.json();
        if (json.success && Array.isArray(json.data)) {
          return {
            products: json.data,
            pagination: {
              total: json.data.length,
              page: Number(json.pagination?.page) || 1,
              totalPages: Number(json.pagination?.totalPages) || 1,
            },
          };
        }
      }
    }
  } catch (error) {
    console.error('Lỗi khi tải danh sách sản phẩm:', error);
    try {
      const fallbackRes = await fetch(`${getFallbackApiBase()}/products`, {
        cache: 'no-store',
      });
      if (fallbackRes.ok) {
        const json = await fallbackRes.json();
        if (json.success && Array.isArray(json.data)) {
          return {
            products: json.data,
            pagination: { total: json.data.length, page: 1, totalPages: 1 },
          };
        }
      }
    } catch (fallbackError) {
      console.error('Lỗi khi tải fallback sản phẩm:', fallbackError);
    }
  }

  return { products: [], pagination: { total: 0, page: 1, totalPages: 1 } };
}

export async function getProductBySlug(slug: string): Promise<IProduct | null> {
  try {
    const requestPath = `/products/${encodeURIComponent(slug)}`;
    const res = await fetch(`${API_BASE}${requestPath}`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    }
    if (API_BASE !== getFallbackApiBase()) {
      const fallbackRes = await fetch(`${getFallbackApiBase()}${requestPath}`, { cache: 'no-store' });
      if (fallbackRes.ok) {
        const json = await fallbackRes.json();
        if (json.success && json.data) return json.data;
      }
    }
  } catch (error) {
    console.error('Lỗi getProductBySlug:', error);
    try {
      const fallbackRes = await fetch(`${getFallbackApiBase()}/products/${encodeURIComponent(slug)}`, {
        cache: 'no-store',
      });
      if (fallbackRes.ok) {
        const json = await fallbackRes.json();
        if (json.success && json.data) return json.data;
      }
    } catch (fallbackError) {
      console.error('Lỗi fallback getProductBySlug:', fallbackError);
    }
  }
  return null;
}

export async function getCategories(): Promise<Category[]> {
  return FALLBACK_CATEGORIES;
}

export async function getBrands(): Promise<Brand[]> {
  return FALLBACK_BRANDS;
}

// ================= ORDERS =================
export async function createOrder(orderPayload: any): Promise<{ success: boolean; data?: Order; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    });

    if (!res.ok) {
      const text = await res.text();
      try {
        const errJson = JSON.parse(text);
        return { success: false, message: errJson.message || 'Lỗi khi tạo đơn hàng' };
      } catch {
        return { success: false, message: `Lỗi máy chủ (${res.status}): Không thể xử lý đơn hàng.` };
      }
    }

    return await res.json();
  } catch (error: any) {
    return { success: false, message: error.message || 'Lỗi kết nối khi gửi đơn hàng' };
  }
}

export async function lookupOrder(query: string): Promise<{ success: boolean; data?: Order[]; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/orders/track?query=${encodeURIComponent(query)}`, {
      cache: 'no-store',
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (error: any) {
    console.error('Lỗi lookupOrder:', error);
  }
  return { success: true, data: [] };
}

// ================= ADMIN PRODUCTS API (DATABASE THẬT) =================
export async function getAdminProducts(): Promise<IProduct[]> {
  const json = await fetchAdminData('/admin/products');
  return json?.success && Array.isArray(json.data) ? json.data : [];
}

export async function createAdminProduct(productData: CreateProductInput): Promise<ApiResponse<IProduct>> {
  try {
    const res = await fetch(`${API_BASE}/admin/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData),
    });
    const json = await res.json();
    return json;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Lỗi kết nối khi gửi yêu cầu thêm sản phẩm.',
    };
  }
}

export async function deleteAdminProduct(id: number | string): Promise<ApiResponse> {
  try {
    const res = await fetch(`${API_BASE}/admin/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return await res.json();
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Lỗi kết nối khi xóa sản phẩm.',
    };
  }
}

// ================= ADMIN USERS API (DATABASE THẬT) =================
export async function getAdminUsers(): Promise<IUser[]> {
  const json = await fetchAdminData('/admin/users');
  return json?.success && Array.isArray(json.data) ? json.data : [];
}

export async function updateAdminUserRole(userId: number | string, role: string): Promise<ApiResponse<IUser>> {
  try {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role }),
    });
    return await res.json();
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Lỗi kết nối máy chủ khi phân quyền người dùng.',
    };
  }
}

// ================= ADMIN STATS & ORDERS =================
export async function getAdminStats() {
  try {
    const [users, products, orders] = await Promise.all([
      getAdminUsers(),
      getAdminProducts(),
      getAdminOrders(),
    ]);

    const totalRevenue = orders
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return {
      totalProducts: products.length,
      totalOrders: orders.length,
      totalUsers: users.length,
      pendingOrders: orders.filter((o) => o.status === 'PENDING').length,
      completedOrders: orders.filter((o) => o.status === 'COMPLETED').length,
      totalRevenue,
    };
  } catch (error) {
    return {
      totalProducts: 0,
      totalOrders: 0,
      totalUsers: 0,
      pendingOrders: 0,
      completedOrders: 0,
      totalRevenue: 0,
    };
  }
}

export async function getAdminOrders(): Promise<Order[]> {
  const json = await fetchAdminData('/admin/orders');
  return json?.success && Array.isArray(json.data) ? json.data : [];
}

export async function updateAdminOrderStatus(orderId: number | string, status: string): Promise<ApiResponse> {
  try {
    const res = await fetch(`${API_BASE}/admin/orders`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ id: orderId, status }),
    });
    return await res.json();
  } catch (error: any) {
    return { success: false, message: error.message || 'Lỗi kết nối khi cập nhật trạng thái.' };
  }
}
