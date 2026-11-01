import { Request, Response } from 'express';
import { StoreService } from '../services/store.service';

export class ProductController {
  // GET /api/products
  static async getProducts(req: Request, res: Response): Promise<void> {
    try {
      const {
        category,
        brand,
        minPrice,
        maxPrice,
        cpu,
        ram,
        search,
        featured,
        sort,
        page,
        limit,
      } = req.query;

      const result = await StoreService.getProducts({
        category: category as string,
        brand: brand as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        cpu: cpu as string,
        ram: ram ? parseInt(ram as string, 10) : undefined,
        search: search as string,
        featured: featured !== undefined ? featured === 'true' : undefined,
        sort: sort as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
      });

      res.status(200).json({
        success: true,
        data: result.products,
        pagination: {
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi tải danh sách sản phẩm: ' + error.message,
      });
    }
  }

  // GET /api/products/:slug
  static async getProductBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const product = await StoreService.getProductBySlug(slug);

      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy sản phẩm với đường dẫn này.',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi tải chi tiết sản phẩm: ' + error.message,
      });
    }
  }
}
