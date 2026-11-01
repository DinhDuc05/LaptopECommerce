import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

// BẢO VỆ TẤT CẢ ROUTE ADMIN: Bắt buộc đăng nhập và phải có vai trò ADMIN
router.use(requireAuth, requireAdmin);

// 1. Thống kê dashboard
router.get('/stats', AdminController.getStats);

// 2. Quản lý sản phẩm
router.get('/products', AdminController.getProducts);
router.post('/products', AdminController.createProduct);
router.put('/products/:id', AdminController.updateProduct);
router.delete('/products/:id', AdminController.deleteProduct);

// 3. Quản lý đơn hàng
router.get('/orders', AdminController.getOrders);
router.patch('/orders/:id/status', AdminController.updateOrderStatus);

// 4. Quản lý người dùng & phân quyền (User Management & RBAC)
router.get('/users', AdminController.getUsers);
router.patch('/users/:id/status', AdminController.updateUserStatus);
router.patch('/users/:id/role', AdminController.updateUserRole);
router.delete('/users/:id', AdminController.deleteUser);

export default router;
