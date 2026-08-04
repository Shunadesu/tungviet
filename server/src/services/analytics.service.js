import { UAParser } from 'ua-parser-js';
import requestIp from 'request-ip';
import NodeCache from 'node-cache';
import VisitLog from '../models/VisitLog.js';
import { cacheStore } from '../utils/cache.js';
import { logger } from '../utils/logger.js';

const ONLINE_TTL_SECONDS = 300;
const ONLINE_KEY_PREFIX = 'online:';
const GEO_CACHE_TTL_SECONDS = 60 * 60 * 24;
const geoCache = new NodeCache({ stdTTL: GEO_CACHE_TTL_SECONDS, checkperiod: 3600 });

const ONLINE_CACHE_HANDLE = 'analytics:online';

function ensureOnlineSnapshotFresh() {
  let snap = cacheStore.get(ONLINE_CACHE_HANDLE);
  if (snap) return snap;

  const items = cacheStore
    .delByPrefix(ONLINE_KEY_PREFIX) === 0
    ? []
    : [];

  snap = { count: 0, items: [] };
  cacheStore.set(ONLINE_CACHE_HANDLE, snap, ONLINE_TTL_SECONDS);
  return snap;
}

function rebuildOnlineSnapshot() {
  const cache = cacheStore;
  const allKeys = (cache.keys && cache.keys()) || [];
  const onlineKeys = allKeys.filter((k) => k.startsWith(ONLINE_KEY_PREFIX));
  const items = onlineKeys
    .map((k) => {
      const value = cache.get(k);
      if (!value) return null;
      const ip = k.slice(ONLINE_KEY_PREFIX.length);
      return { ip, ...value };
    })
    .filter(Boolean)
    .sort((a, b) => b.lastSeen - a.lastSeen);

  const snap = { count: items.length, items };
  cacheStore.set(ONLINE_CACHE_HANDLE, snap, ONLINE_TTL_SECONDS);
  return snap;
}

function getOnlineSnapshot() {
  const allKeys = cacheStore.keys();
  const hasOnlineKeys = allKeys.some((k) => k.startsWith(ONLINE_KEY_PREFIX));
  if (!hasOnlineKeys && cacheStore.get(ONLINE_CACHE_HANDLE)) {
    return cacheStore.get(ONLINE_CACHE_HANDLE);
  }
  return rebuildOnlineSnapshot();
}

