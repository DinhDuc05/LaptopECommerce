'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { lookupOrder } from '../../lib/api';
import { Order } from '../../types';
import { formatVND } from '../../lib/cart';
import { Search, Package, Clock, CheckCircle2, Truck, AlertCircle, Laptop } from 'lucide-react';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('query') || '';

  const [query, setQuery] = useState(initialQuery);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (targetQuery: string) => {
    if (!targetQuery.trim()) return;
    try {
      setLoading(true);
      setError('');
      setSearched(true);
      const res = await lookupOrder(targetQuery);
      if (res.success && res.data) {
        setOrders(res.data);
      } else {
        setOrders([]);
        setError(res.message || 'Không tìm thấy đơn hàng nào.');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tra cứu.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-200">Chờ xác nhận</span>;
      case 'PROCESSING':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-200">Đang chuẩn bị</span>;
      case 'SHIPPING':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-600 border border-purple-200">Đang giao hàng</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">Đã giao thành công</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-200">Đã hủy</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">{status}</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center max-w-lg mx-auto mb-8">
        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Package className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Tra Cứu Lịch Sử Đơn Hàng</h1>
        <p className="text-xs text-slate-500 mt-1">
          Nhập Mã đơn hàng (VD: ORD-20261027-001) hoặc Số điện thoại đặt hàng để kiểm tra tiến trình giao hàng.
        </p>
      </div>

      {/* Thanh tìm kiếm */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch(query);
        }}
        className="flex gap-2 max-w-md mx-auto mb-10"
      >
        <div className="relative flex-1">
          <input
            type="text"
            required
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Mã đơn (ORD-...) hoặc Số điện thoại"
            className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-md shadow-blue-500/20"
        >
          {loading ? 'Đang tìm...' : 'Tra cứu'}
        </button>
      </form>

      {/* Kết quả */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs text-center font-medium max-w-md mx-auto">
          {error}
        </div>
      )}

      {orders.length > 0 && (
        <div className="space-y-6">
          {orders.map((o) => (
            <div key={o.id} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-black text-blue-600">{o.orderCode}</span>
                    {getStatusBadge(o.status)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Thời gian tạo: {new Date(o.createdAt).toLocaleString('vi-VN')}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-500">Tổng thanh toán COD:</div>
                  <div className="text-base font-black text-slate-900">{formatVND(o.totalAmount)}</div>
                </div>
              </div>

              {/* Thông tin nhận hàng */}
              <div className="my-4 p-4 rounded-2xl bg-slate-50 text-xs text-slate-600 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400">Người nhận:</span>{' '}
                  <strong className="text-slate-800">{o.customerName}</strong> ({o.customerPhone})
                </div>
                <div>
                  <span className="text-slate-400">Địa chỉ giao:</span>{' '}
                  <span className="text-slate-800 font-medium">{o.shippingAddress}</span>
                </div>
                {o.note && (
                  <div className="sm:col-span-2">
                    <span className="text-slate-400">Ghi chú:</span> {o.note}
                  </div>
                )}
              </div>

              {/* Danh sách items */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Sản Phẩm Trong Đơn
                </h4>
                {o.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center py-2 px-3 rounded-xl bg-slate-50 text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <Laptop className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <div className="font-bold text-slate-900">{item.productName}</div>
                        <div className="text-[10px] text-slate-500">{item.variantInfo}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-800">{formatVND(item.price)} x {item.quantity}</div>
                      <div className="text-[11px] text-blue-600 font-extrabold">{formatVND(item.subtotal)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {searched && !loading && orders.length === 0 && !error && (
        <div className="text-center py-10 text-xs text-slate-400">
          Không tìm thấy đơn hàng nào.
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs text-slate-500">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3" />
        <div>Đang tải trang tra cứu đơn hàng...</div>
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  );
}
