import express from 'express';
import { getFeaturedMarkets, getMarketsGrouped } from '../../controllers/public/home.controller.js';

const router = express.Router();

/**
 * @openapi
 * /api/public/markets/featured:
 *   get:
 *     tags: [Public]
 *     summary: Markets marked isFeatured=true
 *     parameters:
 *       - in: query
 *         name: lang
 *         schema: { type: string, enum: [vi, en] }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 */
router.get('/featured', getFeaturedMarkets);

/**
 * @openapi
 * /api/public/markets/grouped:
 *   get:
 *     tags: [Public]
 *     summary: Markets grouped by industry
 *     parameters:
 *       - in: query
 *         name: lang
 *         schema: { type: string, enum: [vi, en] }
 *     responses:
 *       200: { description: OK }
 */
router.get('/grouped', getMarketsGrouped);

export default router;
