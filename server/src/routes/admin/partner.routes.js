import express from 'express';
import { adminAuth } from '../../middlewares/auth.js';
import {
  getAllPartners,
  createPartner,
  updatePartner,
  deletePartner,
  reorderPartners,
} from '../../controllers/admin/partner.controller.js';

const router = express.Router();

router.get('/', adminAuth, getAllPartners);
router.post('/', adminAuth, createPartner);
router.put('/:id', adminAuth, updatePartner);
router.delete('/:id', adminAuth, deletePartner);
router.post('/reorder', adminAuth, reorderPartners);

export default router;
