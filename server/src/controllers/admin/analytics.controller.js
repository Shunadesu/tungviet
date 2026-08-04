import { analyticsService } from '../../services/analytics.service.js';
import { apiResponse } from '../../utils/apiResponse.js';

export const getOnlineUsers = async (req, res, next) => {
  try {
    const data = analyticsService.getOnlineUsers();
    return apiResponse.ok(res, data);
  } catch (err) {
    next(err);
  }
};

export const getOnlineCount = async (req, res, next) => {
  try {
    const count = analyticsService.getOnlineCount();
    return apiResponse.ok(res, { count });
  } catch (err) {
    next(err);
  }
};

export const getVisitors = async (req, res, next) => {
  try {
    const { page, limit, search, sort } = req.query;
    const data = await analyticsService.getVisitorIPs({ page, limit, search, sort });
    return apiResponse.paginated(res, data.items, data.pagination);
  } catch (err) {
    next(err);
  }
};

export const getVisitLogs = async (req, res, next) => {
  try {
    const { page, limit, search, sort } = req.query;
    const data = await analyticsService.getVisitorLogs({ page, limit, search, sort });
    return apiResponse.paginated(res, data.items, data.pagination);
  } catch (err) {
    next(err);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const { range } = req.query;
    const data = await analyticsService.getStats({ range });
    return apiResponse.ok(res, data);
  } catch (err) {
    next(err);
  }
};

export const getDashboardSummary = async (req, res, next) => {
  try {
    const data = await analyticsService.getDashboardSummary();
    return apiResponse.ok(res, data);
  } catch (err) {
    next(err);
  }
};

export const getChartData = async (req, res, next) => {
  try {
    const { range } = req.query;
    const data = await analyticsService.getChartData({ range });
    return apiResponse.ok(res, data);
  } catch (err) {
    next(err);
  }
};