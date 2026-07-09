import express from 'express';
import {
  saveEstimateBatch,
  getEstimates,
  createEstimate,
  updateEstimate,
  deleteEstimate,
} from '../controllers/estimate.controller.js';

const router = express.Router();

router.get('/', getEstimates);
router.post('/', saveEstimateBatch);
router.post('/item', createEstimate);
router.put('/item/:id', updateEstimate);
router.delete('/item/:id', deleteEstimate);

export default router;