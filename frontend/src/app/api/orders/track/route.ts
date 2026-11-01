import { NextRequest, NextResponse } from 'next/server';
import { getOrdersFromDb } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/orders/track
 * Tra cứu đơn hàng theo mã đơn (orderCode) hoặc số điện thoại khách hàng
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';

    if (!query.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: 'Vui lòng cung cấp mã đơn hàng hoặc số điện thoại để tra cứu.',
          data: [],
        },
        { status: 400 }
      );
    }

    const orders = await getOrdersFromDb(query);

    return NextResponse.json(
      {
        success: true,
        data: orders,
        message: orders.length > 0 ? 'Tìm thấy đơn hàng thành công' : 'Không tìm thấy đơn hàng phù hợp',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Lỗi API GET /api/orders/track:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Lỗi máy chủ khi tra cứu đơn hàng: ' + (error.message || 'Unknown error'),
        data: [],
      },
      { status: 500 }
    );
  }
}
