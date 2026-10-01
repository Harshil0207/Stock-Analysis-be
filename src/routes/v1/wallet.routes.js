import { Router } from 'express';
import { protect } from '../../middleware/auth.middleware.js';
import * as walletController from '../../controllers/v1/wallet.controller.js';

const router = Router();

router.use(protect);

router.post('/add-money', walletController.addMoney);
router.post('/withdraw', walletController.withdrawMoney);
router.get('/balance', walletController.getBalance);
router.get('/history', walletController.getHistory);
router.get('/transactions', walletController.getTransactions);

// Demo Account Wallet Routes
router.get('/demo/balance', walletController.getDemoBalance);
router.post('/demo/deposit', walletController.depositDemoMoney);
router.post('/demo/withdraw', walletController.withdrawDemoMoney);

export default router;
