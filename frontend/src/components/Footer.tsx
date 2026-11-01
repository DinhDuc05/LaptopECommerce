import Link from 'next/link';
import { ShieldCheck, Truck, RotateCcw, Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-20 border-t border-slate-800">
      {/* Policy Highlights */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-b border-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Giao Hàng Toàn Quốc</h4>
              <p className="text-xs text-slate-400">Kiểm tra hàng trước khi thanh toán COD</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Cam Kết Chính Hãng</h4>
              <p className="text-xs text-slate-400">Bảo hành 12-24 tháng chính hãng 100%</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Đổi Trả Dễ Dàng</h4>
              <p className="text-xs text-slate-400">1 đổi 1 trong 30 ngày nếu có lỗi phần cứng</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Hệ Thống Tối Ưu RAM</h4>
              <p className="text-xs text-slate-400">Vận hành siêu mượt dưới 500MB RAM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <span className="font-extrabold text-xl text-white tracking-tight">
              Laptop<span className="text-blue-500">Store</span>
            </span>
            <p className="text-xs text-slate-400 mt-3 leading-relaxed">
              Hệ thống bán lẻ laptop cao cấp thiết kế theo tiêu chuẩn công nghệ siêu nhẹ (Ultra Lightweight Cloud Architecture).
              Vận hành bền bỉ trên AWS t3.small, tối ưu hóa tối đa RAM/CPU.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Danh Mục Phổ Biến</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/?category=laptop-mong-nhe" className="hover:text-blue-400 transition">Laptop Mỏng Nhẹ</Link></li>
              <li><Link href="/?category=laptop-doanh-nhan" className="hover:text-blue-400 transition">Laptop Doanh Nhân Cao Cấp</Link></li>
              <li><Link href="/?category=laptop-gaming" className="hover:text-blue-400 transition">Laptop Gaming Hiệu Năng Cao</Link></li>
              <li><Link href="/?category=laptop-sinh-vien-van-phong" className="hover:text-blue-400 transition">Laptop Sinh Viên - Văn Phòng</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Hỗ Trợ Khách Hàng</h4>
            <p className="text-xs text-slate-400">Hotline: <strong className="text-white">1800 6868</strong> (Miễn phí 8:00 - 21:00)</p>
            <p className="text-xs text-slate-400 mt-2">Email: support@laptopstore.vn</p>
            <p className="text-xs text-slate-400 mt-2">Địa chỉ: D:\LaptopECommerce - Triển khai cục bộ</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} LaptopStore. All rights reserved. Designed for AWS t3.small (RAM &lt; 500MB).
        </div>
      </div>
    </footer>
  );
}

