import express from 'express';
import {
  getAllMarkets,
  getMarketById,
  createMarket,
  updateMarket,
  deleteMarket,
  restoreMarket,
  addProductsToMarket,
  removeProductsFromMarket,
} from '../../controllers/admin/market.controller.js';
import { adminAuth } from '../../middlewares/auth.js';

const router = express.Router();

/**
 * @openapi
 * /api/admin/markets:
 *   get:
 *     tags: [Admin - Markets]
 *     summary: Danh sách tất cả thị trường (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: boolean }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: OK }
 *   post:
 *     tags: [Admin - Markets]
 *     summary: Tạo thị trường mới
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string }
 *               titleEn: { type: string }
 *               imageUrl: { type: string }
 *               description: { type: string }
 *               descriptionEn: { type: string }
 *               tdsUrl: { type: string }
 *               technologies: { type: array, items: { type: string } }
 *               selectedProducts: { type: array, items: { type: string } }
 *               isActive: { type: boolean }
 *     responses:
 *       201: { description: Tạo thành công }
 */
router.get('/', adminAuth, getAllMarkets);
router.post('/', adminAuth, createMarket);

/**
 * @openapi
 * /api/admin/markets/{id}:
 *   get:
 *     tags: [Admin - Markets]
 *     summary: Chi tiết thị trường
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *   put:
 *     tags: [Admin - Markets]
 *     summary: Cập nhật thị trường
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *   delete:
 *     tags: [Admin - Markets]
 *     summary: Soft-delete thị trường
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Đã chuyển vào thùng rác }
 */
router.get('/:id', adminAuth, getMarketById);
router.put('/:id', adminAuth, updateMarket);
router.delete('/:id', adminAuth, deleteMarket);

/**
 * @openapi
 * /api/admin/markets/{id}/restore:
 *   post:
 *     tags: [Admin - Markets]
 *     summary: Khôi phục thị trường đã soft-delete
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 */
router.post('/:id/restore', adminAuth, restoreMarket);

/**
 * @openapi
 * /api/admin/markets/{id}/products:
 *   post:
 *     tags: [Admin - Markets]
 *     summary: Thêm sản phẩm vào thị trường
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
 *             required: [productIds]
 *             properties:
 *               productIds: { type: array, items: { type: string } }
 *     responses:
 *       200: { description: OK }
 *   delete:
 *     tags: [Admin - Markets]
 *     summary: Xóa sản phẩm khỏi thị trường
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
 *             required: [productIds]
 *             properties:
 *               productIds: { type: array, items: { type: string } }
 *     responses:
 *       200: { description: OK }
 */
router.post('/:id/products', adminAuth, addProductsToMarket);
router.delete('/:id/products', adminAuth, removeProductsFromMarket);

export default router;
