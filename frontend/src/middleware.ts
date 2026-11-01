import { NextRequest, NextResponse } from 'next/server';

/**
 * ============================================================
 *  MIDDLEWARE – Bảo vệ route /admin (Edge Runtime)
 * ============================================================
 *
 * Chạy trước khi request tới Server Component, kiểm tra:
 *  1. Có token trong Cookie không?
 *  2. Token còn hạn không?
 *  3. Role trong token có phải 'admin' hoặc 'ADMIN' không?
 *
 * Hỗ trợ cả:
 *  - Demo token: format "demo.<base64payload>.sig" (không cần verify signature)
 *  - JWT thật: format "<header>.<payload>.<signature>"
 */

const TOKEN_COOKIE = 'laptop_store_token_v1';

// Payload cần đọc từ token
interface TokenPayload {
  role?: string;
  exp?: number;
}

/**
 * Decode phần payload của token (base64, không verify signature).
 * Hỗ trợ cả JWT chuẩn lẫn demo token format.
 */
function decodePayload(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    // Cần đủ 3 phần: header.payload.signature (hoặc demo.payload.sig)
    if (parts.length !== 3) return null;

    // Base64url → Base64 chuẩn (thêm padding nếu thiếu)
    const base64 = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(parts[1].length + (4 - (parts[1].length % 4)) % 4, '=');

    const decoded = Buffer.from(base64, 'base64').toString('utf-8');
    return JSON.parse(decoded) as TokenPayload;
  } catch {
    return null;
  }
}

/** Kiểm tra token chưa hết hạn. */
function isNotExpired(payload: TokenPayload): boolean {
  if (!payload.exp) return true; // Không có exp → không kiểm tra expiry
  return payload.exp * 1000 > Date.now();
}

/** Kiểm tra role có phải admin không (hỗ trợ cả lowercase và uppercase). */
function isAdminRole(role?: string): boolean {
  return role === 'admin' || role === 'ADMIN';
}

// ── Middleware function ────────────────────────────────────────────────────────
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Chỉ xử lý route /admin (matcher đã lọc, nhưng guard thêm cho an toàn)
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // ── 1. Đọc token từ Cookie ─────────────────────────────────────────────────
  const token = request.cookies.get(TOKEN_COOKIE)?.value;

  if (!token) {
    // Chưa đăng nhập → redirect về /login, lưu URL gốc để quay lại sau
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── 2. Decode và kiểm tra payload ─────────────────────────────────────────
  const payload = decodePayload(token);

  if (!payload || !isNotExpired(payload)) {
    // Token hỏng hoặc hết hạn → xoá cookie và redirect về /login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(TOKEN_COOKIE);
    return response;
  }

  if (!isAdminRole(payload.role)) {
    // Đã đăng nhập nhưng không phải admin → về trang chủ
    return NextResponse.redirect(new URL('/', request.url));
  }

  // ── 3. Tất cả OK → cho request đi tiếp ────────────────────────────────────
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
