import { Router } from 'express';
import * as marketController from '../../controllers/v1/market.controller.js';

const router = Router();

router.get('/dashboard', marketController.getDashboard);
router.get('/indices', marketController.getIndices);
router.get('/global-indices', marketController.getGlobalIndices);
router.get('/sectors', marketController.getSectors);
router.get('/trending', marketController.getTrending);
router.get('/gainers', marketController.getGainers);
router.get('/losers', marketController.getLosers);
router.get('/most-active', marketController.getMostActive);
router.get('/new-highs', marketController.getNewHighs);
router.get('/new-lows', marketController.getNewLows);

export default router;
