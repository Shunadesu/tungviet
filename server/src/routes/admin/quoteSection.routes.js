import express from 'express';
import { adminAuth } from '../../middlewares/auth.js';
import {
  getAllQuoteSections,
  getOrCreateQuoteSection,
  updateQuoteSection,
  getAllSubmissions,
  updateSubmission,
} from '../../controllers/admin/quoteSection.controller.js';

const router = express.Router();

router.get('/', adminAuth, getOrCreateQuoteSection);
router.put('/', adminAuth, updateQuoteSection);
router.get('/submissions', adminAuth, getAllSubmissions);
router.put('/submissions/:id', adminAuth, updateSubmission);

export default router;
