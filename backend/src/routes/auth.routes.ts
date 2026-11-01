import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Đăng ký tài khoản khách hàng mới
router.post('/register', AuthController.register);

// Đăng nhập hệ thống (Khách hàng hoặc Quản trị viên)
router.post('/login', AuthController.login);

// Lấy thông tin tài khoản hiện tại
router.get('/me', requireAuth, AuthController.getProfile);

export default router;

