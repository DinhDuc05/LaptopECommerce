import { createApp } from './app';
import { ENV } from './config/env';
import { checkDatabaseConnection, disconnectPrisma } from './config/prisma';

const app = createApp();

const server = app.listen(ENV.PORT, async () => {
  const mem = process.memoryUsage();
  const formatMB = (b: number) => (b / 1024 / 1024).toFixed(2);

  console.log('================================================================');
  console.log(`🚀 LAPTOP E-COMMERCE BACKEND RUNNING ON PORT: ${ENV.PORT}`);
  console.log(`📡 Environment: ${ENV.NODE_ENV}`);
  console.log(`🧠 RAM Footprint: Heap Used: ${formatMB(mem.heapUsed)}MB | RSS: ${formatMB(mem.rss)}MB`);
  console.log(`🛡️  Target Memory Limit: --max-old-space-size=256MB`);
  console.log(`🩺 Healthcheck: http://localhost:${ENV.PORT}/api/health`);
  console.log('================================================================');

  // Kiểm tra kết nối SQL Server (nếu có)
  await checkDatabaseConnection();
});

// Xử lý tắt máy chủ an toàn (Graceful Shutdown)
const gracefulShutdown = async (signal: string) => {
  console.log(`\n[SYSTEM] Received ${signal}. Initiating graceful shutdown...`);
  server.close(async () => {
    console.log('[SYSTEM] HTTP Server closed.');
    await disconnectPrisma();
    console.log('[SYSTEM] Cleanup finished. Exiting.');
    process.exit(0);
  });

  // Ép buộc thoát nếu quá 5 giây chưa đóng hết
  setTimeout(() => {
    console.error('[SYSTEM] Forced shutdown after 5s timeout.');
    process.exit(1);
  }, 5000);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

