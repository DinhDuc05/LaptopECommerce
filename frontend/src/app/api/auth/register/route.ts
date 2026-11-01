import { NextRequest, NextResponse } from 'next/server';
import { createUserInDb } from '../../../../lib/db';

/**
 * POST /api/auth/register
 * Đăng ký tài khoản người dùng mới và lưu trực tiếp vào Database thật
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName, phone } = body;

    if (!email || !fullName || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Vui lòng điền đầy đủ: Họ tên, Email và Mật khẩu.',
        },
        { status: 400 }
      );
    }

    // Tạo user mới trong Database thật với role mặc định là CUSTOMER
    const createdUser = await createUserInDb({
      email,
      fullName,
      password,
      phone,
      role: 'CUSTOMER',
    });

    // Tạo demo token chuẩn base64 để Middleware và Client đọc được
    const payload = {
      sub: createdUser.id,
      email: createdUser.email,
      role: 'CUSTOMER',
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    };
    const token = `demo.${Buffer.from(JSON.stringify(payload)).toString('base64')}.sig`;

    return NextResponse.json(
      {
        success: true,
        message: 'Đăng ký tài khoản thành công!',
        user: createdUser,
        token,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Lỗi API POST /api/auth/register:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Lỗi máy chủ khi đăng ký tài khoản.',
      },
      { status: 400 }
    );
  }
}

