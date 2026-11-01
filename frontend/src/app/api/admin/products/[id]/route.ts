import { NextRequest, NextResponse } from 'next/server';
import { deleteProductInDb } from '../../../../../lib/db';

/**
 * DELETE /api/admin/products/[id]
 * Xóa sản phẩm khỏi Database
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const ok = await deleteProductInDb(id);

    if (!ok) {
      return NextResponse.json(
        {
          success: false,
          message: 'Không tìm thấy sản phẩm cần xóa với ID: ' + id,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Đã xóa sản phẩm khỏi Database thành công!',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Lỗi API DELETE /api/admin/products/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Lỗi máy chủ khi xóa sản phẩm: ' + (error.message || 'Unknown error'),
      },
      { status: 500 }
    );
  }
}

