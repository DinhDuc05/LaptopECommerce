import { NextRequest, NextResponse } from 'next/server';
import { updateUserRoleInDb } from '../../../../../../lib/db';

/**
 * PATCH /api/admin/users/[id]/role
 * Xử lý logic cấp / hủy quyền Admin cho người dùng
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { role } = body;

    if (!role) {
      return NextResponse.json(
        {
          success: false,
          message: 'Vui lòng cung cấp vai trò (role) cần cập nhật.',
        },
        { status: 400 }
      );
    }

    const updatedUser = await updateUserRoleInDb(id, role);

    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'Không tìm thấy người dùng với ID: ' + id,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Cập nhật quyền thành công cho ${updatedUser.fullName}!`,
        data: updatedUser,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Lỗi API PATCH /api/admin/users/[id]/role:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Lỗi máy chủ khi cập nhật vai trò người dùng: ' + (error.message || 'Unknown error'),
      },
      { status: 500 }
    );
  }
}

