import { Router } from 'express';
import * as stocksController from '../../controllers/v1/stocks.controller.js';

const router = Router();

router.get('/search', stocksController.searchStocks);
router.get('/list', stocksController.listStocks);
router.get('/:symbol', stocksController.getStockDetail);
router.get('/:symbol/profile', stocksController.getStockProfile);
router.get('/:symbol/quote', stocksController.getStockQuote);
router.get('/:symbol/chart', stocksController.getStockChart);
router.get('/:symbol/history', stocksController.getStockHistory);
router.get('/:symbol/statistics', stocksController.getStockStatistics);
router.get('/:symbol/dividend', stocksController.getStockDividend);
router.get('/:symbol/splits', stocksController.getStockSplits);
router.get('/:symbol/earnings', stocksController.getStockEarnings);
router.get('/:symbol/financials', stocksController.getStockFinancials);
router.get('/:symbol/balance-sheet', stocksController.getStockBalanceSheet);
router.get('/:symbol/income-statement', stocksController.getStockIncomeStatement);
router.get('/:symbol/cash-flow', stocksController.getStockCashFlow);
router.get('/:symbol/shareholders', stocksController.getStockShareholders);
router.get('/:symbol/peers', stocksController.getStockPeers);

export default router;
