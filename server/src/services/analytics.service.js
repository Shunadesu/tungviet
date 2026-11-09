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

// Snapshot "người dùng đang online" được dựng lại định kỳ (30s) thay vì
// quét/sort toàn bộ key cache ở MỖI request — nguyên nhân chính gây CPU 100%.
const SNAPSHOT_REBUILD_INTERVAL_MS = Number(process.env.ONLINE_SNAPSHOT_INTERVAL_MS) || 30_000;
let snapshotDirty = false;
let lastSnapshotAt = 0;

// Giới hạn tần suất gọi ra ip-api.com: tối đa 1 lần mỗi GEO_LOOKUP_MIN_INTERVAL_MS.
// Lookup KHÔNG xếp hàng và KHÔNG chặn request — xem lookupGeo() bên dưới.
const GEO_LOOKUP_MIN_INTERVAL_MS = Number(process.env.GEO_LOOKUP_INTERVAL_MS) || 1_000;
let lastGeoLookupAt = 0;

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
  lastSnapshotAt = Date.now();
  snapshotDirty = false;
  return snap;
}

function getOnlineSnapshot() {
  // Snapshot còn mới → dùng luôn, không quét cache.
  const snap = cacheStore.get(ONLINE_CACHE_HANDLE);
  const stale = !snap || Date.now() - lastSnapshotAt > SNAPSHOT_REBUILD_INTERVAL_MS;
  if (!stale) return snap;
  if (snapshotDirty || !snap) return rebuildOnlineSnapshot();
  lastSnapshotAt = Date.now();
  return snap;
}

/**
 * Geo lookup — KHÔNG BAO GIỜ chặn request.
 *
 * Vấn đề: nếu xếp hàng các lookup ra ip-api.com, mọi request sẽ phải chờ
 * (mỗi IP mới 1 giây) ⇒ ghi log visit bị trễ hàng loạt, hàng đợi phình to
 * khi bot quét site.
 *
 * Cách đúng: geo chỉ là dữ liệu bổ trợ. Ghi log visit TRƯỚC, rồi cập nhật
 * geo sau bằng `updateOne` nếu có lookup. Lookup ra ngoài bị giới hạn tần suất
 * (tối đa 1 lần/GEO_LOOKUP_INTERVAL_MS) và chỉ chạy cho IP chưa có trong cache.
 */
async function fetchGeo(ip) {
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

/**
 * Trả geo đã biết (cache) — không gọi mạng.
 * Nếu chưa có và đã tới giờ được phép lookup, gọi mạng (không chặn request
 * chính vì đây là fire-and-forget).
 */
function lookupGeo(ip) {
  if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('::ffff:127.')) {
    return { country: 'Local', countryCode: 'LO', city: 'Localhost', region: '', isp: 'Local' };
  }
  const cached = geoCache.get(ip);
  if (cached) return cached;

  const now = Date.now();
  if (now - lastGeoLookupAt < GEO_LOOKUP_MIN_INTERVAL_MS) {
    // Chưa tới giờ được lookup ⇒ trả rỗng ngay, không chặn, không xếp hàng.
    return { country: '', countryCode: '', city: '', region: '', isp: '' };
  }
  lastGeoLookupAt = now;
  return fetchGeo(ip); // Promise — caller dùng .catch()
}

// Chỉ ghi log các path nội dung; bỏ qua tài nguyên tĩnh và endpoint kỹ thuật.
const LOGGABLE_PATH_EXCLUDE = [
  '/api/health',
  '/api/docs',
  '/api/openapi.json',
  '/uploads',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
];

const isLoggablePath = (url = '') => {
  const pathOnly = String(url).split('?')[0];
  if (!LOGGABLE_PATH_EXCLUDE.some((p) => pathOnly.startsWith(p))) return true;
  return false;
};

// Mỗi IP chỉ được ghi 1 lần trong VISIT_LOG_MIN_INTERVAL_MS (mặc định 60s).
const VISIT_LOG_MIN_INTERVAL_MS = Number(process.env.VISIT_LOG_MIN_INTERVAL_MS) || 60_000;
const lastVisitAtByIp = new Map();

const shouldRecordVisit = (ip) => {
  if (!ip) return false;
  const now = Date.now();
  const last = lastVisitAtByIp.get(ip);
  if (last && now - last < VISIT_LOG_MIN_INTERVAL_MS) return false;
  lastVisitAtByIp.set(ip, now);

  // Dọn map khi phình to quá để tránh rò rỉ bộ nhớ.
  if (lastVisitAtByIp.size > 5000) {
    for (const [key, ts] of lastVisitAtByIp) {
      if (now - ts > VISIT_LOG_MIN_INTERVAL_MS * 2) lastVisitAtByIp.delete(key);
    }
  }
  return true;
};

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

      // Bỏ qua bot — bot quét site là nguyên nhân chính làm phình collection
      // và kéo CPU lên 100%.
      if (deviceType === 'bot') return;
      if (!isLoggablePath(req.originalUrl || req.url)) return;

      // Chặn ghi log trùng lặp: mỗi IP chỉ ghi 1 lần mỗi VISIT_LOG_MIN_INTERVAL_MS.
      if (!shouldRecordVisit(ip)) return;

      // Ghi log NGAY với geo đã cache (nếu có). Không chờ lookup mạng —
      // nhờ vậy ghi log không bao giờ bị trễ bởi ip-api.com.
      const geoPromise = lookupGeo(ip);
      const geo = geoPromise && typeof geoPromise.then === 'function' ? {} : geoPromise;

      const doc = await VisitLog.create({
        ip,
        userAgent: ua,
        browser: uaResult.browser?.name || 'Unknown',
        os: uaResult.os?.name || 'Unknown',
        device: uaResult.device?.vendor
          ? `${uaResult.device.vendor} ${uaResult.device.model || ''}`.trim()
          : 'Unknown',
        deviceType,
        country: geo.country || '',
        countryCode: geo.countryCode || '',
        city: geo.city || '',
        region: geo.region || '',
        isp: geo.isp || '',
        path: req.originalUrl || req.url,
        method: req.method,
        referer: req.headers.referer || req.headers.referrer || '',
        userId: req.user?._id || null,
        statusCode: 200,
        visitedAt: new Date(),
      });

      // Nếu geo đến sau (lookup mạng), cập nhật bổ sung cho document vừa tạo.
      if (typeof geoPromise?.then === 'function') {
        geoPromise
          .then((resolved) => {
            if (!resolved || !resolved.country) return;
            return VisitLog.updateOne(
              { _id: doc._id },
              {
                $set: {
                  country: resolved.country,
                  countryCode: resolved.countryCode,
                  city: resolved.city,
                  region: resolved.region,
                  isp: resolved.isp,
                },
              }
            );
          })
          .catch(() => {
            /* bỏ qua — geo chỉ là dữ liệu bổ trợ */
          });
      }
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
    // Đánh dấu snapshot cần dựng lại; việc dựng thực hiện định kỳ (30s)
    // thay vì quét toàn bộ key cache ở mỗi request.
    snapshotDirty = true;
    return ip;
  },

  getOnlineCount() {
    const snap = getOnlineSnapshot();
    return snap.count;
  },

  /**
   * Dựng lại snapshot online ngay lập tức (dùng cho cron job).
   * Chỉ quét cache 1 lần mỗi 30s thay vì 1 lần mỗi request.
   */
  refreshOnlineSnapshot() {
    return rebuildOnlineSnapshot();
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