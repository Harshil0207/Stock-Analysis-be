import { Router } from 'express';
import { protect } from '../../middleware/auth.middleware.js';
import * as watchlistController from '../../controllers/v1/watchlist.controller.js';

const router = Router();

router.use(protect);

router.post('/', watchlistController.createWatchlist);
router.get('/', watchlistController.getWatchlists);
router.put('/:id', watchlistController.updateWatchlist);
router.delete('/:id', watchlistController.deleteWatchlist);
router.post('/:id/stocks', watchlistController.addStockToWatchlist);
router.delete('/:id/stocks/:symbol', watchlistController.removeStockFromWatchlist);

export default router;
