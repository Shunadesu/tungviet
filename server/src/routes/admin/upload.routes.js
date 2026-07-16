import express from 'express';
import { uploadSingle, uploadSinglePDF } from '../../middlewares/upload.js';
import { uploadFile } from '../../controllers/upload.controller.js';
import { adminAuth } from '../../middlewares/auth.js';

const router = express.Router();

/**
 * @openapi
 * /api/admin/upload:
 *   post:
 *     tags: [Admin - Upload]
 *     summary: Upload ảnh (jpg/png/webp, max 5MB)
 *     security: [{ bearerAuth: [] }]
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
 *       201: { description: OK }
 *       400: { description: File không hợp lệ / quá lớn }
 */
router.post('/', adminAuth, uploadSingle('file'), uploadFile);

/**
 * @openapi
 * /api/admin/upload/pdf:
 *   post:
 *     tags: [Admin - Upload]
 *     summary: Upload file PDF (max 10MB)
 *     security: [{ bearerAuth: [] }]
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
 *       201: { description: OK }
 *       400: { description: File không hợp lệ / quá lớn }
 */
router.post('/pdf', adminAuth, uploadSinglePDF('file'), uploadFile);

export default router;