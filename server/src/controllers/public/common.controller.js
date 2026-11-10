import Product from '../../models/Product.js';
import Post from '../../models/Post.js';
import MarketTree from '../../models/MarketTree.js';
import MainTree from '../../models/MainTree.js';
import Partner from '../../models/Partner.js';
import { apiResponse } from '../../utils/apiResponse.js';
import { cacheKeys, cacheStore, TTL } from '../../utils/cache.js';
import { resolveLocale } from '../../utils/i18n.js';
import {
  PRODUCT_LIST_PROJECTION,
  localizeMarket,
  localizePost,
  localizeProduct,
} from '../../utils/publicLocalize.js';

/**
 * GET /api/public/stats
 * Số liệu tổng quan dùng cho badge ở admin dashboard và section thống kê ở client.
 */
export const getStats = async (req, res, next) => {
  try {
    const cacheKey = cacheKeys.publicStats();
    let stats = cacheStore.get(cacheKey);
    if (!stats) {
      const [products, markets, partners, customers, industries, posts] = await Promise.all([
        Product.countDocuments({ isActive: true, webStatus: 'published' }),
        MarketTree.countDocuments({ isActive: true }),
        Partner.countDocuments({ isActive: true, type: 'partner' }),
        Partner.countDocuments({ isActive: true, type: 'customer' }),
        MainTree.countDocuments({ isActive: true }),
        Post.countDocuments({ isActive: true }),
      ]);
      stats = { products, markets, partners, customers, industries, posts };
      cacheStore.set(cacheKey, stats, TTL.PUBLIC_STATS);
    }
    return apiResponse.ok(res, stats);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/public/search?q=&limit=&lang=
 * Tìm kiếm hợp nhất trên products + posts + markets.
 */
export const unifiedSearch = async (req, res, next) => {
  try {
    const locale = resolveLocale(req);
    const q = String(req.query.q || '').trim();
    const limit = Math.min(10, Math.max(1, parseInt(req.query.limit, 10) || 5));

    if (!q) {
      return apiResponse.ok(res, { products: [], posts: [], markets: [] });
    }

    const cacheKey = cacheKeys.publicSearch(q.toLowerCase(), locale);
    let payload = cacheStore.get(cacheKey);
    if (!payload) {
      const nameField = locale === 'en' ? 'nameEn' : 'name';
      const titleField = locale === 'en' ? 'titleEn' : 'title';

      const [products, posts, markets] = await Promise.all([
        Product.find({
          isActive: true,
          webStatus: 'published',
          [nameField]: { $regex: q, $options: 'i' },
        })
          .select(PRODUCT_LIST_PROJECTION)
          .limit(limit)
          .lean(),
        Post.find({
          isActive: true,
          title: { $regex: q, $options: 'i' },
        })
          .select('_id slug title thumbnail category publishedAt createdAt')
          .limit(limit)
          .populate('category', 'name nameEn slug')
          .lean(),
        MarketTree.find({
          isActive: true,
          [titleField]: { $regex: q, $options: 'i' },
        })
          .select('_id slug title titleEn description imageUrl industry')
          .limit(limit)
          .populate('industry', 'name nameEn slug')
          .lean(),
      ]);

      payload = {
        products: products.map((p) => localizeProduct(p, locale)),
        posts: posts.map((p) => localizePost(p, locale)),
        markets: markets.map((m) => localizeMarket(m, locale)),
      };
      cacheStore.set(cacheKey, payload, TTL.PUBLIC_SEARCH);
    }
    return apiResponse.ok(res, payload);
  } catch (err) {
    next(err);
  }
};
