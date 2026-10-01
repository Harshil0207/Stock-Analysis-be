import { Router } from 'express';
import authRouter from './auth.routes.js';
import marketRouter from './market.routes.js';
import stocksRouter from './stocks.routes.js';
import chartsRouter from './charts.routes.js';
import indicatorsRouter from './indicators.routes.js';
import newsRouter from './news.routes.js';
import watchlistRouter from './watchlist.routes.js';
import portfolioRouter from './portfolio.routes.js';
import ordersRouter from './orders.routes.js';
import walletRouter from './wallet.routes.js';
import transactionsRouter from './transactions.routes.js';
import analyticsRouter from './analytics.routes.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/market', marketRouter);
router.use('/stocks', stocksRouter);
router.use('/charts', chartsRouter);
router.use('/indicators', indicatorsRouter);
router.use('/news', newsRouter);
router.use('/watchlist', watchlistRouter);
router.use('/portfolio', portfolioRouter);
router.use('/orders', ordersRouter);
router.use('/wallet', walletRouter);
router.use('/transactions', transactionsRouter);
router.use('/analytics', analyticsRouter);

export default router;
