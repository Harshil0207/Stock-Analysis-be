import { Router } from 'express';
import * as indicatorsController from '../../controllers/v1/indicators.controller.js';

const router = Router();

router.get('/sma', indicatorsController.getSma);
router.get('/ema', indicatorsController.getEma);
router.get('/rsi', indicatorsController.getRsi);
router.get('/macd', indicatorsController.getMacd);
router.get('/bollinger-bands', indicatorsController.getBollingerBands);
router.get('/adx', indicatorsController.getAdx);
router.get('/atr', indicatorsController.getAtr);
router.get('/stochastic', indicatorsController.getStochastic);
router.get('/ichimoku', indicatorsController.getIchimoku);
router.get('/vwap', indicatorsController.getVwap);
router.get('/volume', indicatorsController.getVolume);

export default router;
