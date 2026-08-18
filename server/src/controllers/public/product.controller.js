import { productService } from '../../services/product.service.js';
import Product from '../../models/Product.js';
import { apiResponse } from '../../utils/apiResponse.js';
import { cacheKeys, cacheStore, TTL } from '../../utils/cache.js';
import { localizeFields, resolveLocale } from '../../utils/i18n.js';
import { invalidatePublicCache } from '../../utils/cache.js';

const LOCALIZABLE_FIELDS = ['name', 'description'];

export const getAllProducts = async (req, res, next) => {
  try {
    const locale = resolveLocale(req);
    const params = {
      search: req.query.search,
      sort: req.query.sort,
      industries: req.query.industries,
      productLine: req.query.productLine || req.query.category,
      market: req.query.market || req.query.marketIds,
      page: req.query.page,
      limit: req.query.limit,
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
 * Không cache; invalidate để lần GET tiếp theo thấy viewCount mới.
 */
export const incrementView = async (req, res, next) => {
  try {
    Product.updateOne({ _id: req.params.id }, { $inc: { viewCount: 1 } })
      .catch((err) => console.warn('[incrementView] failed:', err?.message));
    invalidatePublicCache();
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};