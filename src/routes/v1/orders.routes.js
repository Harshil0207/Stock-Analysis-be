import { Router } from 'express';
import { protect } from '../../middleware/auth.middleware.js';
import * as ordersController from '../../controllers/v1/orders.controller.js';

const router = Router();

router.use(protect);

router.post('/place', ordersController.placeOrder);
router.put('/modify/:id', ordersController.modifyOrder);
router.delete('/cancel/:id', ordersController.cancelOrder);
router.get('/', ordersController.getOrders);
router.get('/open', ordersController.getOpenOrders);
router.get('/completed', ordersController.getCompletedOrders);
router.get('/cancelled', ordersController.getCancelledOrders);
router.get('/:id', ordersController.getOrderById);

export default router;
