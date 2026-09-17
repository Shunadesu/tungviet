import express from 'express';
import {
  getHome,
  getPopularProducts,
  getNewProducts,
  getFeaturedProducts,
  getRelatedProducts,
  getProductsBulk,
  getFeaturedMarkets,
  getMarketsGrouped,
  getStats,
  unifiedSearch,
} from '../../controllers/public/home.controller.js';

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
 * /api/public/products/popular:
 *   get:
 *     tags: [Public]
 *     summary: Products ordered by viewCount desc
 */
router.get('/products/popular', getPopularProducts);

/**
 * @openapi
 * /api/public/products/new:
 *   get:
 *     tags: [Public]
 *     summary: Products marked isNew=true
 */
router.get('/products/new', getNewProducts);

/**
 * @openapi
 * /api/public/products/featured:
 *   get:
 *     tags: [Public]
 *     summary: Products marked isFeatured=true (admin curated)
 */
router.get('/products/featured', getFeaturedProducts);

/**
 * @openapi
 * /api/public/products/related/{id}:
 *   get:
 *     tags: [Public]
 *     summary: Related products (same industries/markets)
 */
router.get('/products/related/:id', getRelatedProducts);

/**
 * @openapi
 * /api/public/products/bulk:
 *   get:
 *     tags: [Public]
 *     summary: Bulk fetch products by ids (for Wishlist/Compare)
 *     parameters:
 *       - in: query
 *         name: ids
 *         required: true
 *         schema: { type: string }
 */
router.get('/products/bulk', getProductsBulk);

/**
 * @openapi
 * /api/public/markets/featured:
 *   get:
 *     tags: [Public]
 *     summary: Markets marked isFeatured=true
 */
router.get('/markets/featured', getFeaturedMarkets);

/**
 * @openapi
 * /api/public/markets/grouped:
 *   get:
 *     tags: [Public]
 *     summary: Markets grouped by industry
 */
router.get('/markets/grouped', getMarketsGrouped);

/**
 * @openapi
 * /api/public/stats:
 *   get:
 *     tags: [Public]
 *     summary: Aggregated counts (products, markets, partners, customers)
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
 */
router.get('/search', unifiedSearch);

export default router;
