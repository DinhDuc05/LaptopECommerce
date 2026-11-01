import { NextRequest, NextResponse } from 'next/server';
import { createOrderInDb, getOrdersFromDb } from '../../../lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/orders
 * Truy vấn danh sách đơn hàng hoặc tìm kiếm theo mã đơn / số điện thoại
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || undefined;

    const orders = await getOrdersFromDb(query);
    return NextResponse.json(
      {
        success: true,
        message: 'Lấy danh sách đơn hàng thành công',
        data: orders,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Lỗi API GET /api/orders:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Lỗi máy chủ khi lấy danh sách đơn hàng: ' + (error.message || 'Unknown error'),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders
 * Tạo đơn hàng mới (COD / Trực tuyến) và lưu vào Database
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.customerName || !body.customerPhone || !body.shippingAddress) {
      return NextResponse.json(
        {
          success: false,
          message: 'Vui lòng điền đầy đủ: Họ tên, Số điện thoại và Địa chỉ giao hàng.',
        },
        { status: 400 }
      );
    }

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Giỏ hàng của bạn đang trống. Vui lòng chọn sản phẩm trước khi thanh toán.',
        },
        { status: 400 }
      );
    }

    const createdOrder = await createOrderInDb(body);

    return NextResponse.json(
      {
        success: true,
        message: 'Tạo đơn hàng thành công!',
        data: createdOrder,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Lỗi API POST /api/orders:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Lỗi máy chủ khi xử lý tạo đơn hàng: ' + (error.message || 'Unknown error'),
      },
      { status: 500 }
    );
  }
}
