import { analyticsService } from '../services/analytics.service.js';
import { logger } from '../utils/logger.js';

const SKIP_PREFIXES = ['/api/admin', '/uploads', '/api/health', '/api/docs', '/api/openapi.json'];

export const trackVisitor = (req, res, next) => {
  try {
    const path = req.path || req.originalUrl || '';
    if (SKIP_PREFIXES.some((p) => path.startsWith(p))) {
      return next();
    }
    if (req.method === 'OPTIONS') return next();

    const ip = analyticsService.extractIp(req);
    analyticsService.markOnline(req);

    analyticsService.recordVisit(req, ip).catch((err) => {
      logger.warn({ err: err.message }, 'analytics recordVisit failed');
    });

    next();
  } catch (err) {
    next();
  }
};