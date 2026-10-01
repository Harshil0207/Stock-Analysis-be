import { Router } from 'express';
import * as newsController from '../../controllers/v1/news.controller.js';

const router = Router();

router.get('/', newsController.getNews);
router.get('/latest', newsController.getLatestNews);
router.get('/trending', newsController.getTrendingNews);
router.get('/:symbol', newsController.getNewsBySymbol);
router.get('/category/:category', newsController.getNewsByCategory);

export default router;
