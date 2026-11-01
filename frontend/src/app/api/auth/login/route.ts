import { NextRequest, NextResponse } from 'next/server';

const DEMO_ADMIN = {
  email: 'thaidinhduc05@gmail.com',
  password: '123456',
  id: 1,
  fullName: 'Thái Đình Đức',
  role: 'ADMIN',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng nhập email và mật khẩu.' },
        { status: 400 }
      );
    }

    if (email !== DEMO_ADMIN.email || password !== DEMO_ADMIN.password) {
      return NextResponse.json(
        { success: false, message: 'Email hoặc mật khẩu không chính xác.' },
        { status: 401 }
      );
    }

    const user = {
      id: DEMO_ADMIN.id,
      email: DEMO_ADMIN.email,
      fullName: DEMO_ADMIN.fullName,
      role: DEMO_ADMIN.role,
      isActive: true,
    };
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    };
    const token = `demo.${Buffer.from(JSON.stringify(payload)).toString('base64')}.sig`;

    return NextResponse.json({ success: true, user, token });
  } catch (error) {
    console.error('Lỗi API POST /api/auth/login:', error);
    return NextResponse.json(
      { success: false, message: 'Dữ liệu đăng nhập không hợp lệ.' },
      { status: 400 }
    );
  }
}