import express from 'express';
import { saveEstimateBatch, getEstimates } from '../controllers/estimate.controller.js';

const router = express.Router();

router.get('/', getEstimates);
router.post('/', saveEstimateBatch);

export default router;
