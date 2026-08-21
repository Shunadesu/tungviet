import express from 'express';
import {
  getAllMarketTrees,
  getMarketTreeById,
  createMarketTree,
  updateMarketTree,
  deleteMarketTree,
  reorderMarketTrees,
  bulkMarketTrees,
} from '../../controllers/admin/marketTree.controller.js';
import { adminAuth } from '../../middlewares/auth.js';

const router = express.Router();

/**
 * @openapi
 * /api/admin/market-trees:
 *   get:
 *     tags: [Admin - Market Trees]
 *     summary: Danh sách cây ngành (flat)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: mainTree
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *   post:
 *     tags: [Admin - Market Trees]
 *     summary: Tạo cây ngành
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: OK }
 */
router.get('/', adminAuth, getAllMarketTrees);
router.post('/', adminAuth, createMarketTree);

/**
 * @openapi
 * /api/admin/market-trees/reorder:
 *   post:
 *     tags: [Admin - Market Trees]
 *     summary: Cập nhật thứ tự
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 */
router.post('/reorder', adminAuth, reorderMarketTrees);

/**
 * @openapi
 * /api/admin/market-trees/bulk:
 *   post:
 *     tags: [Admin - Market Trees]
 *     summary: Thao tác hàng loạt (xóa / bật tắt hiển thị)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action: { type: string, enum: [delete, toggleActive] }
 *               ids:
 *                 type: array
 *                 items: { type: string }
 *               isActive: { type: boolean }
 *     responses:
 *       200: { description: OK }
 *       400: { description: Yêu cầu không hợp lệ }
 */
router.post('/bulk', adminAuth, bulkMarketTrees);

/**
 * @openapi
 * /api/admin/market-trees/{id}:
 *   get:
 *     tags: [Admin - Market Trees]
 *     summary: Chi tiết
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *   put:
 *     tags: [Admin - Market Trees]
 *     summary: Cập nhật
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *   delete:
 *     tags: [Admin - Market Trees]
 *     summary: Xóa
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 */
router.get('/:id', adminAuth, getMarketTreeById);
router.put('/:id', adminAuth, updateMarketTree);
router.delete('/:id', adminAuth, deleteMarketTree);

export default router;