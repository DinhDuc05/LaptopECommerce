'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Lock, Mail, ArrowRight, Loader2, Laptop } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

// ── Types ─────────────────────────────────────────────────────────────────────
interface LoginForm {
  email: string;
  password: string;
}

// ── Reusable InputField ────────────────────────────────────────────────────────
interface InputFieldProps {
  label: string;
  id: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  icon: React.ReactNode;
  disabled?: boolean;
}

function InputField({ label, id, type, value, onChange, placeholder, icon, disabled }: InputFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-slate-700 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition bg-white"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </span>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const login  = useAuthStore((s) => s.login);

  const [form, setForm]       = useState<LoginForm>({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const setField = (field: keyof LoginForm) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation phía client
    if (!form.email.trim() || !form.password) {
      toast.error('Vui lòng điền đầy đủ email và mật khẩu.');
      return;
    }

    // Giả lập async (nếu sau này thay bằng API call thật thì thay chỗ này)
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600)); // UX: thấy loading rõ ràng hơn

    // Gọi action login từ Zustand store
    const result = login(form.email, form.password);
    setLoading(false);

    if (result.ok) {
      // Lấy lại currentUser từ store để biết role
      const { currentUser } = useAuthStore.getState();
      toast.success(`Chào mừng trở lại, ${currentUser?.fullName}! 🎉`);

      // Phân luồng redirect theo role
      if (currentUser?.role === 'admin' || currentUser?.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } else {
      toast.error(result.message || 'Đăng nhập không thành công.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">

          {/* ── Header ──────────────────────────────────────────────────────── */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-slate-900">Đăng Nhập</h1>
            <p className="text-sm text-slate-500 mt-1.5">
              Chào mừng trở lại! Vui lòng nhập thông tin để tiếp tục.
            </p>
          </div>

          {/* ── Form ────────────────────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Email"
              id="login-email"
              type="email"
              value={form.email}
              onChange={setField('email')}
              placeholder="your@email.com"
              icon={<Mail className="w-4 h-4" />}
              disabled={loading}
            />

            <InputField
              label="Mật khẩu"
              id="login-password"
              type="password"
              value={form.password}
              onChange={setField('password')}
              placeholder="••••••••"
              icon={<Lock className="w-4 h-4" />}
              disabled={loading}
            />

            {/* Submit — spinner + vô hiệu hóa khi loading */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/30 transition"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <>
                  <span>Đăng Nhập Ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* ── Footer link → /register ──────────────────────────────────────── */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-sm text-slate-500">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="font-bold text-blue-600 hover:underline">
              Đăng ký ngay
            </Link>
          </div>
        </div>

        {/* Branding */}
        <div className="mt-5 flex items-center justify-center space-x-1.5 text-xs text-slate-400">
          <Laptop className="w-3.5 h-3.5" />
          <span>LaptopStore – Bảo mật &amp; Tin cậy</span>
        </div>
      </div>
    </div>
  );
}
