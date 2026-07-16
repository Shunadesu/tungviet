import { marketService } from '../../services/market.service.js';
import { apiResponse } from '../../utils/apiResponse.js';
import { cacheKeys, cacheStore, TTL } from '../../utils/cache.js';
import { localizeFields, resolveLocale } from '../../utils/i18n.js';

const LOCALIZABLE_FIELDS = ['title'];

const localizeItem = (item, locale) => {
  if (!item) return item;
  const localized = localizeFields(item, locale, LOCALIZABLE_FIELDS);
  
  // Localize nested category
  if (localized.applicationCategoryId && typeof localized.applicationCategoryId === 'object') {
    localized.applicationCategoryId = localizeFields(localized.applicationCategoryId, locale, LOCALIZABLE_FIELDS);
  }
  
  // Localize nested products
  if (localized.selectedProducts && Array.isArray(localized.selectedProducts)) {
    localized.selectedProducts = localized.selectedProducts.map(p => {
      if (typeof p === 'object') {
        return localizeFields(p, locale, LOCALIZABLE_FIELDS);
      }
      return p;
    });
  }
  
  return localized;
};

export const getAllMarkets = async (req, res, next) => {
  try {
    const locale = resolveLocale(req);
    const params = {
      category: req.query.category,
      search: req.query.search,
      page: req.query.page,
      limit: req.query.limit,
    };

    if (!params.search) {
      const key = cacheKeys.publicMarkets({ ...params, locale });
      const cached = cacheStore.get(key);
      if (cached) {
        const items = cached.items.map(item => localizeItem(item, locale));
        return apiResponse.paginated(res, items, cached.pagination);
      }
    }

    const result = await marketService.listPublic(params);
    const items = result.items.map(item => localizeItem(item, locale));

    const payload = { items, pagination: result.pagination };
    
    if (!params.search) {
      const key = cacheKeys.publicMarkets({ ...params, locale });
      cacheStore.set(key, payload, TTL.PUBLIC_MARKETS);
    }
    
    return apiResponse.paginated(res, items, payload.pagination);
  } catch (err) {
    next(err);
  }
};

export const getMarketById = async (req, res, next) => {
  try {
    const locale = resolveLocale(req);
    const market = await marketService.getByIdLean(req.params.id, { onlyActive: true });
    const localized = localizeItem(market, locale);
    return apiResponse.ok(res, localized);
  } catch (err) {
    next(err);
  }
};

export const getMarketsByCategory = async (req, res, next) => {
  try {
    const locale = resolveLocale(req);
    const result = await marketService.listPublic({
      category: req.params.categoryId,
      page: req.query.page,
      limit: req.query.limit,
    });
    const items = result.items.map(item => localizeItem(item, locale));
    return apiResponse.paginated(res, items, result.pagination);
  } catch (err) {
    next(err);
  }
};
