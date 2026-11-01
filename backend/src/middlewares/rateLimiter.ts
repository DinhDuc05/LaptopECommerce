import rateLimit from 'express-rate-limit';
import { ENV } from '../config/env';

// Giới hạn tốc độ truy vấn để bảo vệ CPU/RAM trên AWS t3.small
export const apiRateLimiter = rateLimit({
  windowMs: ENV.RATE_LIMIT_WINDOW_MS, // 15 phút
  max: ENV.RATE_LIMIT_MAX, // Tối đa 200 request / 15 phút từ 1 IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu từ địa chỉ IP này, vui lòng thử lại sau 15 phút.',
  },
});

// Giới hạn khắt khe hơn cho hành động đặt hàng hoặc gửi dữ liệu nặng
export const orderRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 phút
  max: 10, // Tối đa 10 đơn / 1 phút
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Bạn đang đặt hàng quá nhanh. Vui lòng đợi 1 phút trước khi thử lại.',
  },
});
