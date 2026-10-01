import { Router } from 'express';
import * as analyticsController from '../../controllers/v1/analytics.controller.js';

const router = Router();

router.get('/top-gainers', analyticsController.getTopGainers);
router.get('/top-losers', analyticsController.getTopLosers);
router.get('/market-cap', analyticsController.getMarketCap);
router.get('/volume', analyticsController.getVolume);
router.get('/52-week-high', analyticsController.get52WeekHigh);
router.get('/52-week-low', analyticsController.get52WeekLow);

export default router;
