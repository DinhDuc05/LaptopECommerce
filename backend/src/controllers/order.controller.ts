import { Request, Response } from 'express';
import { StoreService } from '../services/store.service';

export class OrderController {
  // POST /api/orders - Đặt hàng COD
  static async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const {
        customerName,
        customerPhone,
        customerEmail,
        shippingAddress,
        note,
        paymentMethod,
        items,
      } = req.body;

      if (!customerName || !customerPhone || !shippingAddress) {
        res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp đầy đủ: Tên người nhận, Số điện thoại và Địa chỉ giao hàng.',
        });
        return;
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Giỏ hàng của bạn đang trống.',
        });
        return;
      }

      const newOrder = await StoreService.createOrder({
        customerName,
        customerPhone,
        customerEmail,
        shippingAddress,
        note,
        paymentMethod: paymentMethod || 'COD',
        items,
      });

      res.status(201).json({
        success: true,
        message: 'Đặt hàng thành công! Mã đơn hàng của bạn là: ' + newOrder.orderCode,
        data: newOrder,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Lỗi khi tạo đơn hàng.',
      });
    }
  }

  // GET /api/orders/lookup?query=...
  static async lookupOrder(req: Request, res: Response): Promise<void> {
    try {
      const query = (req.query.query as string) || (req.params.code as string);
      if (!query) {
        res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp Mã đơn hàng hoặc Số điện thoại để tra cứu.',
        });
        return;
      }

      const orders = await StoreService.getOrderByCodeOrPhone(query);
      if (!orders || orders.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy đơn hàng tương ứng với thông tin tra cứu.',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: orders,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi tra cứu đơn hàng: ' + error.message,
      });
    }
  }
}
