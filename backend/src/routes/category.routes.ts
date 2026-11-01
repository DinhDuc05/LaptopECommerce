import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';

const router = Router();

router.get('/categories', CategoryController.getCategories);
router.get('/brands', CategoryController.getBrands);

export default router;
