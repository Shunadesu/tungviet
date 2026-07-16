import express from 'express';
import { register, login, getProfile } from '../controllers/auth.controller.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Đăng ký tài khoản
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       201: { description: Đăng ký thành công }
 *       400: { description: Email đã tồn tại }
 */
router.post('/register', register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Đăng nhập
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Đăng nhập thành công }
 *       401: { description: Sai thông tin đăng nhập }
 */
router.post('/login', login);

/**
 * @openapi
 * /api/auth/profile:
 *   get:
 *     tags: [Auth]
 *     summary: Lấy thông tin user hiện tại
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Thành công }
 *       401: { description: Chưa đăng nhập }
 */
router.get('/profile', auth, getProfile);

export default router;
