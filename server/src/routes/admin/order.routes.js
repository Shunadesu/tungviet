import express from 'express';
import { 
  getAllOrders, 
  getOrderById, 
  updateOrderStatus, 
  deleteOrder,
  getStats 
} from '../../controllers/admin/order.controller.js';
import { adminAuth } from '../../middlewares/auth.js';

const router = express.Router();

router.get('/', adminAuth, getAllOrders);
router.get('/stats', adminAuth, getStats);
router.get('/:id', adminAuth, getOrderById);
router.put('/:id/status', adminAuth, updateOrderStatus);
router.delete('/:id', adminAuth, deleteOrder);

export default router;
