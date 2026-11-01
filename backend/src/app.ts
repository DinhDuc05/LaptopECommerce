import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import routes from './routes';
import { apiRateLimiter } from './middlewares/rateLimiter';
import { ENV } from './config/env';

export const createApp = (): Application => {
  const app = express();

  // 1. Tối ưu HTTP Headers bảo mật chống tấn công với dung lượng tối thiểu
  app.use(helmet());

  // 2. Nén toàn bộ dữ liệu phản hồi HTTP bằng Gzip (Giảm tải băng thông và RAM truyền tải)
  app.use(compression({
    level: 6, // Cân bằng hoàn hảo giữa tốc độ nén CPU và tỷ lệ nén dung lượng
    threshold: 1024, // Chỉ nén các gói tin trên 1KB
  }));

  // 3. Cấu hình CORS an toàn
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // 4. Giới hạn kích thước Body tối đa 1MB để chống tràn bộ nhớ heap
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // 5. Chống spam request với Rate Limiting
  app.use('/api', apiRateLimiter);

  // 6. Tích hợp định tuyến API
  app.use('/api', routes);

  // 7. Route gốc
  app.get('/', (req: Request, res: Response) => {
    res.json({
      name: 'Laptop E-Commerce API (Ultra-Lightweight)',
      version: '1.0.0',
      docs: '/api/health',
      architecture: 'Node.js + Express + TypeScript + Prisma on AWS t3.small',
    });
  });

  // 8. Xử lý Route 404
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `Đường dẫn [${req.method}] ${req.originalUrl} không tồn tại trên hệ thống.`,
    });
  });

  // 9. Global Error Handler siêu gọn nhẹ
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('[SERVER ERROR]', err.message || err);
    res.status(err.status || 500).json({
      success: false,
      message: ENV.NODE_ENV === 'production' ? 'Đã có lỗi xảy ra trên máy chủ.' : err.message,
    });
  });

  return app;
};
