import { Request, Response } from 'express';
import { StoreService } from '../services/store.service';

export class AdminController {
  // GET /api/admin/stats
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const orders = await StoreService.getAllOrdersAdmin();
      const products = await StoreService.getAllProductsAdmin();
      const users = await StoreService.getAllUsersAdmin();

      const totalRevenue = orders
        .filter((o) => o.status !== 'CANCELLED')
        .reduce((sum, o) => sum + o.totalAmount, 0);

      const pendingOrders = orders.filter((o) => o.status === 'PENDING').length;
      const completedOrders = orders.filter((o) => o.status === 'COMPLETED').length;

      res.status(200).json({
        success: true,
        data: {
          totalProducts: products.length,
          totalOrders: orders.length,
          totalUsers: users.length,
          pendingOrders,
          completedOrders,
          totalRevenue,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Lỗi tải thống kê: ' + error.message,
      });
    }
  }

  // GET /api/admin/products
  static async getProducts(req: Request, res: Response): Promise<void> {
    try {
      const products = await StoreService.getAllProductsAdmin();
      res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Lỗi tải danh sách sản phẩm quản trị: ' + error.message,
      });
    }
  }

  // POST /api/admin/products
  static async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const {
        name,
        slug,
        categoryId,
        brandId,
        thumbnailUrl,
        summary,
        description,
        isFeatured,
        variants,
      } = req.body;

      if (!name || !slug || !categoryId || !brandId || !variants || variants.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Vui lòng điền đầy đủ thông tin sản phẩm và ít nhất 1 biến thể cấu hình.',
        });
        return;
      }

      const product = await StoreService.createProduct({
        name,
        slug,
        categoryId: parseInt(categoryId, 10),
        brandId: parseInt(brandId, 10),
        thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
        summary,
        description,
        isFeatured: !!isFeatured,
        variants,
      });

      res.status(201).json({
        success: true,
        message: 'Tạo sản phẩm thành công!',
        data: product,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi tạo sản phẩm: ' + error.message,
      });
    }
  }

  // PUT /api/admin/products/:id
  static async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const updated = await StoreService.updateProduct(id, req.body);

      if (!updated) {
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy sản phẩm.',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Cập nhật sản phẩm thành công!',
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Lỗi cập nhật: ' + error.message,
      });
    }
  }

  // DELETE /api/admin/products/:id
  static async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const success = await StoreService.deleteProduct(id);

      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy sản phẩm cần xóa.',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Đã xóa sản phẩm thành công.',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Lỗi xóa sản phẩm: ' + error.message,
      });
    }
  }

  // GET /api/admin/orders
  static async getOrders(req: Request, res: Response): Promise<void> {
    try {
      const orders = await StoreService.getAllOrdersAdmin();
      res.status(200).json({
        success: true,
        data: orders,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Lỗi tải đơn hàng: ' + error.message,
      });
    }
  }

  // PATCH /api/admin/orders/:id/status
  static async updateOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const { status } = req.body;

      const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPING', 'COMPLETED', 'CANCELLED'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({
          success: false,
          message: 'Trạng thái không hợp lệ: ' + status,
        });
        return;
      }

      const order = await StoreService.updateOrderStatus(id, status);
      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy đơn hàng.',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Cập nhật trạng thái đơn hàng thành công!',
        data: order,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Lỗi cập nhật trạng thái đơn: ' + error.message,
      });
    }
  }

  // ================= QUẢN LÝ NGƯỜI DÙNG (USER MANAGEMENT) =================
  // GET /api/admin/users
  static async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await StoreService.getAllUsersAdmin();
      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Lỗi tải danh sách người dùng: ' + error.message,
      });
    }
  }

  // PATCH /api/admin/users/:id/status
  static async updateUserStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const { isActive } = req.body;

      if (typeof isActive !== 'boolean') {
        res.status(400).json({
          success: false,
          message: 'Trường isActive phải là kiểu boolean (true hoặc false).',
        });
        return;
      }

      // Tránh tự khóa tài khoản chính mình nếu là Admin ID 1
      if (req.user?.userId === id && !isActive) {
        res.status(400).json({
          success: false,
          message: 'Bạn không thể tự khóa tài khoản quản trị viên của chính mình.',
        });
        return;
      }

      const updated = await StoreService.updateUserStatus(id, isActive);
      if (!updated) {
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng.',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: isActive ? 'Đã kích hoạt tài khoản thành công!' : 'Đã khóa tài khoản thành công!',
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Lỗi cập nhật trạng thái: ' + error.message,
      });
    }
  }

  // PATCH /api/admin/users/:id/role
  static async updateUserRole(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const { role } = req.body;

      if (!['CUSTOMER', 'ADMIN', 'STAFF'].includes(role)) {
        res.status(400).json({
          success: false,
          message: 'Vai trò không hợp lệ: ' + role,
        });
        return;
      }

      const updated = await StoreService.updateUserRole(id, role);
      if (!updated) {
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng.',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: `Đã phân quyền tài khoản thành ${role} thành công!`,
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Lỗi phân quyền: ' + error.message,
      });
    }
  }

  // DELETE /api/admin/users/:id
  static async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);

      // Không cho phép xóa chính mình
      if (req.user?.userId === id) {
        res.status(400).json({
          success: false,
          message: 'Bạn không thể tự xóa tài khoản của chính mình.',
        });
        return;
      }

      const success = await StoreService.deleteUser(id);
      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng cần xóa.',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Đã xóa người dùng thành công.',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Lỗi xóa người dùng: ' + error.message,
      });
    }
  }
}
