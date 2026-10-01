import { Router } from 'express';
import authRoutes from './auth.routes.js';
import stockRoutes from './stock.routes.js';

const router = Router();

// Mount routes
router.use('/', authRoutes);
router.use('/stocks', stockRoutes);

export default router;
