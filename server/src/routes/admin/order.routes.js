import express from 'express';
import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  restoreOrder,
  getStats,
} from '../../controllers/admin/order.controller.js';
import { adminAuth } from '../../middlewares/auth.js';

const router = express.Router();

/**
 * @openapi
 * /api/admin/orders:
 *   get:
 *     tags: [Admin - Orders]
 *     summary: Danh sách đơn hàng
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 */
router.get('/', adminAuth, getAllOrders);

/**
 * @openapi
 * /api/admin/orders/stats:
 *   get:
 *     tags: [Admin - Orders]
 *     summary: Thống kê dashboard
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 */
router.get('/stats', adminAuth, getStats);

/**
 * @openapi
 * /api/admin/orders/{id}:
 *   get:
 *     tags: [Admin - Orders]
 *     summary: Chi tiết đơn hàng
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *   delete:
 *     tags: [Admin - Orders]
 *     summary: Soft-delete đơn hàng
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 */
router.get('/:id', adminAuth, getOrderById);
router.delete('/:id', adminAuth, deleteOrder);

/**
 * @openapi
 * /api/admin/orders/{id}/status:
 *   put:
 *     tags: [Admin - Orders]
 *     summary: Cập nhật trạng thái đơn hàng
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Pending, Processing, Shipped, Delivered, Cancelled]
 *     responses:
 *       200: { description: OK }
 *       400: { description: Trạng thái không hợp lệ }
 */
router.put('/:id/status', adminAuth, updateOrderStatus);

/**
 * @openapi
 * /api/admin/orders/{id}/restore:
 *   post:
 *     tags: [Admin - Orders]
 *     summary: Khôi phục đơn hàng
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 */
router.post('/:id/restore', adminAuth, restoreOrder);

export default router;
