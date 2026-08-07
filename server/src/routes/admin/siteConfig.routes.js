import express from 'express';
import {
  getSiteConfig,
  updateLogoByUrl,
  uploadLogo,
  clearLogo,
  updateFooter,
  addHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  reorderHeroSlides,
  addAboutSlide,
  updateAboutSlide,
  deleteAboutSlide,
  reorderAboutSlides,
  updateAbout,
  updateFastFacts,
  updateCoreValues,
  updateSeo,
  uploadFavicon,
  clearFavicon,
  updateFloatingContacts,
} from '../../controllers/siteConfig.controller.js';
import { adminAuth } from '../../middlewares/auth.js';
import { uploadSingle } from '../../middlewares/upload.js';

const router = express.Router();

/**
 * @openapi
 * /api/admin/site-config:
 *   get:
 *     tags: [Admin - Site Config]
 *     summary: Lấy toàn bộ cấu hình site (logo, banner, heroSlides, footer)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 */
router.get('/', adminAuth, getSiteConfig);

/**
 * @openapi
 * /api/admin/site-config/logo:
 *   put:
 *     tags: [Admin - Site Config]
 *     summary: Cập nhật logo bằng URL
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 *   delete:
 *     tags: [Admin - Site Config]
 *     summary: Xoá logo
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 */
router.put('/logo', adminAuth, updateLogoByUrl);
router.delete('/logo', adminAuth, clearLogo);

/**
 * @openapi
 * /api/admin/site-config/logo/upload:
 *   post:
 *     tags: [Admin - Site Config]
 *     summary: Upload file logo trực tiếp
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 */
router.post('/logo/upload', adminAuth, uploadSingle('file'), uploadLogo);

/**
 * @openapi
 * /api/admin/site-config/footer:
 *   put:
 *     tags: [Admin - Site Config]
 *     summary: Cập nhật cấu hình footer (liên hệ + mô tả + copyright)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 */
router.put('/footer', adminAuth, updateFooter);

/**
 * @openapi
 * /api/admin/site-config/hero-slides:
 *   post:
 *     tags: [Admin - Site Config]
 *     summary: Thêm một hero slide
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Created }
 */
router.post('/hero-slides', adminAuth, addHeroSlide);

/**
 * @openapi
 * /api/admin/site-config/hero-slides/reorder:
 *   post:
 *     tags: [Admin - Site Config]
 *     summary: Sắp xếp lại thứ tự hero slides (body là mảng slideId)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 */
router.post('/hero-slides/reorder', adminAuth, reorderHeroSlides);

/**
 * @openapi
 * /api/admin/site-config/hero-slides/{slideId}:
 *   put:
 *     tags: [Admin - Site Config]
 *     summary: Cập nhật một hero slide
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: slideId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *   delete:
 *     tags: [Admin - Site Config]
 *     summary: Xoá một hero slide
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: slideId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 */
router.put('/hero-slides/:slideId', adminAuth, updateHeroSlide);
router.delete('/hero-slides/:slideId', adminAuth, deleteHeroSlide);

/**
 * @openapi
 * /api/admin/site-config/about-slides:
 *   post:
 *     tags: [Admin - Site Config]
 *     summary: Thêm một about slide
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Created }
 */
router.post('/about-slides', adminAuth, addAboutSlide);

/**
 * @openapi
 * /api/admin/site-config/about-slides/reorder:
 *   post:
 *     tags: [Admin - Site Config]
 *     summary: Sắp xếp lại thứ tự about slides
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 */
router.post('/about-slides/reorder', adminAuth, reorderAboutSlides);

/**
 * @openapi
 * /api/admin/site-config/about-slides/{slideId}:
 *   put:
 *     tags: [Admin - Site Config]
 *     summary: Cập nhật một about slide
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: slideId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *   delete:
 *     tags: [Admin - Site Config]
 *     summary: Xoá một about slide
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: slideId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 */
router.put('/about-slides/:slideId', adminAuth, updateAboutSlide);
router.delete('/about-slides/:slideId', adminAuth, deleteAboutSlide);

/**
 * @openapi
 * /api/admin/site-config/about:
 *   put:
 *     tags: [Admin - Site Config]
 *     summary: Cập nhật mô tả & lịch sử About
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 */
router.put('/about', adminAuth, updateAbout);

/**
 * @openapi
 * /api/admin/site-config/fast-facts:
 *   put:
 *     tags: [Admin - Site Config]
 *     summary: Cập nhật Fast Facts
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 */
router.put('/fast-facts', adminAuth, updateFastFacts);

/**
 * @openapi
 * /api/admin/site-config/core-values:
 *   put:
 *     tags: [Admin - Site Config]
 *     summary: Cập nhật Core Values
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 */
router.put('/core-values', adminAuth, updateCoreValues);

/**
 * @openapi
 * /api/admin/site-config/seo:
 *   put:
 *     tags: [Admin - Site Config]
 *     summary: Cap nhat SEO global
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 */
router.put('/seo', adminAuth, updateSeo);

/**
 * @openapi
 * /api/admin/site-config/favicon/upload:
 *   post:
 *     tags: [Admin - Site Config]
 *     summary: Upload favicon
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 *   delete:
 *     tags: [Admin - Site Config]
 *     summary: Xoá favicon
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 */
router.post('/favicon/upload', adminAuth, uploadSingle('file'), uploadFavicon);
router.delete('/favicon', adminAuth, clearFavicon);

/**
 * @openapi
 * /api/admin/site-config/floating-contacts:
 *   put:
 *     tags: [Admin - Site Config]
 *     summary: Cập nhật danh sách liên hệ nổi (phone, messenger, zalo...)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 */
router.put('/floating-contacts', adminAuth, updateFloatingContacts);

export default router;