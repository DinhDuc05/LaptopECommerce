'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Filter, RotateCcw, Search } from 'lucide-react';
import { Category, Brand } from '../types';

interface FilterSidebarProps {
  categories: Category[];
  brands: Brand[];
}

export default function FilterSidebar({ categories, brands }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const selectedCategory = searchParams.get('category') || '';
  const selectedBrand = searchParams.get('brand') || '';
  const selectedCpu = searchParams.get('cpu') || '';
  const selectedRam = searchParams.get('ram') || '';
  const selectedPriceRange = searchParams.get('priceRange') || '';

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page'); // Reset trang về 1 khi đổi bộ lọc
    router.push(`/?${params.toString()}`);
  };

  const handlePriceRangeChange = (rangeKey: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedPriceRange === rangeKey) {
      params.delete('priceRange');
      params.delete('minPrice');
      params.delete('maxPrice');
    } else {
      params.set('priceRange', rangeKey);
      if (rangeKey === 'under-15') {
        params.delete('minPrice');
        params.set('maxPrice', '15000000');
      } else if (rangeKey === '15-25') {
        params.set('minPrice', '15000000');
        params.set('maxPrice', '25000000');
      } else if (rangeKey === '25-35') {
        params.set('minPrice', '25000000');
        params.set('maxPrice', '35000000');
      } else if (rangeKey === 'above-35') {
        params.set('minPrice', '35000000');
        params.delete('maxPrice');
      }
    }
    params.delete('page');
    router.push(`/?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('search', search);
  };

  const resetAllFilters = () => {
    setSearch('');
    router.push('/');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2 font-bold text-slate-800 text-sm">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Bộ Lọc Cấu Hình</span>
        </div>
        <button
          onClick={resetAllFilters}
          className="text-xs text-slate-500 hover:text-blue-600 flex items-center space-x-1"
          title="Đặt lại tất cả bộ lọc"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Xóa lọc</span>
        </button>
      </div>

      {/* Tìm kiếm */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-2">Tìm kiếm</label>
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tên laptop, CPU..."
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </form>
      </div>

      {/* Thương hiệu */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-2.5">Thương Hiệu</label>
        <div className="flex flex-wrap gap-1.5">
          {brands.map((b) => {
            const active = selectedBrand === b.slug;
            return (
              <button
                key={b.id}
                onClick={() => updateParam('brand', active ? '' : b.slug)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  active
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {b.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Danh mục */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-2.5">Nhu Cầu Sử Dụng</label>
        <div className="space-y-1.5">
          {categories.map((c) => {
            const active = selectedCategory === c.slug;
            return (
              <button
                key={c.id}
                onClick={() => updateParam('category', active ? '' : c.slug)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition ${
                  active
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mức giá */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-2.5">Khoảng Giá</label>
        <div className="space-y-1.5 text-xs">
          {[
            { id: 'under-15', label: 'Dưới 15 triệu' },
            { id: '15-25', label: '15 - 25 triệu' },
            { id: '25-35', label: '25 - 35 triệu' },
            { id: 'above-35', label: 'Trên 35 triệu' },
          ].map((item) => {
            const active = selectedPriceRange === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handlePriceRangeChange(item.id)}
                className={`w-full text-left px-3 py-1.5 rounded-lg transition ${
                  active
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* CPU */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-2.5">Vi Xử Lý (CPU)</label>
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: 'Intel Core i5', value: 'i5' },
            { label: 'Intel Core i7', value: 'i7' },
            { label: 'AMD Ryzen', value: 'Ryzen' },
            { label: 'Apple M2', value: 'M2' },
          ].map((cpu) => {
            const active = selectedCpu === cpu.value;
            return (
              <button
                key={cpu.value}
                onClick={() => updateParam('cpu', active ? '' : cpu.value)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cpu.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dung lượng RAM */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-2.5">Dung Lượng RAM</label>
        <div className="grid grid-cols-3 gap-1.5">
          {[8, 16, 32].map((ramVal) => {
            const active = selectedRam === String(ramVal);
            return (
              <button
                key={ramVal}
                onClick={() => updateParam('ram', active ? '' : String(ramVal))}
                className={`py-1.5 rounded-lg text-xs font-semibold text-center transition ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {ramVal}GB
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

