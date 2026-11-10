import express from 'express';
import { getHome } from '../../controllers/public/home.controller.js';
import { getStats, unifiedSearch } from '../../controllers/public/common.controller.js';

const router = express.Router();

/**
 * @openapi
 * /api/public/home:
 *   get:
 *     tags: [Public]
 *     summary: Home page aggregation (single call for entire landing page)
 *     parameters:
 *       - in: query
 *         name: lang
 *         schema: { type: string, enum: [vi, en] }
 *     responses:
 *       200: { description: OK }
 */
router.get('/', getHome);

/**
 * @openapi
 * /api/public/home/stats:
 *   get:
 *     tags: [Public]
 *     summary: Deprecated alias of /api/public/stats (kept for backward compatibility)
 *     responses:
 *       200: { description: OK }
 */
router.get('/stats', getStats);

/**
 * @openapi
 * /api/public/home/search:
 *   get:
 *     tags: [Public]
 *     summary: Deprecated alias of /api/public/search (kept for backward compatibility)
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 */
router.get('/search', unifiedSearch);

export default router;
