'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCart, updateQuantity, removeFromCart, clearCart, formatVND } from '../../lib/cart';
import { createOrder } from '../../lib/api';
import { CartItem } from '../../types';
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft, CheckCircle2, ShieldCheck, Truck } from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const loadCart = () => {
    setCartItems(getCart());
  };

  useEffect(() => {
    loadCart();

    // Tự động điền thông tin tài khoản nếu đã đăng nhập
    try {
      const userRaw = localStorage.getItem('laptop-store-auth');
      if (userRaw) {
        const user = JSON.parse(userRaw)?.state?.currentUser;
        if (user) {
          if (user.fullName) setCustomerName(user.fullName);
          if (user.email) setCustomerEmail(user.email);
          if (user.phone) setCustomerPhone(user.phone);
        }
      }
    } catch {
      // ignore
    }

    window.addEventListener('cart-updated', loadCart);
    window.addEventListener('auth-changed', loadCart);
    return () => {
      window.removeEventListener('cart-updated', loadCart);
      window.removeEventListener('auth-changed', loadCart);
    };
  }, []);

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (cartItems.length === 0) {
      setErrorMessage('Giỏ hàng của bạn đang trống.');
      return;
    }

    if (!customerName || !customerPhone || !shippingAddress) {
      setErrorMessage('Vui lòng điền đầy đủ: Họ tên, Số điện thoại và Địa chỉ giao hàng.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        shippingAddress: shippingAddress.trim(),
        note: note.trim() || undefined,
        paymentMethod: 'COD',
        totalAmount,
        items: cartItems.map((i) => ({
          variantId: i.variantId,
          productId: i.productId,
          productName: i.productName,
          thumbnailUrl: i.thumbnailUrl,
          variantInfo: i.variantInfo,
          price: i.price,
          quantity: i.quantity,
          subtotal: i.price * i.quantity,
        })),
      };

      const result = await createOrder(payload);

      if (result.success && result.data) {
        setOrderSuccess(result.data);
        clearCart();
      } else {
        setErrorMessage(result.message || 'Có lỗi xảy ra khi tạo đơn hàng.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi mạng khi gửi đơn hàng.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center shadow-lg">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Đặt Hàng Thành Công!</h1>
          <p className="text-xs text-slate-500 mt-2">
            Cảm ơn quý khách đã mua hàng tại LaptopStore. Đơn hàng sẽ được nhân viên liên hệ xác nhận sớm nhất.
          </p>

          <div className="my-6 p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Mã đơn hàng:</span>
              <span className="font-extrabold text-blue-700">{orderSuccess.orderCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Người nhận:</span>
              <span className="font-bold text-slate-800">{orderSuccess.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Số điện thoại:</span>
              <span className="font-bold text-slate-800">{orderSuccess.customerPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Địa chỉ:</span>
              <span className="font-bold text-slate-800 text-right">{orderSuccess.shippingAddress}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-blue-200">
              <span className="text-slate-700 font-bold">Tổng thanh toán COD:</span>
              <span className="font-black text-sm text-blue-600">{formatVND(orderSuccess.totalAmount)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/track?query=${orderSuccess.orderCode}`}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-md shadow-blue-500/20"
            >
              Theo Dõi Đơn Hàng
            </Link>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition"
            >
              Tiếp Tục Mua Sắm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/" className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-6">
        <ArrowLeft className="w-4 h-4" />
        <span>Tiếp tục mua hàng</span>
      </Link>

      <h1 className="text-2xl font-black text-slate-900 mb-8">Giỏ Hàng Của Bạn ({cartItems.length})</h1>

      {cartItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Giỏ hàng của bạn đang trống</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Hãy khám phá các mẫu laptop mới nhất với cấu hình cao và mức giá ưu đãi ngay hôm nay.
          </p>
          <Link
            href="/"
            className="mt-5 inline-block px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-md shadow-blue-500/20"
          >
            Khám phá laptop ngay
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cột sản phẩm trong giỏ (7 cột) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.variantId}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 last:border-0 last:pb-0 gap-4"
                >
                  <div className="flex items-center space-x-3.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.thumbnailUrl}
                      alt={item.productName}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-100"
                    />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">{item.productName}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.variantInfo}</p>
                      <div className="text-xs font-black text-blue-600 mt-1">
                        {formatVND(item.price)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 self-end sm:self-center">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        className="p-1.5 hover:bg-slate-200 text-slate-600 transition"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 text-xs font-bold text-slate-800">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        className="p-1.5 hover:bg-slate-200 text-slate-600 transition"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => removeFromCart(item.variantId)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition"
                      title="Xóa khỏi giỏ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center space-x-1.5">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>Miễn phí vận chuyển toàn quốc cho tất cả đơn hàng laptop!</span>
              </span>
            </div>
          </div>

          {/* Cột thông tin giao hàng & COD (5 cột) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
                Thông Tin Thanh Toán COD
              </h3>

              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleCheckout} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Họ và tên người nhận <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn A"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Số điện thoại liên hệ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Ví dụ: 0912345678"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email nhận thông báo (Không bắt buộc)</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="nguyenvana@gmail.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Địa chỉ nhận hàng chi tiết <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ghi chú giao hàng</label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Giao giờ hành chính, gọi trước khi đến..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Tạm tính:</span>
                    <span>{formatVND(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 mb-3">
                    <span>Phí vận chuyển:</span>
                    <span className="text-emerald-600 font-bold">Miễn phí</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-100">
                    <span>Tổng tiền thanh toán:</span>
                    <span className="text-blue-600 text-base">{formatVND(totalAmount)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-4 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/30 transition"
                >
                  {isSubmitting ? (
                    <span>Đang gửi đơn hàng...</span>
                  ) : (
                    <span>Xác Nhận Đặt Hàng (COD)</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

