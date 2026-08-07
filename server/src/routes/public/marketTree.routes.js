import express from 'express';
import { getAllMarketTrees, getMarketTreeById } from '../../controllers/public/marketTree.controller.js';

const router = express.Router();

/**
 * @openapi
 * /api/public/market-trees:
 *   get:
 *     tags: [Public]
 *     summary: Cây ngành (parent/child) theo mainTree
 *     parameters:
 *       - in: query
 *         name: mainTree
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 */
router.get('/', getAllMarketTrees);

/**
 * @openapi
 * /api/public/market-trees/{id}:
 *   get:
 *     tags: [Public]
 *     summary: Chi tiết cây ngành
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Không tìm thấy }
 */
router.get('/:id', getMarketTreeById);

export default router;