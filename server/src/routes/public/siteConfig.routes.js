import express from 'express';
import { getPublicSiteConfig } from '../../controllers/siteConfig.controller.js';

const router = express.Router();

/**
 * @openapi
 * /api/public/site-config:
 *   get:
 *     tags: [Public]
 *     summary: Lấy cấu hình site (logo, banner, heroSlides, aboutSlides, about, fastFacts, coreValues, footer) - cached 5 phút theo locale
 *     parameters:
 *       - in: query
 *         name: lang
 *         schema: { type: string, enum: [vi, en] }
 *     responses:
 *       200: { description: OK }
 */
router.get('/', getPublicSiteConfig);

export default router;