async function lookupGeo(ip) {
  if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('::ffff:127.')) {
    return { country: 'Local', countryCode: 'LO', city: 'Localhost', region: '', isp: 'Local' };
  }
  const cached = geoCache.get(ip);
  if (cached) return cached;

  try {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 2000);
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,region,regionName,city,isp,query`, {
      signal: ctrl.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error('geo lookup failed');
    const data = await res.json();
    if (data.status !== 'success') throw new Error('geo lookup not success');
    const geo = {
      country: data.country || '',
      countryCode: data.countryCode || '',
      city: data.city || '',
      region: data.regionName || data.region || '',
      isp: data.isp || '',
    };
    geoCache.set(ip, geo);
    return geo;
  } catch (err) {
    const fallback = { country: '', countryCode: '', city: '', region: '', isp: '' };
    geoCache.set(ip, fallback);
    return fallback;
  }
}

export const analyticsService = {
  async recordVisit(req, ip) {
    try {
      const ua = req.headers['user-agent'] || '';
      const parser = new UAParser(ua);
      const uaResult = parser.getResult();

      const deviceType = (() => {
        const t = uaResult.device?.type;
        if (t === 'mobile') return 'mobile';
        if (t === 'tablet') return 'tablet';
        if (t === 'wearable') return 'mobile';
        if (uaResult.bot?.isBot) return 'bot';
        if (!t) return 'desktop';
        return t;
      })();

      const geo = await lookupGeo(ip);

      await VisitLog.create({
        ip,
        userAgent: ua,
        browser: uaResult.browser?.name || 'Unknown',
        os: uaResult.os?.name || 'Unknown',
        device: uaResult.device?.vendor
          ? `${uaResult.device.vendor} ${uaResult.device.model || ''}`.trim()
          : 'Unknown',
        deviceType,
        country: geo.country,
        countryCode: geo.countryCode,
        city: geo.city,
        region: geo.region,
        isp: geo.isp,
        path: req.originalUrl || req.url,
        method: req.method,
        referer: req.headers.referer || req.headers.referrer || '',
        userId: req.user?._id || null,
        statusCode: 200,
        visitedAt: new Date(),
      });
    } catch (err) {
      logger.warn({ err: err.message }, 'Failed to record visit');
    }
  },

  extractIp(req) {
    return requestIp.getClientIp(req) || req.ip || req.socket?.remoteAddress || 'unknown';
  },

  markOnline(req) {
    const ip = this.extractIp(req);
    cacheStore.set(`${ONLINE_KEY_PREFIX}${ip}`, { lastSeen: Date.now() }, ONLINE_TTL_SECONDS);
    getOnlineSnapshot();
    return ip;
  },

  getOnlineCount() {
    const snap = getOnlineSnapshot();
    return snap.count;
  },

  getOnlineUsers() {
    return getOnlineSnapshot();
  },

  getVisitorIPs({ page = 1, limit = 20, search = '', sort = 'newest' } = {}) {
    const safePage = Math.max(parseInt(page, 10) || 1, 1);
    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const skip = (safePage - 1) * safeLimit;
    const match = {};
    if (search) {
      const regex = { $regex: search, $options: 'i' };
      match.$or = [
        { ip: regex },
        { country: regex },
        { city: regex },
        { browser: regex },
        { path: regex },
      ];
    }

    const sortSpec = sort === 'oldest' ? { lastVisit: 1 } : { lastVisit: -1 };

    return VisitLog.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$ip',
          lastVisit: { $max: '$visitedAt' },
          totalHits: { $sum: 1 },
          country: { $last: '$country' },
          countryCode: { $last: '$countryCode' },
          city: { $last: '$city' },
          browser: { $last: '$browser' },
          os: { $last: '$os' },
          device: { $last: '$device' },
          deviceType: { $last: '$deviceType' },
          lastPath: { $last: '$path' },
        },
      },
      { $sort: sortSpec },
      {
        $facet: {
          items: [{ $skip: skip }, { $limit: safeLimit }],
          total: [{ $count: 'count' }],
        },
      },
    ]).then(([result]) => {
      const items = (result.items || []).map((d) => ({
        ip: d._id,
        lastVisit: d.lastVisit,
        totalHits: d.totalHits,
        country: d.country,
        countryCode: d.countryCode,
        city: d.city,
        browser: d.browser,
        os: d.os,
        device: d.device,
        deviceType: d.deviceType,
        lastPath: d.lastPath,
      }));
      const total = result.total?.[0]?.count || 0;
      return {
        items,
        pagination: {
          page: safePage,
          limit: safeLimit,
          total,
          pages: Math.ceil(total / safeLimit) || 0,
        },
      };
    });
  },

  getVisitorLogs({ page = 1, limit = 20, search = '', sort = 'newest' } = {}) {
    const safePage = Math.max(parseInt(page, 10) || 1, 1);
    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const skip = (safePage - 1) * safeLimit;
    const query = {};
    if (search) {
      const regex = { $regex: search, $options: 'i' };
      query.$or = [
        { ip: regex },
        { country: regex },
        { city: regex },
        { browser: regex },
        { path: regex },
      ];
    }
    const sortSpec = sort === 'oldest' ? { visitedAt: 1 } : { visitedAt: -1 };
    return Promise.all([
      VisitLog.find(query).sort(sortSpec).skip(skip).limit(safeLimit),
      VisitLog.countDocuments(query),
    ]).then(([items, total]) => ({
      items,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        pages: Math.ceil(total / safeLimit) || 0,
      },
    }));
  },

  _getRangeBounds(range) {
    const now = new Date();
    let start;
    switch (range) {
      case 'day':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week': {
        const day = now.getDay();
        start = new Date(now);
        start.setDate(now.getDate() - day);
        start.setHours(0, 0, 0, 0);
        break;
      }
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
    return { start, end: now };
  },

  async getStats({ range = 'day' } = {}) {
    const { start, end } = this._getRangeBounds(range);

    const [total, uniqueVisitors, topCountries, topBrowsers, topPaths, topDevices] = await Promise.all([
      VisitLog.countDocuments({ visitedAt: { $gte: start, $lte: end } }),
      VisitLog.distinct('ip', { visitedAt: { $gte: start, $lte: end } }).then((arr) => arr.length),
      VisitLog.aggregate([
        { $match: { visitedAt: { $gte: start, $lte: end } } },
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      VisitLog.aggregate([
        { $match: { visitedAt: { $gte: start, $lte: end } } },
        { $group: { _id: '$browser', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      VisitLog.aggregate([
        { $match: { visitedAt: { $gte: start, $lte: end } } },
        { $group: { _id: '$path', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      VisitLog.aggregate([
        { $match: { visitedAt: { $gte: start, $lte: end } } },
        { $group: { _id: '$deviceType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    return {
      range,
      from: start,
      to: end,
      totalVisits: total,
      uniqueVisitors,
      topCountries: topCountries.map((c) => ({ name: c._id || 'Unknown', count: c.count })),
      topBrowsers: topBrowsers.map((b) => ({ name: b._id || 'Unknown', count: b.count })),
      topPaths: topPaths.map((p) => ({ path: p._id, count: p.count })),
      deviceBreakdown: topDevices.map((d) => ({ type: d._id || 'unknown', count: d.count })),
    };
  },

  async getDashboardSummary() {
    const { start: dayStart } = this._getRangeBounds('day');
    const { start: weekStart } = this._getRangeBounds('week');
    const { start: monthStart } = this._getRangeBounds('month');

    const [today, week, month, totalAll] = await Promise.all([
      VisitLog.countDocuments({ visitedAt: { $gte: dayStart } }),
      VisitLog.countDocuments({ visitedAt: { $gte: weekStart } }),
      VisitLog.countDocuments({ visitedAt: { $gte: monthStart } }),
      VisitLog.countDocuments(),
    ]);

    return {
      onlineCount: this.getOnlineCount(),
      todayVisits: today,
      weekVisits: week,
      monthVisits: month,
      totalVisits: totalAll,
    };
  },

  async getChartData({ range = 'week' } = {}) {
    const { start, end } = this._getRangeBounds(range);
    let dateFormat;
    let granularity;

    if (range === 'day') {
      dateFormat = '%H:00';
      granularity = 'hour';
    } else if (range === 'week') {
      dateFormat = '%Y-%m-%d';
      granularity = 'day';
    } else if (range === 'month') {
      dateFormat = '%Y-%m-%d';
      granularity = 'day';
    } else if (range === 'year') {
      dateFormat = '%Y-%m';
      granularity = 'month';
    } else {
      dateFormat = '%Y-%m-%d';
      granularity = 'day';
    }

    const series = await VisitLog.aggregate([
      { $match: { visitedAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$visitedAt' } },
          visits: { $sum: 1 },
          uniques: { $addToSet: '$ip' },
        },
      },
      {
        $project: {
          _id: 0,
          bucket: '$_id',
          visits: 1,
          uniqueVisitors: { $size: '$uniques' },
        },
      },
      { $sort: { bucket: 1 } },
    ]);

    return {
      range,
      granularity,
      from: start,
      to: end,
      series,
    };
  },

  async cleanupOldLogs(daysToKeep = 90) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysToKeep);
    const result = await VisitLog.deleteMany({ visitedAt: { $lt: cutoff } });
    return result.deletedCount || 0;
  },
};