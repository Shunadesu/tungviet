import { productColumnService } from '../../services/productColumn.service.js';
import { apiResponse } from '../../utils/apiResponse.js';
import { resolveLocale } from '../../utils/i18n.js';
import {
  cacheKeys,
  cacheStore,
  TTL,
} from '../../utils/cache.js';

export const getActiveProductColumns = async (req, res, next) => {
  try {
    const locale = resolveLocale(req);
    const key = cacheKeys.publicProductColumns(locale);
    const cached = cacheStore.get(key);
    if (cached) return apiResponse.ok(res, cached);

    const items = await productColumnService.listActivePublic();
    cacheStore.set(key, items, TTL.PUBLIC_PRODUCT_COLUMNS);
    return apiResponse.ok(res, items);
  } catch (err) {
    next(err);
  }
};