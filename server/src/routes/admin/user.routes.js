import express from 'express';
import { adminAuth } from '../../middlewares/auth.js';
import { listUsers, getUserDetail } from '../../controllers/admin/user.controller.js';

const router = express.Router();

router.get('/', adminAuth, listUsers);
router.get('/:id', adminAuth, getUserDetail);

export default router;
