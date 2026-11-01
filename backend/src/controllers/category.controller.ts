import { Request, Response } from 'express';
import { StoreService } from '../services/store.service';

export class CategoryController {
  // GET /api/categories
  static async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await StoreService.getCategories();
      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Lỗi tải danh mục: ' + error.message,
      });
    }
  }

  // GET /api/brands
  static async getBrands(req: Request, res: Response): Promise<void> {
    try {
      const brands = await StoreService.getBrands();
      res.status(200).json({
        success: true,
        data: brands,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Lỗi tải thương hiệu: ' + error.message,
      });
    }
  }
}
