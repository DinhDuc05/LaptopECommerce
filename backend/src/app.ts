import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import routes from './routes';
import { apiRateLimiter } from './middlewares/rateLimiter';
import { ENV } from './config/env';

export const createApp = (): Application => {
  const app = express();

  // 1. HTTP Headers bảo mật
  app.use(helmet());

  // 2. Nén Gzip
  app.use(compression({
    level: 6,
    threshold: 1024,
  }));

  // 3. Cấu hình CORS
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // 4. Giới hạn kích thước Body
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // 5. Rate Limiting (chỉ bật khi không ở môi trường Serverless hoặc bọc try-catch)
  if (ENV.NODE_ENV !== 'production') {
    app.use('/api', apiRateLimiter);
  }

  // 6. Tích hợp định tuyến API
  app.use('/api', routes);

  // 7. Route gốc
  app.get('/', (req: Request, res: Response) => {
    res.json({
      name: 'Laptop E-Commerce API (Ultra-Lightweight)',
      version: '1.0.0',
      docs: '/api/health',
      architecture: 'Node.js + Express + TypeScript + Prisma',
    });
  });

  // 8. Xử lý Route 404
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `Đường dẫn [${req.method}] ${req.originalUrl} không tồn tại trên hệ thống.`,
    });
  });

  // 9. Global Error Handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('[SERVER ERROR]', err.message || err);
    res.status(err.status || 500).json({
      success: false,
      message: ENV.NODE_ENV === 'production' ? 'Đã có lỗi xảy ra trên máy chủ.' : err.message,
    });
  });

  return app;
};

// ==========================================
// ĐOẠN MỚI BỔ SUNG ĐỂ SỬA LỖI VERCEL:
// ==========================================
const app = createApp();

// Khởi chạy server khi chạy ở môi trường local
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
  });
}

// BẮT BUỘC: Export default instance app cho Vercel Serverless Function nhận diện
export default app;