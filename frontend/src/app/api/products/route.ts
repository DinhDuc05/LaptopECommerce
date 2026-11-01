import { NextRequest, NextResponse } from 'next/server';
import { getProductsFromDb } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const products = await getProductsFromDb();
    const { searchParams } = new URL(request.url);
    const brand = searchParams.get('brand');
    const category = searchParams.get('category');
    const search = searchParams.get('search')?.trim().toLowerCase();

    const filtered = products.filter((product) => {
      if (!product.isActive) return false;
      if (brand && product.brand?.slug !== brand) return false;
      if (category && product.category?.slug !== category) return false;
      if (search && !product.name.toLowerCase().includes(search)) return false;
      return true;
    });

    return NextResponse.json({
      success: true,
      data: filtered,
      pagination: { total: filtered.length, page: 1, totalPages: 1 },
    });
  } catch (error) {
    console.error('Lỗi API GET /api/products:', error);
    return NextResponse.json(
      { success: false, message: 'Không thể tải danh sách sản phẩm.' },
      { status: 500 }
    );
  }
}
