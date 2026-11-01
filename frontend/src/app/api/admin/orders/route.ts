import { NextRequest, NextResponse } from 'next/server';
import { getOrdersFromDb, updateOrderStatusInDb } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/orders
 * Lấy toàn bộ danh sách đơn hàng từ Database (bao gồm đơn hàng mới nhất).
 */
export async function GET() {
  try {
    const orders = await getOrdersFromDb();
    return NextResponse.json(
      { success: true, data: orders, total: orders.length },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[GET /api/admin/orders] Lỗi:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi máy chủ khi lấy danh sách đơn hàng.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/orders
 * Body: { id: string | number, status: string }
 * Cập nhật trạng thái đơn hàng (PENDING → PROCESSING → COMPLETED | CANCELLED).
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body || {};

    const VALID_STATUSES = ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'];
    if (!id || !status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Thiếu thông tin: id và status hợp lệ là bắt buộc.' },
        { status: 400 }
      );
    }

    const updated = await updateOrderStatusInDb(id, status);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy đơn hàng với ID này.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Cập nhật trạng thái đơn hàng thành công!', data: updated },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[PATCH /api/admin/orders] Lỗi:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi máy chủ khi cập nhật trạng thái đơn hàng.' },
      { status: 500 }
    );
  }
}

