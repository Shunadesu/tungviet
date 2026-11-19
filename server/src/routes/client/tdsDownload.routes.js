import express from 'express';
import { recordTdsDownload } from '../../controllers/client/tdsDownload.controller.js';
import { auth } from '../../middlewares/auth.js';

const router = express.Router();

/**
 * @openapi
 * /api/client/tds-downloads:
 *   post:
 *     tags: [Client]
 *     summary: Ghi nhận lượt tải TDS (yêu cầu đăng nhập)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId]
 *             properties:
 *               productId: { type: string }
 *     responses:
 *       201: { description: Đã ghi nhận, trả về tdsUrl }
 *       401: { description: Chưa đăng nhập }
 *       404: { description: Sản phẩm không có TDS }
 */
router.post('/', auth, recordTdsDownload);

export default router;
