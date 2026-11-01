import { NextRequest, NextResponse } from 'next/server';
import { getProductsFromDb, createProductInDb } from '../../../../lib/db';
import { CreateProductInput } from '../../../../types/models';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/products
 * Truy vấn danh sách laptop quản trị từ Database thật
 */
export async function GET() {
  try {
    const products = await getProductsFromDb();
    return NextResponse.json(
      {
        success: true,
        message: 'Lấy danh sách sản phẩm thành công',
        data: products,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Lỗi API GET /api/admin/products:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Lỗi máy chủ khi truy vấn danh sách sản phẩm: ' + (error.message || 'Unknown error'),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/products
 * Insert sản phẩm mới vào Database thật
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateProductInput = await request.json();

    if (!body.name || !body.categoryId || !body.brandId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Vui lòng cung cấp đầy đủ: Tên laptop, Thương hiệu và Danh mục.',
        },
        { status: 400 }
      );
    }

    if (!body.variants || body.variants.length === 0 || !body.variants[0].price) {
      return NextResponse.json(
        {
          success: false,
          message: 'Vui lòng cung cấp ít nhất 1 cấu hình và giá bán hợp lệ cho sản phẩm.',
        },
        { status: 400 }
      );
    }

    const createdProduct = await createProductInDb(body);

    return NextResponse.json(
      {
        success: true,
        message: 'Tạo sản phẩm mới vào Database thành công!',
        data: createdProduct,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Lỗi API POST /api/admin/products:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Lỗi máy chủ khi thêm sản phẩm: ' + (error.message || 'Unknown error'),
      },
      { status: 500 }
    );
  }
}

