'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { getProductBySlug } from '../../../lib/api';
import { Product, ProductVariant } from '../../../types';
import { addToCart, formatVND } from '../../../lib/cart';
import {
  Cpu,
  HardDrive,
  Monitor,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle,
  ShoppingCart,
  Star,
  ChevronRight,
  Sparkles,
  LogIn,
} from 'lucide-react';

// Kiểm tra trạng thái đăng nhập từ Zustand localStorage
function isLoggedIn(): boolean {
  try {
    const raw = localStorage.getItem('laptop-store-auth');
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return !!parsed?.state?.currentUser;
  } catch {
    return false;
  }
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [loading, setLoading] = useState(true);
  const [addedToast, setAddedToast] = useState(false);

  useEffect(() => {
    async function fetchDetail() {
      try {
        setLoading(true);
        const data = await getProductBySlug(slug);
        if (data) {
          setProduct(data);
          if (data.variants && data.variants.length > 0) {
            setSelectedVariant(data.variants[0]);
          }
        }
      } catch (err) {
        console.error('Lỗi tải sản phẩm:', err);
      } finally {
        setLoading(false);
      }
    }
    if (slug) fetchDetail();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent" />
        <p className="mt-3 text-xs text-slate-500 font-medium">Đang tải cấu hình laptop...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Không tìm thấy sản phẩm</h2>
        <p className="text-xs text-slate-500 mt-2">Sản phẩm này có thể đã ngừng kinh doanh hoặc đường dẫn sai.</p>
        <Link href="/" className="mt-4 inline-block px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl">
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  const handleAddToCart = (redirect = false) => {
    if (!selectedVariant) return;

    // Guard: phải đăng nhập mới được thêm vào giỏ hoặc mua ngay
    if (!isLoggedIn()) {
      toast.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!', {
        duration: 3000,
        icon: '🔒',
      });
      router.push(`/login?from=/products/${slug}`);
      return;
    }

    addToCart({
      variantId: selectedVariant.id,
      productId: product.id,
      productName: product.name,
      thumbnailUrl: product.thumbnailUrl,
      variantInfo: `${selectedVariant.cpu} / ${selectedVariant.ramGb}GB / ${selectedVariant.storage} / ${selectedVariant.color}`,
      price: selectedVariant.price,
      quantity: 1,
      stockQuantity: selectedVariant.stockQuantity,
    });

    if (redirect) {
      router.push('/cart');
    } else {
      setAddedToast(true);
      setTimeout(() => setAddedToast(false), 2500);
    }
  };

  const discountPercent =
    selectedVariant?.originalPrice && selectedVariant.originalPrice > selectedVariant.price
      ? Math.round(((selectedVariant.originalPrice - selectedVariant.price) / selectedVariant.originalPrice) * 100)
      : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast thông báo thêm thành công */}
      {addedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2 animate-bounce">
          <CheckCircle className="w-5 h-5" />
          <span className="text-xs font-bold">Đã thêm vào giỏ hàng thành công!</span>
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-slate-500 mb-6">
        <Link href="/" className="hover:text-blue-600">Trang chủ</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href={`/?category=${product.category?.slug}`} className="hover:text-blue-600">
          {product.category?.name || 'Laptop'}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Product Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm">
        {/* Left: Image */}
        <div>
          <div className="aspect-[4/3] rounded-2xl bg-slate-100 overflow-hidden border border-slate-100 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.thumbnailUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {discountPercent > 0 && (
              <div className="absolute top-4 left-4 bg-rose-600 text-white px-3 py-1 rounded-full text-xs font-black shadow-md">
                Giảm {discountPercent}%
              </div>
            )}
          </div>

          {/* Cam kết mua hàng */}
          <div className="mt-6 grid grid-cols-3 gap-3 border border-slate-100 rounded-2xl p-4 bg-slate-50/50 text-[11px] text-slate-600">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Chính hãng 100%</span>
            </div>
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Giao toàn quốc COD</span>
            </div>
            <div className="flex items-center space-x-2">
              <RotateCcw className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Đổi mới 30 ngày</span>
            </div>
          </div>
        </div>

        {/* Right: Info & Variant Picker */}
        <div className="flex flex-col">
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700">
              {product.brand?.name}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">SKU: {selectedVariant?.sku}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-snug">
            {product.name}
          </h1>

          {/* Pricing */}
          <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-baseline space-x-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-600">
              {selectedVariant ? formatVND(selectedVariant.price) : '0đ'}
            </span>
            {selectedVariant?.originalPrice && (
              <span className="text-sm text-slate-400 line-through">
                {formatVND(selectedVariant.originalPrice)}
              </span>
            )}
            <span className="ml-auto text-xs font-semibold text-emerald-600 flex items-center space-x-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Còn {selectedVariant?.stockQuantity || 0} máy</span>
            </span>
          </div>

          {/* Chọn phiên bản cấu hình */}
          {product.variants && product.variants.length > 0 && (
            <div className="mt-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Chọn Cấu Hình & Màu Sắc
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`text-left p-3.5 rounded-xl border text-xs transition relative ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="font-bold text-slate-900">{v.color}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {v.ramGb}GB RAM • {v.storage}
                      </div>
                      <div className="font-extrabold text-blue-600 mt-1">
                        {formatVND(v.price)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Nút Mua Hàng */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <button
              onClick={() => handleAddToCart(false)}
              className="py-3 px-4 rounded-xl border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Thêm Giỏ Hàng</span>
            </button>

            <button
              onClick={() => handleAddToCart(true)}
              className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/30 transition"
            >
              <span>Mua Ngay (COD)</span>
            </button>
          </div>

          {/* Mô tả sản phẩm */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Mô Tả Sản Phẩm</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {product.description || product.summary}
            </p>
          </div>
        </div>
      </div>

      {/* Thông số kỹ thuật chi tiết */}
      {selectedVariant && (
        <div className="mt-10 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-blue-600" />
            <span>Thông Số Kỹ Thuật Chi Tiết ({selectedVariant.sku})</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="flex justify-between py-2.5 px-4 bg-slate-50 rounded-xl">
              <span className="text-slate-500 font-medium">Vi xử lý (CPU):</span>
              <span className="text-slate-900 font-bold">{selectedVariant.cpu}</span>
            </div>
            <div className="flex justify-between py-2.5 px-4 bg-slate-50 rounded-xl">
              <span className="text-slate-500 font-medium">Bộ nhớ RAM:</span>
              <span className="text-slate-900 font-bold">{selectedVariant.ramGb} GB</span>
            </div>
            <div className="flex justify-between py-2.5 px-4 bg-slate-50 rounded-xl">
              <span className="text-slate-500 font-medium">Ổ cứng lưu trữ:</span>
              <span className="text-slate-900 font-bold">{selectedVariant.storage}</span>
            </div>
            <div className="flex justify-between py-2.5 px-4 bg-slate-50 rounded-xl">
              <span className="text-slate-500 font-medium">Card đồ họa (VGA):</span>
              <span className="text-slate-900 font-bold">{selectedVariant.vga || 'Tích hợp'}</span>
            </div>
            <div className="flex justify-between py-2.5 px-4 bg-slate-50 rounded-xl">
              <span className="text-slate-500 font-medium">Màn hình:</span>
              <span className="text-slate-900 font-bold">{selectedVariant.screenSize}</span>
            </div>
            <div className="flex justify-between py-2.5 px-4 bg-slate-50 rounded-xl">
              <span className="text-slate-500 font-medium">Màu sắc:</span>
              <span className="text-slate-900 font-bold">{selectedVariant.color}</span>
            </div>
          </div>
        </div>
      )}

      {/* Đánh giá từ khách hàng */}
      <div className="mt-10 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center space-x-2">
          <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
          <span>Đánh Giá & Nhận Xét Của Người Dùng</span>
        </h2>

        {product.reviews && product.reviews.length > 0 ? (
          <div className="space-y-4">
            {product.reviews.map((r) => (
              <div key={r.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{r.customerName}</span>
                  <div className="flex items-center space-x-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < r.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">{r.comment}</p>
                <div className="mt-2 text-[10px] text-slate-400">{r.createdAt}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500">Chưa có đánh giá nào cho sản phẩm này.</p>
        )}
      </div>
    </div>
  );
}

