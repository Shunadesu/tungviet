import express from 'express';
import { createOrder, getMyOrders, getOrderById } from '../../controllers/client/order.controller.js';
import { auth } from '../../middlewares/auth.js';

const router = express.Router();

router.post('/', createOrder);
router.get('/', auth, getMyOrders);
router.get('/:id', auth, getOrderById);

export default router;
