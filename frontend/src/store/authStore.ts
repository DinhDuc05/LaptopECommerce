/**
 * ============================================================
 *  AUTH STORE – Zustand Global State
 * ============================================================
 *
 * Quản lý toàn bộ trạng thái xác thực và danh sách users demo.
 * Zustand được chọn vì nhẹ hơn Redux, đơn giản hơn Context API
 * và không cần Provider bọc ngoài.
 *
 * Cấu trúc:
 *  - currentUser: User đang đăng nhập (null = chưa đăng nhập)
 *  - demoUsers: Danh sách tài khoản đã đăng ký (chỉ dùng cho demo,
 *    khi chưa có backend hoàn chỉnh). Được persist vào localStorage.
 *  - Actions: login, logout, register, updateUserRole
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { User, DemoUser, DemoRole } from '../types';

// ── Hằng số ───────────────────────────────────────────────────────────────────
const TOKEN_COOKIE = 'laptop_store_token_v1';
const COOKIE_EXPIRES = 7; // ngày

// Tài khoản admin hardcode — dùng để demo trước khi có database hoàn chỉnh
export const HARDCODED_ADMIN = {
  email: 'thaidinhduc05@gmail.com',
  password: '123456',
  fullName: 'Thái Đình Đức',
  role: 'admin' as DemoRole,
  id: 1,
  createdAt: new Date().toISOString(),
};

// ── Store State Interface ──────────────────────────────────────────────────────
interface AuthState {
  /** User đang đăng nhập. null = chưa đăng nhập */
  currentUser: User | null;

  /** Danh sách user đã đăng ký (demo mode, persist localStorage) */
  demoUsers: DemoUser[];

  // ── Actions ──────────────────────────────────────────────────────────────────
  /**
   * Đăng nhập với logic hardcode demo:
   *  - Nếu email + password khớp admin hardcode → role 'admin'
   *  - Ngược lại → trả về lỗi (false)
   * Trả về: { ok: boolean; message?: string }
   */
  login: (email: string, password: string) => { ok: boolean; message?: string };

  /**
   * Đăng ký tài khoản mới (demo mode).
   * Mặc định role = 'user'.
   * Trả về: { ok: boolean; message?: string }
   */
  register: (payload: { fullName: string; email: string; password: string }) => {
    ok: boolean;
    message?: string;
  };

  /** Đăng xuất — xoá currentUser và cookie */
  logout: () => void;

  /**
   * Admin thay đổi role của user khác.
   * Chỉ tài khoản có role 'admin' mới được gọi action này.
   */
  updateUserRole: (userId: number, newRole: DemoRole) => void;
}

