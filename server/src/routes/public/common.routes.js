import express from 'express';
import { getStats, unifiedSearch } from '../../controllers/public/common.controller.js';

const router = express.Router();

/**
 * @openapi
 * /api/public/stats:
 *   get:
 *     tags: [Public]
 *     summary: Aggregated counts (products, markets, partners, customers)
 *     responses:
 *       200: { description: OK }
 */
router.get('/stats', getStats);

/**
 * @openapi
 * /api/public/search:
 *   get:
 *     tags: [Public]
 *     summary: Unified search (products + posts + markets)
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 5 }
 *       - in: query
 *         name: lang
 *         schema: { type: string, enum: [vi, en] }
 *     responses:
 *       200: { description: OK }
 */
router.get('/search', unifiedSearch);

export default router;
