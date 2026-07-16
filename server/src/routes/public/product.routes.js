import express from 'express';
import { getAllProducts, getProductById } from '../../controllers/public/product.controller.js';

const router = express.Router();

/**
 * @openapi
 * /api/public/products:
 *   get:
 *     tags: [Public]
 *     summary: Danh sách sản phẩm active
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [name_asc, name_desc, newest] }
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
router.get('/', getAllProducts);

/**
 * @openapi
 * /api/public/products/{id}:
 *   get:
 *     tags: [Public]
 *     summary: Chi tiết sản phẩm (chỉ active)
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
router.get('/:id', getProductById);

export default router;
