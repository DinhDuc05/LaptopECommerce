'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { UserPlus, Lock, Mail, User, ArrowRight, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { registerApi } from '../../lib/api';
import { setAuth } from '../../lib/auth';

// ── Types ─────────────────────────────────────────────────────────────────────
interface RegisterForm {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// ── Validation helpers ─────────────────────────────────────────────────────────
/** Kiểm tra định dạng email. */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Kiểm tra độ mạnh mật khẩu.
 * Trả về chuỗi lỗi nếu không hợp lệ, null nếu OK.
 */
function validatePassword(pw: string): string | null {
  if (pw.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự.';
  return null;
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
  hint?: string;
  /** className bổ sung cho input (dùng cho trạng thái lỗi real-time) */
  inputClassName?: string;
  children?: React.ReactNode;
}

function InputField({
  label, id, type, value, onChange, placeholder, icon,
  disabled, hint, inputClassName, children,
}: InputFieldProps) {
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
          className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition bg-white ${inputClassName ?? 'border-slate-200'}`}
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </span>
      </div>
      {hint && <p className="mt-1 text-[11px] text-slate-400">{hint}</p>}
      {children}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const router   = useRouter();
  const register = useAuthStore((s) => s.register);

  const [form, setForm]       = useState<RegisterForm>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const setField = (field: keyof RegisterForm) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // Real-time: password mismatch indicator
  const passwordMismatch =
    form.confirmPassword.length > 0 && form.confirmPassword !== form.password;
  const passwordMatch =
    form.confirmPassword.length > 0 && form.confirmPassword === form.password;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ── Validation phía client ─────────────────────────────────────────────
    if (!form.fullName.trim()) {
      toast.error('Vui lòng nhập họ và tên.');
      return;
    }
    if (!isValidEmail(form.email)) {
      toast.error('Địa chỉ email không hợp lệ.');
      return;
    }
    const pwErr = validatePassword(form.password);
    if (pwErr) {
      toast.error(pwErr);
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp.');
      return;
    }

    // ── Gọi API đăng ký lưu trực tiếp vào Database thật ───────────────────
    setLoading(true);
    try {
      const res = await registerApi({
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      if (res.success && res.user) {
        if (res.token) {
          setAuth(res.token, res.user);
        }
        useAuthStore.setState({ currentUser: res.user });
        window.dispatchEvent(new Event('auth-changed'));
        window.dispatchEvent(new Event('user-registered'));
        window.dispatchEvent(new Event('cart-updated'));

        toast.success(`Chào mừng, ${res.user.fullName}! Tài khoản đã được tạo. 🎉`);
        router.push('/');
      } else {
        toast.error(res.message || 'Đăng ký không thành công. Vui lòng thử lại.');
      }
    } catch (err: any) {
      toast.error('Lỗi khi đăng ký: ' + (err.message || 'Lỗi kết nối'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">

          {/* ── Header ──────────────────────────────────────────────────────── */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
              <UserPlus className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-slate-900">Tạo Tài Khoản</h1>
            <p className="text-sm text-slate-500 mt-1.5">
              Đăng ký miễn phí để mua hàng và theo dõi đơn hàng.
            </p>
          </div>

          {/* ── Form ────────────────────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Họ và tên */}
            <InputField
              label="Họ và tên"
              id="reg-fullname"
              type="text"
              value={form.fullName}
              onChange={setField('fullName')}
              placeholder="Nguyễn Văn A"
              icon={<User className="w-4 h-4" />}
              disabled={loading}
            />

            {/* Email */}
            <InputField
              label="Email"
              id="reg-email"
              type="email"
              value={form.email}
              onChange={setField('email')}
              placeholder="your@email.com"
              icon={<Mail className="w-4 h-4" />}
              disabled={loading}
            />

            {/* Mật khẩu */}
            <InputField
              label="Mật khẩu"
              id="reg-password"
              type="password"
              value={form.password}
              onChange={setField('password')}
              placeholder="••••••••"
              icon={<Lock className="w-4 h-4" />}
              disabled={loading}
              hint="Ít nhất 6 ký tự."
            />

            {/* Xác nhận mật khẩu — có real-time feedback màu sắc */}
            <InputField
              label="Xác nhận mật khẩu"
              id="reg-confirm"
              type="password"
              value={form.confirmPassword}
              onChange={setField('confirmPassword')}
              placeholder="••••••••"
              icon={<Lock className="w-4 h-4" />}
              disabled={loading}
              inputClassName={
                passwordMismatch
                  ? 'border-rose-400 bg-rose-50'
                  : passwordMatch
                  ? 'border-emerald-400 bg-emerald-50/30'
                  : 'border-slate-200'
              }
            >
              {/* Real-time feedback text */}
              {passwordMismatch && (
                <p className="mt-1 text-[11px] text-rose-500 font-semibold">
                  Mật khẩu chưa khớp.
                </p>
              )}
              {passwordMatch && (
                <p className="mt-1 text-[11px] text-emerald-600 font-semibold">
                  ✓ Mật khẩu khớp.
                </p>
              )}
            </InputField>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/30 transition"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang tạo tài khoản...</span>
                </>
              ) : (
                <>
                  <span>Tạo Tài Khoản Ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* ── Footer link → /login ──────────────────────────────────────────── */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-sm text-slate-500">
            Đã có tài khoản?{' '}
            <Link href="/login" className="font-bold text-blue-600 hover:underline">
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
