import { productService } from '../../services/product.service.js';
import { apiResponse } from '../../utils/apiResponse.js';
import { cacheKeys, cacheStore, TTL } from '../../utils/cache.js';
import { localizeFields, resolveLocale } from '../../utils/i18n.js';

const LOCALIZABLE_FIELDS = ['name', 'description'];

export const getAllProducts = async (req, res, next) => {
  try {
    const locale = resolveLocale(req);
    const params = {
      search: req.query.search,
      page: req.query.page,
      limit: req.query.limit,
    };

    if (!params.search) {
      const key = cacheKeys.publicProducts({ ...params, locale });
      const cached = cacheStore.get(key);
      if (cached) {
        const items = cached.items.map(item => localizeFields(item, locale, LOCALIZABLE_FIELDS));
        return apiResponse.paginated(res, items, cached.pagination);
      }
    }

    const result = await productService.listPublic(params);
    const items = result.items.map(item => localizeFields(item, locale, LOCALIZABLE_FIELDS));

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
