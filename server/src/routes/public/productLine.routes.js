import express from 'express';
import { getProductLines } from '../../controllers/public/product.controller.js';

const router = express.Router();

/**
 * @openapi
 * /api/public/product-lines:
 *   get:
 *     tags: [Public]
 *     summary: Gom SKU theo sản phẩm chính (product line)
 *     description: >
 *       Trả về danh sách product line kèm số SKU tổng (`skuCount`) và số SKU
 *       khớp bộ lọc hiện tại (`matchingSkuCount`). Dùng khi catalog lớn hơn
 *       giới hạn tải của client.
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: industries
 *         description: CSV id/slug của MainTree (ngành hàng)
 *         schema: { type: string }
 *       - in: query
 *         name: mainTree
 *         description: Id/slug của MainTree để lọc product line theo ngành hàng
 *         schema: { type: string }
 *       - in: query
 *         name: market
 *         description: CSV id/slug của MarketTree (thị trường)
 *         schema: { type: string }
 *       - in: query
 *         name: technology
 *         schema: { type: string }
 *       - in: query
 *         name: application
 *         schema: { type: string }
 *       - in: query
 *         name: softeningPoint
 *         description: 'Khoảng điểm làm mềm: "<80", "80-100", "100-120", ">120"'
 *         schema: { type: string }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [name_asc, name_desc, newest, popularity] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 12 }
 *       - in: query
 *         name: lang
 *         schema: { type: string, enum: [vi, en] }
 *     responses:
 *       200: { description: OK }
 */
router.get('/', getProductLines);

export default router;
