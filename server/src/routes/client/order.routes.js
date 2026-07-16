import express from 'express';
import { createOrder, getMyOrders, getOrderById } from '../../controllers/client/order.controller.js';
import { auth } from '../../middlewares/auth.js';

const router = express.Router();

/**
 * @openapi
 * /api/client/orders:
 *   post:
 *     tags: [Client]
 *     summary: Tạo đơn hàng (cho phép guest)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items]
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId: { type: string }
 *                     quantity: { type: integer }
 *     responses:
 *       201: { description: Đặt hàng thành công }
 *       400: { description: Giỏ hàng trống / không đủ tồn kho }
 *   get:
 *     tags: [Client]
 *     summary: Lấy danh sách đơn hàng của user hiện tại
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 */
router.post('/', createOrder);
router.get('/', auth, getMyOrders);

/**
 * @openapi
 * /api/client/orders/{id}:
 *   get:
 *     tags: [Client]
 *     summary: Chi tiết đơn hàng của user
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *       403: { description: Không phải đơn của bạn }
 *       404: { description: Không tìm thấy }
 */
router.get('/:id', auth, getOrderById);

export default router;
