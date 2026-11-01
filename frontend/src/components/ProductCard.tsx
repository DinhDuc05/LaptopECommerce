import Link from 'next/link';
import { Cpu, HardDrive, Monitor, CheckCircle2 } from 'lucide-react';
import { Product } from '../types';
import { formatVND } from '../lib/cart';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const primaryVariant = product.variants?.[0];
  const price = primaryVariant?.price || 0;
  const originalPrice = primaryVariant?.originalPrice;

  const discountPercent =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col">
      {/* Thumbnail & Badges */}
      <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.thumbnailUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Brand Tag */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-800 shadow-sm">
          {product.brand?.name || 'Laptop'}
        </div>

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-3 right-3 bg-rose-600 text-white px-2 py-0.5 rounded-full text-[11px] font-extrabold shadow-sm">
            -{discountPercent}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition line-clamp-1">
            {product.name}
          </h3>
        </Link>

        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
          {product.summary || product.description}
        </p>

        {/* Specs highlights */}
        {primaryVariant && (
          <div className="mt-3.5 pt-3.5 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
            <div className="flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">{primaryVariant.cpu.split('(')[0]}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <HardDrive className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{primaryVariant.ramGb}GB / {primaryVariant.storage}</span>
            </div>
          </div>
        )}

        {/* Price & CTA */}
        <div className="mt-auto pt-4 flex items-end justify-between">
          <div>
            <div className="text-lg font-extrabold text-blue-600">
              {formatVND(price)}
            </div>
            {originalPrice && (
              <div className="text-xs text-slate-400 line-through">
                {formatVND(originalPrice)}
              </div>
            )}
          </div>

          <Link
            href={`/products/${product.slug}`}
            className="px-3.5 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl transition"
          >
            Chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
}

