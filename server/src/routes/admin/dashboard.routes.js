import express from 'express';
import { adminAuth } from '../../middlewares/auth.js';
import { getDashboard } from '../../controllers/admin/dashboard.controller.js';

const router = express.Router();

router.get('/', adminAuth, getDashboard);

export default router;
