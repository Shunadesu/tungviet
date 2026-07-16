import express from 'express';
import { getAllCategories, getCategoryById } from '../../controllers/public/category.controller.js';

const router = express.Router();

/**
 * @openapi
 * /api/public/categories:
 *   get:
 *     tags: [Public]
 *     summary: Danh sách danh mục active (cached)
 *     responses:
 *       200: { description: OK }
 */
router.get('/', getAllCategories);

/**
 * @openapi
 * /api/public/categories/{id}:
 *   get:
 *     tags: [Public]
 *     summary: Chi tiết danh mục (chỉ active)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Không tìm thấy }
 */
router.get('/:id', getCategoryById);

export default router;
