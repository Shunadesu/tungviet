import express from 'express';
import { submitQuote } from '../../controllers/client/quoteSection.controller.js';

const router = express.Router();

router.post('/', submitQuote);

export default router;
