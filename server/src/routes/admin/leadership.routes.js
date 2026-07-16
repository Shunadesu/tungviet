import express from 'express';
import {
  getAllLeadership,
  getLeadershipById,
  createLeadership,
  updateLeadership,
  deleteLeadership,
  reorderLeadership,
} from '../../controllers/admin/leadership.controller.js';
import { adminAuth } from '../../middlewares/auth.js';

const router = express.Router();

router.get('/', adminAuth, getAllLeadership);
router.post('/', adminAuth, createLeadership);
router.post('/reorder', adminAuth, reorderLeadership);
router.get('/:id', adminAuth, getLeadershipById);
router.put('/:id', adminAuth, updateLeadership);
router.delete('/:id', adminAuth, deleteLeadership);

export default router;
