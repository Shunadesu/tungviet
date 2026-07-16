import express from 'express';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  restoreCategory,
  batchDeleteCategories,
} from '../../controllers/admin/category.controller.js';
import { adminAuth } from '../../middlewares/auth.js';

const router = express.Router();

/**
 * @openapi
 * /api/admin/categories:
 *   get:
 *     tags: [Admin - Categories]
 *     summary: Tất cả danh mục
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 *   post:
 *     tags: [Admin - Categories]
 *     summary: Tạo danh mục
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: OK }
 */
router.get('/', adminAuth, getAllCategories);
router.post('/', adminAuth, createCategory);

/**
 * @openapi
 * /api/admin/categories/batch-delete:
 *   post:
 *     tags: [Admin - Categories]
 *     summary: Xóa nhiều danh mục cùng lúc
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
router.post('/batch-delete', adminAuth, batchDeleteCategories);

/**
 * @openapi
 * /api/admin/categories/{id}:
 *   get:
 *     tags: [Admin - Categories]
 *     summary: Chi tiết danh mục
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *   put:
 *     tags: [Admin - Categories]
 *     summary: Cập nhật danh mục
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *   delete:
 *     tags: [Admin - Categories]
 *     summary: Soft-delete danh mục
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 */
router.get('/:id', adminAuth, getCategoryById);
router.put('/:id', adminAuth, updateCategory);
router.delete('/:id', adminAuth, deleteCategory);

/**
 * @openapi
 * /api/admin/categories/{id}/restore:
 *   post:
 *     tags: [Admin - Categories]
 *     summary: Khôi phục danh mục
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 */
router.post('/:id/restore', adminAuth, restoreCategory);

export default router;
