import './globals.css';
import type { Metadata } from 'next';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ToastProvider from '../components/ToastProvider';

export const metadata: Metadata = {
  title: 'LaptopStore - Website Bán Laptop Siêu Nhẹ Chuẩn AWS t3.small',
  description: 'Hệ thống thương mại điện tử chuyên cung cấp laptop cao cấp chính hãng Apple, Dell, Asus, Lenovo, HP. Tối ưu cực hạn RAM/CPU.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="flex flex-col min-h-screen antialiased bg-slate-50 text-slate-900">
        <Navbar />
        <ToastProvider />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

