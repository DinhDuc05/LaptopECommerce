import { NextRequest, NextResponse } from 'next/server';
import { getProductsFromDb } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const products = await getProductsFromDb();
    const product = products.find(
      (item) => item.isActive && (item.slug === params.slug || String(item.id) === params.slug)
    );

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy sản phẩm.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error('Lỗi API GET /api/products/[slug]:', error);
    return NextResponse.json(
      { success: false, message: 'Không thể tải sản phẩm.' },
      { status: 500 }
    );
  }
}
