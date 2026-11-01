import { Router, Request, Response } from 'express';
import productRoutes from './product.routes';
import categoryRoutes from './category.routes';
import orderRoutes from './order.routes';
import adminRoutes from './admin.routes';
import authRoutes from './auth.routes';
import { isDatabaseActive } from '../config/prisma';

const router = Router();

// Endpoint kiểm tra sức khỏe và telemetry RAM (Cực kỳ quan trọng để giám sát AWS t3.small)
router.get('/health', (req: Request, res: Response) => {
  const mem = process.memoryUsage();
  const formatMB = (bytes: number) => (bytes / 1024 / 1024).toFixed(2) + ' MB';

  res.status(200).json({
    status: 'HEALTHY',
    service: 'Laptop E-Commerce Backend API',
    uptimeSeconds: Math.floor(process.uptime()),
    databaseConnected: isDatabaseActive(),
    memoryFootprint: {
      rss: formatMB(mem.rss),
      heapTotal: formatMB(mem.heapTotal),
      heapUsed: formatMB(mem.heapUsed),
      external: formatMB(mem.external),
      limitTarget: '256 MB',
    },
    systemSpecs: {
      platform: process.platform,
      nodeVersion: process.version,
    },
  });
});

router.use('/products', productRoutes);
router.use('/', categoryRoutes);
router.use('/orders', orderRoutes);
router.use('/admin', adminRoutes);
router.use('/auth', authRoutes);

export default router;
