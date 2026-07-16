import express from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  restoreProduct,
  uploadTDS,
  listProductsForSelect,
  batchDeleteProducts,
} from '../../controllers/admin/product.controller.js';
import { adminAuth } from '../../middlewares/auth.js';
import { uploadSinglePDF } from '../../middlewares/upload.js';

const router = express.Router();

/**
 * @openapi
 * /api/admin/products:
 *   get:
 *     tags: [Admin - Products]
 *     summary: Danh sách tất cả sản phẩm (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: boolean }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: OK }
 *   post:
 *     tags: [Admin - Products]
 *     summary: Tạo sản phẩm
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               nameEn: { type: string }
 *               description: { type: string }
 *               descriptionEn: { type: string }
 *               imageUrl: { type: string }
 *               softeningPoint: { type: string }
 *               acidValue: { type: string }
 *               color: { type: string }
 *               benefits: { type: array, items: { type: string } }
 *               applications: { type: array, items: { type: string } }
 *               tdsUrl: { type: string }
 *               isActive: { type: boolean }
 *     responses:
 *       201: { description: OK }
 */
router.get('/', adminAuth, getAllProducts);
router.post('/', adminAuth, createProduct);

/**
 * @openapi
 * /api/admin/products/select:
 *   get:
 *     tags: [Admin - Products]
 *     summary: Danh sách sản phẩm để chọn (id, name)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 */
router.get('/select', adminAuth, listProductsForSelect);

/**
 * @openapi
 * /api/admin/products/batch-delete:
 *   post:
 *     tags: [Admin - Products]
 *     summary: Xóa nhiều sản phẩm cùng lúc
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items: { type: string }
 *     responses:
 *       200: { description: OK }
 */
router.post('/batch-delete', adminAuth, batchDeleteProducts);

/**
 * @openapi
 * /api/admin/products/{id}:
 *   get:
 *     tags: [Admin - Products]
 *     summary: Chi tiết sản phẩm
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *   put:
 *     tags: [Admin - Products]
 *     summary: Cập nhật sản phẩm
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *   delete:
 *     tags: [Admin - Products]
 *     summary: Soft-delete sản phẩm
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Đã chuyển vào thùng rác }
 */
router.get('/:id', adminAuth, getProductById);
router.put('/:id', adminAuth, updateProduct);
router.delete('/:id', adminAuth, deleteProduct);

/**
 * @openapi
 * /api/admin/products/{id}/restore:
 *   post:
 *     tags: [Admin - Products]
 *     summary: Khôi phục sản phẩm đã soft-delete
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 */
router.post('/:id/restore', adminAuth, restoreProduct);

/**
 * @openapi
 * /api/admin/products/{id}/upload-tds:
 *   post:
 *     tags: [Admin - Products]
 *     summary: Upload file TDS (PDF) cho sản phẩm
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200: { description: OK }
 *       400: { description: File không hợp lệ }
 */
router.post('/:id/upload-tds', adminAuth, uploadSinglePDF('file'), uploadTDS);

export default router;
