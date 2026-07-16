import express from 'express';
import { getAllMarkets, getMarketById, getMarketsByCategory } from '../../controllers/public/market.controller.js';

const router = express.Router();

/**
 * @openapi
 * /api/public/markets:
 *   get:
 *     tags: [Public]
 *     summary: Danh sách thị trường active
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: lang
 *         schema: { type: string, enum: [vi, en] }
 *     responses:
 *       200: { description: OK }
 */
router.get('/', getAllMarkets);

/**
 * @openapi
 * /api/public/markets/{id}:
 *   get:
 *     tags: [Public]
 *     summary: Chi tiết thị trường (chỉ active)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: lang
 *         schema: { type: string, enum: [vi, en] }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Không tìm thấy }
 */
router.get('/:id', getMarketById);

/**
 * @openapi
 * /api/public/markets/category/{categoryId}:
 *   get:
 *     tags: [Public]
 *     summary: Danh sách thị trường theo danh mục ứng dụng
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: lang
 *         schema: { type: string, enum: [vi, en] }
 *     responses:
 *       200: { description: OK }
 */
router.get('/category/:categoryId', getMarketsByCategory);

export default router;
