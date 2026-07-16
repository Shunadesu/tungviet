import express from 'express';
import {
  getAllMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  reorderMembers,
} from '../../controllers/admin/member.controller.js';
import { adminAuth } from '../../middlewares/auth.js';

const router = express.Router();

router.get('/', adminAuth, getAllMembers);
router.post('/', adminAuth, createMember);
router.post('/reorder', adminAuth, reorderMembers);
router.get('/:id', adminAuth, getMemberById);
router.put('/:id', adminAuth, updateMember);
router.delete('/:id', adminAuth, deleteMember);

export default router;
