import { Router } from 'express';
import { protect } from '../../middleware/auth.middleware.js';
import * as portfolioController from '../../controllers/v1/portfolio.controller.js';

const router = Router();

router.use(protect);

router.post('/buy', portfolioController.buyAsset);
router.post('/sell', portfolioController.sellAsset);
router.get('/', portfolioController.getPortfolio);
router.get('/summary', portfolioController.getSummary);
router.get('/performance', portfolioController.getPerformance);
router.get('/history', portfolioController.getHistory);
router.get('/holdings', portfolioController.getHoldings);

export default router;
