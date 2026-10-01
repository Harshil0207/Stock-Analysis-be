import { Router } from 'express';
import { protect } from '../../middleware/auth.middleware.js';
import * as transactionsController from '../../controllers/v1/transactions.controller.js';

const router = Router();

router.use(protect);

router.get('/', transactionsController.getTransactions);
router.get('/demo', transactionsController.getDemoTransactions);
router.get('/filter', transactionsController.filterTransactions);
router.get('/:id', transactionsController.getTransactionById);

export default router;
