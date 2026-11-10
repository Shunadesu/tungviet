import express from 'express';
import {
  getAllProducts,
  getProductById,
  incrementView,
  getPopularProducts,
  getNewProducts,
  getFeaturedProducts,
  getRelatedProducts,
  getProductsBulk,
} from '../../controllers/public/product.controller.js';

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
 *         name: market
 *         description: Id/slug cua MarketTree de loc san pham theo thi truong
 *         schema: { type: string }
 *       - in: query
 *         name: technology
 *         description: Id cua sub-document cong nghe (MarketTree.technologies._id)
 *         schema: { type: string }
 *       - in: query
 *         name: application
 *         description: Id cua sub-document ung dung (MarketTree.applications._id)
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
router.get('/', getAllProducts);

/**
 * @openapi
 * /api/public/products/popular:
 *   get:
 *     tags: [Public]
 *     summary: Products ordered by viewCount desc
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 4 }
 *       - in: query
 *         name: lang
 *         schema: { type: string, enum: [vi, en] }
 */
router.get('/popular', getPopularProducts);

/**
 * @openapi
 * /api/public/products/new:
 *   get:
 *     tags: [Public]
 *     summary: Products marked isNew=true
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 4 }
 *       - in: query
 *         name: lang
 *         schema: { type: string, enum: [vi, en] }
 */
router.get('/new', getNewProducts);

/**
 * @openapi
 * /api/public/products/featured:
 *   get:
 *     tags: [Public]
 *     summary: Products marked isFeatured=true (admin curated)
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 8 }
 *       - in: query
 *         name: lang
 *         schema: { type: string, enum: [vi, en] }
 */
router.get('/featured', getFeaturedProducts);

/**
 * @openapi
 * /api/public/products/related/{id}:
 *   get:
 *     tags: [Public]
 *     summary: Related products (same industries/markets)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 4 }
 *       - in: query
 *         name: lang
 *         schema: { type: string, enum: [vi, en] }
 */
router.get('/related/:id', getRelatedProducts);

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
 *       - in: query
 *         name: lang
 *         schema: { type: string, enum: [vi, en] }
 */
router.get('/bulk', getProductsBulk);

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

/**
 * @openapi
 * /api/public/products/{id}/view:
 *   post:
 *     tags: [Public]
 *     summary: Tăng viewCount cho sản phẩm (fire-and-forget)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: OK }
 */
router.post('/:id/view', incrementView);

export default router;
