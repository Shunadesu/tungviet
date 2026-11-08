import { productService } from '../../services/product.service.js';
import Product from '../../models/Product.js';
import { apiResponse } from '../../utils/apiResponse.js';
import {
  cacheKeys,
  cacheStore,
  invalidateHomeCache,
  invalidateProductsCache,
  invalidatePublicCache,
  TTL,
} from '../../utils/cache.js';
import { localizeFields, resolveLocale } from '../../utils/i18n.js';

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