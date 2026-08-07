import express from 'express';
import { getAllMainTrees, getMainTreeById } from '../../controllers/public/mainTree.controller.js';

const router = express.Router();

/**
 * @openapi
 * /api/public/main-trees:
 *   get:
 *     tags: [Public]
 *     summary: Danh sách ngành hàng active
 *     responses:
 *       200: { description: OK }
 */
router.get('/', getAllMainTrees);

/**
 * @openapi
 * /api/public/main-trees/{id}:
 *   get:
 *     tags: [Public]
 *     summary: Chi tiết ngành hàng
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Không tìm thấy }
 */
router.get('/:id', getMainTreeById);

export default router;