// ── Zustand Store ─────────────────────────────────────────────────────────────
export const useAuthStore = create<AuthState>()(
  // persist: tự động sync state vào localStorage và khôi phục khi reload
  persist(
    (set, get) => ({
      currentUser: null,
      // Khởi tạo danh sách users với tài khoản admin hardcode
      demoUsers: [
        {
          id: HARDCODED_ADMIN.id,
          email: HARDCODED_ADMIN.email,
          fullName: HARDCODED_ADMIN.fullName,
          role: HARDCODED_ADMIN.role,
          createdAt: HARDCODED_ADMIN.createdAt,
        },
      ],

      // ── login ───────────────────────────────────────────────────────────────
      login: (email, password) => {
        const normalizedEmail = email.trim().toLowerCase();

        // Kiểm tra tài khoản admin hardcode trước
        if (
          normalizedEmail === HARDCODED_ADMIN.email &&
          password === HARDCODED_ADMIN.password
        ) {
          const adminUser: User = {
            id: HARDCODED_ADMIN.id,
            email: HARDCODED_ADMIN.email,
            fullName: HARDCODED_ADMIN.fullName,
            role: 'admin',
            isActive: true,
            createdAt: HARDCODED_ADMIN.createdAt,
          };

          // Tạo token demo (không phải JWT thật, chỉ dùng để middleware nhận diện role)
          // Format: base64(header).base64(payload).signature_fake
          const payload = {
            sub: adminUser.id,
            email: adminUser.email,
            role: 'admin', // lowercase để middleware đọc được
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 ngày
          };
          const demoToken = `demo.${btoa(JSON.stringify(payload))}.sig`;

          // Lưu token vào Cookie để Middleware đọc
          Cookies.set(TOKEN_COOKIE, demoToken, {
            expires: COOKIE_EXPIRES,
            sameSite: 'Lax',
          });

          set({ currentUser: adminUser });
          return { ok: true };
        }

        // Kiểm tra trong danh sách users đã đăng ký (demo mode)
        // Lưu ý: demo này không lưu password (không an toàn nếu là production)
        // Trong môi trường thực tế, mật khẩu phải được hash và verify ở backend
        const { demoUsers } = get();
        const found = demoUsers.find((u) => u.email === normalizedEmail);

        if (!found) {
          return {
            ok: false,
            message: 'Email chưa được đăng ký. Vui lòng tạo tài khoản mới.',
          };
        }

        // User tồn tại nhưng đây là demo — chấp nhận bất kỳ mật khẩu nào
        // (vì không lưu hash password trong demo)
        // Trong production, đây sẽ là: bcrypt.compare(password, found.hashedPassword)
        const registeredUser: User = {
          id: found.id,
          email: found.email,
          fullName: found.fullName,
          role: found.role,
          isActive: true,
          createdAt: found.createdAt,
        };

        const payload = {
          sub: registeredUser.id,
          email: registeredUser.email,
          role: registeredUser.role,
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
        };
        const demoToken = `demo.${btoa(JSON.stringify(payload))}.sig`;

        Cookies.set(TOKEN_COOKIE, demoToken, {
          expires: COOKIE_EXPIRES,
          sameSite: 'Lax',
        });

        set({ currentUser: registeredUser });
        return { ok: true };
      },

      // ── register ────────────────────────────────────────────────────────────
      register: ({ fullName, email, password: _password }) => {
        const normalizedEmail = email.trim().toLowerCase();
        const { demoUsers } = get();

        // Kiểm tra email đã tồn tại chưa
        const exists = demoUsers.some((u) => u.email === normalizedEmail);
        if (exists) {
          return {
            ok: false,
            message: 'Email này đã được đăng ký. Vui lòng dùng email khác.',
          };
        }

        // Tạo user mới với role mặc định là 'user'
        const newUser: DemoUser = {
          id: Date.now(), // ID tạm thời dựa trên timestamp
          email: normalizedEmail,
          fullName: fullName.trim(),
          role: 'user', // Mặc định mọi tài khoản đăng ký mới đều là 'user'
          createdAt: new Date().toISOString(),
        };

        // Tạo User object cho currentUser (đăng nhập ngay sau đăng ký)
        const currentUser: User = {
          ...newUser,
          isActive: true,
        };

        const payload = {
          sub: newUser.id,
          email: newUser.email,
          role: 'user',
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
        };
        const demoToken = `demo.${btoa(JSON.stringify(payload))}.sig`;

        Cookies.set(TOKEN_COOKIE, demoToken, {
          expires: COOKIE_EXPIRES,
          sameSite: 'Lax',
        });

        // Thêm user mới vào danh sách và set làm currentUser
        set({
          demoUsers: [...demoUsers, newUser],
          currentUser,
        });

        return { ok: true };
      },

      // ── logout ──────────────────────────────────────────────────────────────
      logout: () => {
        Cookies.remove(TOKEN_COOKIE);
        set({ currentUser: null });
        // Phát event để các component dùng event listener cũng cập nhật
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('auth-changed'));
        }
      },

      // ── updateUserRole ──────────────────────────────────────────────────────
      updateUserRole: (userId, newRole) => {
        const { currentUser, demoUsers } = get();

        // Chỉ admin mới được thực hiện action này
        if (currentUser?.role !== 'admin') return;

        // Cập nhật role trong danh sách demoUsers
        const updatedUsers = demoUsers.map((u) =>
          u.id === userId ? { ...u, role: newRole } : u
        );

        set({ demoUsers: updatedUsers });
      },
    }),
    {
      name: 'laptop-store-auth', // key lưu trong localStorage
      storage: createJSONStorage(() => localStorage),
      // Chỉ persist currentUser và demoUsers, không persist actions
      partialize: (state) => ({
        currentUser: state.currentUser,
        demoUsers: state.demoUsers,
      }),
    }
  )
);

// ── Selector helpers — dùng để tránh subscribe toàn bộ store ─────────────────
export const useCurrentUser = () => useAuthStore((s) => s.currentUser);
export const useIsLoggedIn  = () => useAuthStore((s) => !!s.currentUser);
export const useIsAdmin     = () =>
  useAuthStore((s) => s.currentUser?.role === 'admin' || s.currentUser?.role === 'ADMIN');
export const useDemoUsers   = () => useAuthStore((s) => s.demoUsers);

