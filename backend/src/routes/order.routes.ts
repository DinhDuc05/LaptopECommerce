import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { orderRateLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.post('/', orderRateLimiter, OrderController.createOrder);
router.get('/track', OrderController.lookupOrder);
router.get('/track/:code', OrderController.lookupOrder);

export default router;
