import { productService } from '../../services/product.service.js';
import Product from '../../models/Product.js';
import { apiResponse } from '../../utils/apiResponse.js';
import {
  cacheKeys,
  cacheStore,
  invalidateHomeCache,
  invalidateProductsCache,
  TTL,
} from '../../utils/cache.js';
import { localizeFields, resolveLocale } from '../../utils/i18n.js';
import { localizeProductList } from '../../utils/publicLocalize.js';

const LOCALIZABLE_FIELDS = ['name', 'description'];

/** Trần số bản ghi trả về cho 1 lần gọi endpoint danh sách sản phẩm. */
const MAX_PUBLIC_LIMIT = 500;

export const getAllProducts = async (req, res, next) => {
  try {
    const locale = resolveLocale(req);
    // Giới hạn limit để tránh bị client tải quá nhiều bản ghi trong 1 lần.
    const limit = Math.min(MAX_PUBLIC_LIMIT, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const params = {
      search: req.query.search,
      sort: req.query.sort,
      industries: req.query.industries,
      productLine: req.query.productLine || req.query.category,
      market: req.query.market || req.query.marketIds,
      technology: req.query.technology,
      application: req.query.application,
      softeningPoint: req.query.softeningPoint,
      page,
      limit,
    };

    if (!params.search) {
      const key = cacheKeys.publicProducts({ ...params, locale });
      const cached = cacheStore.get(key);
      if (cached) {
        const items = cached.items.map((item) => localizeFields(item, locale, LOCALIZABLE_FIELDS));
        return apiResponse.paginated(res, items, cached.pagination);
      }
    }

    const result = await productService.listPublic(params);
    const items = result.items.map((item) => localizeFields(item, locale, LOCALIZABLE_FIELDS));

    const payload = { items, pagination: result.pagination };

    if (!params.search) {
      const key = cacheKeys.publicProducts({ ...params, locale });
      cacheStore.set(key, payload, TTL.PUBLIC_PRODUCTS);
    }

    return apiResponse.paginated(res, payload.items, payload.pagination);
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const locale = resolveLocale(req);
    const product = await productService.getByIdLean(req.params.id, { onlyActive: true });
    const localized = localizeFields(product, locale, LOCALIZABLE_FIELDS);
    return apiResponse.ok(res, localized);
  } catch (err) {
    next(err);
  }
};

/**
 * Fire-and-forget view counter. Always responds 204 so the client never blocks.
 * Chỉ invalidate cache liên quan tới products (không xoá toàn bộ public:*).
 */
export const incrementView = async (req, res, next) => {
  try {
    Product.updateOne({ _id: req.params.id }, { $inc: { viewCount: 1 } })
      .catch((err) => console.warn('[incrementView] failed:', err?.message));
    invalidateProductsCache();
    invalidateHomeCache();
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/public/product-lines
 * Gom SKU theo "sản phẩm chính" (product line / Category).
 *
 * Mỗi nhóm trả về:
 *   - category: thông tin product line
 *   - skuCount: tổng số SKU đang publish thuộc nhóm
 *   - matchingSkuCount: số SKU khớp bộ lọc hiện tại
 *
 * Endpoint này dùng khi catalog lớn hơn giới hạn tải của client.
 */
export const getProductLines = async (req, res, next) => {
  try {
    const locale = resolveLocale(req);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const params = {
      search: req.query.q || req.query.search,
      sort: req.query.sort,
      industries: req.query.industries,
      mainTree: req.query.mainTree,
      market: req.query.market || req.query.marketIds,
      technology: req.query.technology,
      application: req.query.application,
      softeningPoint: req.query.softeningPoint,
      productLine: req.query.productLine || req.query.category,
      page,
      limit,
    };

    const result = await productService.listPublicProductLines(params);
    const items = result.items.map((group) => ({
      category: localizeFields(group.category, locale, LOCALIZABLE_FIELDS),
      skuCount: group.skuCount,
      matchingSkuCount: group.matchingSkuCount,
    }));

    return apiResponse.paginated(res, items, result.pagination);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/public/products/popular?limit=4&lang=
 */
export const getPopularProducts = async (req, res, next) => {
  try {
    const locale = resolveLocale(req);
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 4));
    const cacheKey = cacheKeys.publicProductsPopular(limit, locale);
    let items = cacheStore.get(cacheKey);
    if (!items) {
      items = await productService.listPublicPopular({ limit });
      cacheStore.set(cacheKey, items, TTL.PUBLIC_PRODUCTS_PRECOMPUTED);
    }
    return apiResponse.ok(res, localizeProductList(items, locale));
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/public/products/new?limit=4&lang=
 */
export const getNewProducts = async (req, res, next) => {
  try {
    const locale = resolveLocale(req);
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 4));
    const cacheKey = cacheKeys.publicProductsNew(limit, locale);
    let items = cacheStore.get(cacheKey);
    if (!items) {
      items = await productService.listPublicNew({ limit });
      cacheStore.set(cacheKey, items, TTL.PUBLIC_PRODUCTS_PRECOMPUTED);
    }
    return apiResponse.ok(res, localizeProductList(items, locale));
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/public/products/featured?limit=8&lang=
 */
export const getFeaturedProducts = async (req, res, next) => {
  try {
    const locale = resolveLocale(req);
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 8));
    const cacheKey = cacheKeys.publicProductsFeatured(limit, locale);
    let items = cacheStore.get(cacheKey);
    if (!items) {
      items = await productService.listPublicFeatured({ limit });
      cacheStore.set(cacheKey, items, TTL.PUBLIC_PRODUCTS_PRECOMPUTED);
    }
    return apiResponse.ok(res, localizeProductList(items, locale));
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/public/products/related/:id?limit=4&lang=
 */
export const getRelatedProducts = async (req, res, next) => {
  try {
    const locale = resolveLocale(req);
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 4));
    const cacheKey = cacheKeys.publicProductsRelated(req.params.id, limit, locale);
    let items = cacheStore.get(cacheKey);
    if (!items) {
      items = await productService.listRelated(req.params.id, { limit });
      cacheStore.set(cacheKey, items, TTL.PUBLIC_PRODUCTS_PRECOMPUTED);
    }
    return apiResponse.ok(res, localizeProductList(items, locale));
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/public/products/bulk?ids=a,b,c&lang=
 * Endpoint gộp để hydrate nhiều sản phẩm cùng lúc (Wishlist / Compare).
 */
export const getProductsBulk = async (req, res, next) => {
  try {
    const locale = resolveLocale(req);
    const rawIds = req.query.ids || req.query.id || '';
    const ids = Array.isArray(rawIds)
      ? rawIds
      : String(rawIds)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

    if (ids.length === 0) {
      return apiResponse.ok(res, []);
    }
    if (ids.length > 50) {
      return apiResponse.badRequest(res, 'ids khong duoc vuot qua 50');
    }

    const cacheKey = cacheKeys.publicProductsBulk(ids, locale);
    let items = cacheStore.get(cacheKey);
    if (!items) {
      items = await productService.listByIds(ids);
      cacheStore.set(cacheKey, items, TTL.PUBLIC_PRODUCTS_PRECOMPUTED);
    }
    return apiResponse.ok(res, localizeProductList(items, locale));
  } catch (err) {
    next(err);
  }
};