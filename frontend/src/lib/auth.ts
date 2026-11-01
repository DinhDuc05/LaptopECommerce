/**
 * auth.ts — Các helper tiện ích cho xác thực
 *
 * File này giữ vai trò là adapter/bridge giữa:
 *  - Zustand store (Global State chính)
 *  - Cookie (để Middleware đọc được)
 *  - localStorage (fallback và cho Navbar event listener)
 *
 * Các component NÊN dùng Zustand hooks trực tiếp (useAuthStore),
 * nhưng file này vẫn cần thiết cho:
 *  1. API layer (getAuthHeaders) — không thể gọi hook trong module thường
 *  2. Backward compatibility với code cũ
 *  3. Navbar đang dùng event listener pattern
 */

import Cookies from 'js-cookie';
import { User } from '../types';

const TOKEN_COOKIE = 'laptop_store_token_v1';
const USER_KEY     = 'laptop_store_user_v1';

// ── Lấy token từ Cookie (dùng được ở cả client lẫn Edge Middleware) ───────────
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return Cookies.get(TOKEN_COOKIE) ?? null;
}

// ── Lấy thông tin user — ưu tiên localStorage (sync với Zustand persist) ──────
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    // Zustand persist lưu toàn bộ state vào key 'laptop-store-auth'
    const raw = localStorage.getItem('laptop-store-auth');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { currentUser?: User } };
    return parsed?.state?.currentUser ?? null;
  } catch {
    return null;
  }
}

// ── setAuth — dùng cho trường hợp backend trả về token thật ──────────────────
// (khi tích hợp backend đầy đủ, gọi hàm này thay vì dùng store.login)
export function setAuth(token: string, user: User): void {
  if (typeof window === 'undefined') return;

  Cookies.set(TOKEN_COOKIE, token, {
    expires: 7,
    sameSite: 'Lax',
    secure: process.env.NODE_ENV === 'production',
  });

  // Lưu vào localStorage theo format Zustand persist để getCurrentUser() đọc được
  const existing = (() => {
    try {
      return JSON.parse(localStorage.getItem('laptop-store-auth') || '{}');
    } catch {
      return {};
    }
  })();
  localStorage.setItem(
    'laptop-store-auth',
    JSON.stringify({ ...existing, state: { ...(existing.state || {}), currentUser: user } })
  );

  window.dispatchEvent(new Event('auth-changed'));
}

// ── clearAuth — tương thích với code cũ, thực tế nên gọi store.logout() ───────
export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  Cookies.remove(TOKEN_COOKIE);
  // Xoá currentUser trong Zustand persist store
  try {
    const raw = localStorage.getItem('laptop-store-auth');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.state) parsed.state.currentUser = null;
      localStorage.setItem('laptop-store-auth', JSON.stringify(parsed));
    }
  } catch { /* ignore */ }
  window.dispatchEvent(new Event('auth-changed'));
}

// ── Helpers tiện ích ──────────────────────────────────────────────────────────
export function isLoggedIn(): boolean {
  return !!getToken();
}

export function isAdmin(): boolean {
  const user = getCurrentUser();
  return user?.role === 'ADMIN' || user?.role === 'admin';
}

// ── getAuthHeaders — dùng cho API layer khi gọi backend thật ─────────────────
export function getAuthHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}
