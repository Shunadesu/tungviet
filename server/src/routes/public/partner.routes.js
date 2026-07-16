import express from 'express';
import { getPublicPartners } from '../../controllers/public/partner.controller.js';

const router = express.Router();

router.get('/', getPublicPartners);

export default router;
