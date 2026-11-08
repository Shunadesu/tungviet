import { categoryService } from '../../services/category.service.js';
import { apiResponse } from '../../utils/apiResponse.js';
import { cacheKeys, cacheStore, TTL } from '../../utils/cache.js';
import { localizeFields, resolveLocale } from '../../utils/i18n.js';

const LOCALIZABLE_FIELDS = ['name', 'description'];

export const getAllCategories = async (req, res, next) => {
  try {
    const locale = resolveLocale(req);
    const { mainTree } = req.query;
    const withSkuCount = req.query.withSkuCount === 'true' || req.query.withSkuCount === '1';
    const cacheParams = { locale, mainTree: mainTree || '', withSkuCount };
    const key = cacheKeys.publicCategories(cacheParams);
    const cached = cacheStore.get(key);
    if (cached) return apiResponse.ok(res, cached);

    const items = await categoryService.list({
      sort: 'order_asc',
      mainTree,
      withSkuCount,
    });
    const localized = items.map((doc) => localizeFields(doc, locale, LOCALIZABLE_FIELDS));
    cacheStore.set(key, localized, TTL.PUBLIC_CATEGORIES);
    return apiResponse.ok(res, localized);
  } catch (err) {
    next(err);
  }
};

export const getCategoryById = async (req, res, next) => {
  try {
    const locale = resolveLocale(req);
    const category = await categoryService.getById(req.params.id, { onlyActive: true });
    const obj = category && category.toObject ? category.toObject() : category;
    return apiResponse.ok(res, localizeFields(obj, locale, LOCALIZABLE_FIELDS));
  } catch (err) {
    next(err);
  }
};