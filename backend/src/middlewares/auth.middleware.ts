import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { AuthTokenPayload, UserRole } from '../types';

// Mở rộng kiểu dữ liệu Request của Express để chứa user
declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

// Middleware xác thực JWT Token (Stateless, 0 byte RAM session)
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Vui lòng đăng nhập để truy cập tính năng này.',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as AuthTokenPayload;
    req.user = decoded;
    next();
  } catch (err: any) {
    res.status(403).json({
      success: false,
      message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.',
    });
    return;
  }
};

// Middleware phân quyền theo vai trò (Role-Based Access Control - RBAC)
export const requireRoles = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Bạn chưa được xác thực.',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Từ chối truy cập: Bạn không có quyền quản trị viên (Admin) để thực hiện thao tác này.',
      });
      return;
    }

    next();
  };
};

export const requireAdmin = requireRoles('ADMIN');

