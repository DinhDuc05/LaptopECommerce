'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  ShoppingCart, Laptop, PackageCheck, ShieldCheck,
  LogOut, LogIn, UserPlus,
} from 'lucide-react';
import { getCartCount } from '../lib/cart';
import { useAuthStore } from '../store/authStore';

export default function Navbar() {
  const router = useRouter();

  // ── Đọc trạng thái từ Zustand store ────────────────────────────────────────
  // useAuthStore tự động re-render khi currentUser thay đổi
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout      = useAuthStore((s) => s.logout);

  // Kiểm tra role admin (hỗ trợ cả lowercase 'admin' và uppercase 'ADMIN')
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'ADMIN';

  // ── Giỏ hàng — vẫn dùng event listener vì cart dùng localStorage riêng ─────
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Cập nhật số lượng giỏ hàng khi component mount
    setCartCount(getCartCount());

    const handleCartUpdate = () => setCartCount(getCartCount());
    window.addEventListener('cart-updated', handleCartUpdate);
    return () => window.removeEventListener('cart-updated', handleCartUpdate);
  }, []);

  // ── Xử lý đăng xuất ────────────────────────────────────────────────────────
  const handleLogout = () => {
    const name = currentUser?.fullName ?? 'bạn';
    logout(); // Xoá currentUser trong store + xoá Cookie
    // toast được gọi ở đây nhưng cần import — dùng toast từ react-hot-toast
    // Đơn giản hơn: redirect + để Zustand update UI tự động
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ──────────────────────────────────────────────────────── */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30 group-hover:bg-blue-700 transition">
              <Laptop className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-blue-600 transition">
                Laptop<span className="text-blue-600">Store</span>
              </span>
              <span className="block text-[10px] uppercase font-semibold tracking-wider text-slate-500">
                Siêu Nhẹ • Chuẩn AWS
              </span>
            </div>
          </Link>

          {/* ── Nav links ────────────────────────────────────────────────── */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-700">
            <Link href="/" className="hover:text-blue-600 transition flex items-center space-x-1">
              <span>Sản Phẩm</span>
            </Link>
            <Link href="/track" className="hover:text-blue-600 transition flex items-center space-x-1">
              <PackageCheck className="w-4 h-4 text-emerald-600" />
              <span>Tra Cứu Đơn Hàng</span>
            </Link>

            {/* Hiện link Trang Quản Trị nếu user là admin */}
            {isAdmin && (
              <Link
                href="/admin"
                className="hover:text-blue-600 transition flex items-center space-x-1 text-purple-700 font-bold bg-purple-50 px-2.5 py-1 rounded-lg"
              >
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>Trang Quản Trị</span>
              </Link>
            )}
          </nav>

          {/* ── Right actions ────────────────────────────────────────────── */}
          <div className="flex items-center space-x-3">
            {/* Giỏ hàng */}
            <Link
              href="/cart"
              className="relative p-2.5 text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 rounded-xl transition flex items-center space-x-2"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden sm:inline text-xs font-semibold">Giỏ</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* ── Khu vực Tài khoản ────────────────────────────────────── */}
            {currentUser ? (
              /* ĐÃ đăng nhập: hiện tên + badge role + nút logout */
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    {currentUser.fullName}
                  </span>
                  <span className="text-[10px] font-semibold text-blue-600 uppercase">
                    {isAdmin ? '🛡️ Quản Trị Viên' : '👤 Khách Hàng'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Đăng xuất"
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition flex items-center space-x-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs font-semibold">Đăng Xuất</span>
                </button>
              </div>
            ) : (
              /* CHƯA đăng nhập: hiện nút Đăng Nhập + Đăng Ký */
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <Link
                  href="/login"
                  className="px-3 py-2 text-xs font-bold text-slate-700 hover:text-blue-600 rounded-xl transition flex items-center space-x-1"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Đăng Nhập</span>
                </Link>
                <Link
                  href="/register"
                  className="hidden sm:flex px-3 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition items-center space-x-1 shadow-sm"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Đăng Ký</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
