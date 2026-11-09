/**
 * Cron jobs cho zuna-tungviet-server.
 *
 * - Dọn VisitLog cũ hằng ngày (collection trước đây phình vô hạn vì
 *   `cleanupOldLogs()` được viết nhưng KHÔNG BAO GIỜ được gọi).
 * - Dựng lại snapshot "người dùng online" định kỳ 30s (thay vì mỗi request).
 */
import cron from 'node-cron';
import { analyticsService } from '../services/analytics.service.js';
import { logger } from '../utils/logger.js';

const CLEANUP_CRON = process.env.CLEANUP_CRON || '0 3 * * *';
const VISIT_LOG_RETENTION_DAYS = Number(process.env.VISIT_LOG_RETENTION_DAYS) || 90;

let cleanupTask = null;
let snapshotTask = null;

export const startAnalyticsJobs = () => {
  cleanupTask = cron.schedule(CLEANUP_CRON, async () => {
    try {
      const deleted = await analyticsService.cleanupOldLogs(VISIT_LOG_RETENTION_DAYS);
      logger.info({ deleted }, 'VisitLog cleanup done');
    } catch (err) {
      logger.error({ err: err.message }, 'VisitLog cleanup failed');
    }
  });

  snapshotTask = cron.schedule('*/30 * * * * *', () => {
    try {
      analyticsService.refreshOnlineSnapshot();
    } catch (err) {
      logger.error({ err: err.message }, 'Online snapshot refresh failed');
    }
  });

  logger.info(
    { cleanupCron: CLEANUP_CRON, retentionDays: VISIT_LOG_RETENTION_DAYS },
    'Analytics cron jobs started'
  );
};

export const stopAnalyticsJobs = () => {
  cleanupTask?.stop();
  snapshotTask?.stop();
  cleanupTask = null;
  snapshotTask = null;
};
