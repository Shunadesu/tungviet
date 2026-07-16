import express from 'express';
import { getPublicQuoteSection } from '../../controllers/public/quoteSection.controller.js';

const router = express.Router();

router.get('/', getPublicQuoteSection);

export default router;
