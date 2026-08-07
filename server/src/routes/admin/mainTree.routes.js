import express from 'express';
import {
  getAllMainTrees,
  getMainTreeById,
  createMainTree,
  updateMainTree,
  deleteMainTree,
  reorderMainTrees,
} from '../../controllers/admin/mainTree.controller.js';
import { adminAuth } from '../../middlewares/auth.js';

const router = express.Router();

/**
 * @openapi
 * /api/admin/main-trees:
 *   get:
 *     tags: [Admin - Main Trees]
 *     summary: Danh sách ngành hàng
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 *   post:
 *     tags: [Admin - Main Trees]
 *     summary: Tạo ngành hàng
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: OK }
 */
router.get('/', adminAuth, getAllMainTrees);
router.post('/', adminAuth, createMainTree);

/**
 * @openapi
 * /api/admin/main-trees/reorder:
 *   post:
 *     tags: [Admin - Main Trees]
 *     summary: Cập nhật thứ tự
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 */
router.post('/reorder', adminAuth, reorderMainTrees);

/**
 * @openapi
 * /api/admin/main-trees/{id}:
 *   get:
 *     tags: [Admin - Main Trees]
 *     summary: Chi tiết ngành hàng
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *   put:
 *     tags: [Admin - Main Trees]
 *     summary: Cập nhật ngành hàng
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *   delete:
 *     tags: [Admin - Main Trees]
 *     summary: Xóa ngành hàng
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 */
router.get('/:id', adminAuth, getMainTreeById);
router.put('/:id', adminAuth, updateMainTree);
router.delete('/:id', adminAuth, deleteMainTree);

export default router;