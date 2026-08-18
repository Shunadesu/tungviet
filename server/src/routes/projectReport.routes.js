import express from 'express';
import {
  saveProjectReportBatch,
  getProjectReports,
  createProjectReport,
  updateProjectReport,
  deleteProjectReport,
} from '../controllers/projectReport.controller.js';

const router = express.Router();

/**
 * @openapi
 * /api/project-reports:
 *   get:
 *     tags: [ProjectReports]
 *     summary: Danh sách báo cáo tiến độ
 *     responses:
 *       200: { description: OK }
 *   post:
 *     tags: [ProjectReports]
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
 *                   $ref: '#/components/schemas/ProjectReport'
 *     responses:
 *       201: { description: OK }
 */
router.get('/', getProjectReports);
router.post('/', saveProjectReportBatch);

/**
 * @openapi
 * /api/project-reports/item:
 *   post:
 *     tags: [ProjectReports]
 *     summary: Tạo một báo cáo tiến độ
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProjectReport'
 *     responses:
 *       201: { description: OK }
 */
router.post('/item', createProjectReport);

/**
 * @openapi
 * /api/project-reports/item/{id}:
 *   put:
 *     tags: [ProjectReports]
 *     summary: Cập nhật một báo cáo
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *   delete:
 *     tags: [ProjectReports]
 *     summary: Xóa một báo cáo
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 */
router.put('/item/:id', updateProjectReport);
router.delete('/item/:id', deleteProjectReport);

export default router;
