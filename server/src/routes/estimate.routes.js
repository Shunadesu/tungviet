import express from 'express';
import {
  saveEstimateBatch,
  getEstimates,
  createEstimate,
  updateEstimate,
  deleteEstimate,
} from '../controllers/estimate.controller.js';

const router = express.Router();

/**
 * @openapi
 * /api/estimates:
 *   get:
 *     tags: [Estimates]
 *     summary: Danh sách báo giá
 *     responses:
 *       200: { description: OK }
 *   post:
 *     tags: [Estimates]
 *     summary: Lưu cả batch (xóa cũ + insert mới)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Estimate'
 *     responses:
 *       201: { description: OK }
 */
router.get('/', getEstimates);
router.post('/', saveEstimateBatch);

/**
 * @openapi
 * /api/estimates/item:
 *   post:
 *     tags: [Estimates]
 *     summary: Tạo một hạng mục báo giá
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Estimate'
 *     responses:
 *       201: { description: OK }
 */
router.post('/item', createEstimate);

/**
 * @openapi
 * /api/estimates/item/{id}:
 *   put:
 *     tags: [Estimates]
 *     summary: Cập nhật một hạng mục
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *   delete:
 *     tags: [Estimates]
 *     summary: Xóa một hạng mục
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 */
router.put('/item/:id', updateEstimate);
router.delete('/item/:id', deleteEstimate);

export default router;