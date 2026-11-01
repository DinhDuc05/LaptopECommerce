import { NextResponse } from 'next/server';
import { getStatsFromDb } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/stats
 * Thống kê tổng quan từ Database thật
 */
export async function GET() {
  try {
    const stats = await getStatsFromDb();
    return NextResponse.json(
      {
        success: true,
        data: stats,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Lỗi API GET /api/admin/stats:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Lỗi tải thống kê: ' + (error.message || 'Unknown error'),
      },
      { status: 500 }
    );
  }
}
