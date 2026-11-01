import { CartItem } from '../types';

/**
 * ============================================================================
 * MULTI-USER CART MANAGER (PHÂN BIỆT GIỎ HÀNG RIÊNG TỪNG USER)
 * ============================================================================
 *
 * Mỗi tài khoản người dùng có 1 kho lưu trữ giỏ hàng độc lập trong LocalStorage:
 * - Khi User A đăng nhập: Lưu vào 'laptop_store_cart_user_<email_or_id>'
 * - Khi User B đăng nhập: Lưu vào 'laptop_store_cart_user_<email_or_id>'
 * - Khi chưa đăng nhập (khách vãng lai): Lưu vào 'laptop_store_cart_guest'
 *
 * Nhờ đó, việc thêm/sửa/xóa hoặc đặt hàng của người này hoàn toàn không ảnh hưởng
 * đến giỏ hàng của người khác.
 */

// Hàm xác định storage key theo tài khoản đang đăng nhập
export function getCartStorageKey(): string {
  if (typeof window === 'undefined') return 'laptop_store_cart_guest';
  try {
    // 1. Kiểm tra từ Zustand persist store
    const authRaw = localStorage.getItem('laptop-store-auth');
    if (authRaw) {
      const parsed = JSON.parse(authRaw);
      const user = parsed?.state?.currentUser;
      if (user && user.email) {
        return `laptop_store_cart_user_${user.email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      }
    }
    // 2. Kiểm tra từ user key dự phòng
    const userRaw = localStorage.getItem('laptop_store_user_v1');
    if (userRaw) {
      const user = JSON.parse(userRaw);
      if (user && user.email) {
        return `laptop_store_cart_user_${user.email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      }
    }
  } catch (e) {
    // ignore
  }
  return 'laptop_store_cart_guest';
}

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const key = getCartStorageKey();
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Lỗi đọc giỏ hàng từ LocalStorage:', e);
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    const key = getCartStorageKey();
    localStorage.setItem(key, JSON.stringify(items));
    window.dispatchEvent(new Event('cart-updated'));
  } catch (e) {
    console.error('Lỗi lưu giỏ hàng vào LocalStorage:', e);
  }
}

export function addToCart(item: CartItem): void {
  const cart = getCart();
  const existingIndex = cart.findIndex((i) => i.variantId === item.variantId);

  if (existingIndex > -1) {
    cart[existingIndex].quantity += item.quantity;
  } else {
    cart.push(item);
  }

  saveCart(cart);
}

export function updateQuantity(variantId: number, quantity: number): void {
  const cart = getCart();
  const index = cart.findIndex((i) => i.variantId === variantId);

  if (index > -1) {
    if (quantity <= 0) {
      cart.splice(index, 1);
    } else {
      cart[index].quantity = quantity;
    }
    saveCart(cart);
  }
}

export function removeFromCart(variantId: number): void {
  const cart = getCart().filter((i) => i.variantId !== variantId);
  saveCart(cart);
}

export function clearCart(): void {
  if (typeof window === 'undefined') return;
  const key = getCartStorageKey();
  localStorage.removeItem(key);
  window.dispatchEvent(new Event('cart-updated'));
}

export function getCartTotal(): number {
  return getCart().reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function getCartCount(): number {
  return getCart().reduce((count, item) => count + item.quantity, 0);
}

export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Tự động đồng bộ giỏ hàng khi người dùng Đăng nhập / Đăng xuất / Đổi tài khoản
if (typeof window !== 'undefined') {
  window.addEventListener('auth-changed', () => {
    window.dispatchEvent(new Event('cart-updated'));
  });
}
