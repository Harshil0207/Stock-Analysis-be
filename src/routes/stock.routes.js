import { Router } from 'express';
import { 
  getStockQuote, 
  getStockHistory, 
  getStockNews, 
  getStockProfile 
} from '../controllers/stock.controller.js';

const router = Router();

router.get('/quote', getStockQuote);
router.get('/candles', getStockHistory);
router.get('/news', getStockNews);
router.get('/profile', getStockProfile);

export default router;
