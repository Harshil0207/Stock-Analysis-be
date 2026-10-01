import { Router } from 'express';
import * as chartsController from '../../controllers/v1/charts.controller.js';

const router = Router();

router.get('/candlestick', chartsController.getCandlestick);
router.get('/line', chartsController.getLine);
router.get('/intraday', chartsController.getIntraday);
router.get('/daily', chartsController.getDaily);
router.get('/weekly', chartsController.getWeekly);
router.get('/monthly', chartsController.getMonthly);
router.get('/yearly', chartsController.getYearly);

export default router;
