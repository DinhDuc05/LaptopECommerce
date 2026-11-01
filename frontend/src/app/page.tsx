import { Suspense } from 'react';
import { getProducts, getCategories, getBrands } from '../lib/api';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import { Sparkles, Shield, Cpu, Zap } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface HomePageProps {
  searchParams: {
    category?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    cpu?: string;
    ram?: string;
    search?: string;
    sort?: string;
    page?: string;
  };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  // Lấy dữ liệu danh mục & thương hiệu
  const [categories, brands] = await Promise.all([
    getCategories(),
    getBrands(),
  ]);

  // Lấy danh sách sản phẩm theo query
  let productsData: { products: any[]; pagination: any } = {
    products: [],
    pagination: { total: 0, page: 1, totalPages: 1 },
  };

  try {
    productsData = await getProducts({
      category: searchParams.category,
      brand: searchParams.brand,
      minPrice: searchParams.minPrice,
      maxPrice: searchParams.maxPrice,
      cpu: searchParams.cpu,
      ram: searchParams.ram,
      search: searchParams.search,
      sort: searchParams.sort,
      page: searchParams.page,
    });
  } catch (e) {
    console.error('Không thể gọi API Backend từ Next.js:', e);
  }

  const { products, pagination } = productsData;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Banner Tối Giản Hiện Đại */}
      <div className="relative rounded-3xl bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 p-8 sm:p-12 mb-10 text-white overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-4 border border-blue-400/20">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Kiến Trúc Tối Ưu RAM AWS t3.small (&lt; 500MB)</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Laptop Đỉnh Cao. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              Trải Nghiệm Mượt Mà.
            </span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
            Chính hãng Apple, Dell, Asus, Lenovo, HP. Miễn phí vận chuyển toàn quốc, kiểm tra hàng nhận COD tiện lợi.
          </p>

          <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold text-slate-300">
            <div className="flex items-center space-x-1.5">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Bảo hành chính hãng 12-24T</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Giao siêu tốc 2H nội thành</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Cpu className="w-4 h-4 text-blue-400" />
              <span>Cấu hình chuẩn 100%</span>
            </div>
          </div>
        </div>

        {/* Decorative blur circle */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main Grid: Sidebar + Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Bộ lọc */}
        <aside className="lg:col-span-1">
          <div className="sticky top-20">
            <Suspense fallback={
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm text-xs text-slate-400">
                Đang tải bộ lọc...
              </div>
            }>
              <FilterSidebar categories={categories} brands={brands} />
            </Suspense>
          </div>
        </aside>

        {/* Danh sách Laptop */}
        <main className="lg:col-span-3">
          {/* Header kết quả */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-slate-200 gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Danh Sách Laptop</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Hiển thị {products.length} trong tổng số {pagination.total} sản phẩm
              </p>
            </div>
          </div>

          {/* Grid Products */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
                <Cpu className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Không tìm thấy laptop phù hợp</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Hãy thử xóa bớt các tiêu chí lọc cấu hình hoặc tìm kiếm với từ khóa khác.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

