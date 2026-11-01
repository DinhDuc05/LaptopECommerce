import { NextResponse } from 'next/server';
import { getUsersFromDb } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/users
 * Truy vấn danh sách toàn bộ người dùng từ Database thật
 */
export async function GET() {
  try {
    const users = await getUsersFromDb();
    return NextResponse.json(
      {
        success: true,
        message: 'Lấy danh sách người dùng thành công',
        data: users,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Lỗi API GET /api/admin/users:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Lỗi máy chủ khi truy vấn danh sách người dùng: ' + (error.message || 'Unknown error'),
      },
      { status: 500 }
    );
  }
}

