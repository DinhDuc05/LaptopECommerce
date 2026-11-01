import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { StoreService } from '../services/store.service';
import { ENV } from '../config/env';
import { AuthTokenPayload } from '../types';

export class AuthController {
  // POST /api/auth/register
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, fullName, phone } = req.body;

      if (!email || !password || !fullName) {
        res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp đầy đủ: Email, Mật khẩu và Họ tên.',
        });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({
          success: false,
          message: 'Mật khẩu phải có ít nhất 6 ký tự.',
        });
        return;
      }

      const user = await StoreService.createUser({
        email,
        password,
        fullName,
        phone,
        role: 'CUSTOMER',
      });

      const payload: AuthTokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const token = jwt.sign(payload, ENV.JWT_SECRET, {
        expiresIn: (ENV.JWT_EXPIRES_IN as any) || '7d',
      });

      res.status(201).json({
        success: true,
        message: 'Đăng ký tài khoản thành công!',
        token,
        user,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Lỗi khi đăng ký tài khoản.',
      });
    }
  }

  // POST /api/auth/login
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Vui lòng nhập email và mật khẩu.',
        });
        return;
      }

      const user = await StoreService.findUserByEmail(email);
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Email hoặc mật khẩu không chính xác.',
        });
        return;
      }

      if (!user.isActive) {
        res.status(403).json({
          success: false,
          message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.',
        });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        res.status(401).json({
          success: false,
          message: 'Email hoặc mật khẩu không chính xác.',
        });
        return;
      }

      const payload: AuthTokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const token = jwt.sign(payload, ENV.JWT_SECRET, {
        expiresIn: (ENV.JWT_EXPIRES_IN as any) || '7d',
      });

      res.status(200).json({
        success: true,
        message: 'Đăng nhập thành công!',
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Lỗi đăng nhập: ' + error.message,
      });
    }
  }

  // GET /api/auth/me
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Chưa xác thực.' });
        return;
      }

      const user = await StoreService.findUserById(req.user.userId);
      if (!user) {
        res.status(404).json({ success: false, message: 'Không tìm thấy thông tin người dùng.' });
        return;
      }

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Lỗi lấy thông tin: ' + error.message,
      });
    }
  }
}
