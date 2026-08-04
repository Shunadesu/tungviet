import express from 'express';
import { adminAuth } from '../../middlewares/auth.js';
import {
  getOnlineUsers,
  getOnlineCount,
  getVisitors,
  getVisitLogs,
  getStats,
  getDashboardSummary,
  getChartData,
} from '../../controllers/admin/analytics.controller.js';

const router = express.Router();

router.get('/online', adminAuth, getOnlineUsers);
router.get('/online/count', adminAuth, getOnlineCount);
router.get('/visitors', adminAuth, getVisitors);
router.get('/logs', adminAuth, getVisitLogs);
router.get('/stats', adminAuth, getStats);
router.get('/dashboard', adminAuth, getDashboardSummary);
router.get('/chart', adminAuth, getChartData);

export default router;