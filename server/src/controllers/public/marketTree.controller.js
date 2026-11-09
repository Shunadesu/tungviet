import { marketTreeService } from '../../services/marketTree.service.js';
import { apiResponse } from '../../utils/apiResponse.js';
import { cacheKeys, cacheStore, TTL } from '../../utils/cache.js';
import { localizeFields, resolveLocale } from '../../utils/i18n.js';

const LOCALIZABLE_FIELDS = ['title', 'description'];
const PRODUCT_LOCALIZABLE_FIELDS = ['name'];
const APPLICATION_LOCALIZABLE_FIELDS = ['title', 'description'];

const localizeApplicationPreview = (app, locale) => {
  if (!app) return app;
  return localizeFields(app, locale, APPLICATION_LOCALIZABLE_FIELDS);
};

const localizeProductPreview = (product, locale) => {
  if (!product) return product;
  const out = localizeFields(product, locale, PRODUCT_LOCALIZABLE_FIELDS);
  if (Array.isArray(product.applications)) {
    out.applications = product.applications.map((app) =>
      localizeApplicationPreview(app, locale)
    );
  } else {
    out.applications = [];
  }
  return out;
};

const localizeProductEntries = (entries = [], locale) =>
  (Array.isArray(entries) ? entries : [])
    .map((entry) => {
      if (!entry || !entry.productId) return null;
      return {
        productId: localizeProductPreview(entry.productId, locale),
      };
    })
    .filter(Boolean);

const localizeProductLineEntries = (entries = []) =>
  (Array.isArray(entries) ? entries : [])
    .map((entry) => {
      if (!entry) return null;
      const line = entry.productLineId;
      if (!line) return null;
      return {
        productLineId: {
          _id: line._id,
          name: line.name || '',
          nameEn: line.nameEn || '',
          slug: line.slug || '',
          imageUrl: line.imageUrl || '',
        },
      };
    })
    .filter(Boolean);

/** Chuẩn hóa linkToMainTree về mảng object đã populate (name/nameEn/slug). */
const localizeMainTreeLinks = (value) => {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return list
    .filter(Boolean)
    .map((mt) => ({
      _id: mt._id,
      name: mt.name || '',
      nameEn: mt.nameEn || '',
      slug: mt.slug || '',
    }));
};

const localizeSubDoc = (doc, locale) => {
  if (!doc) return doc;
  const out = localizeFields(doc, locale, LOCALIZABLE_FIELDS);
  out.productEntries = localizeProductEntries(doc.productEntries, locale);
  out.productLineEntries = localizeProductLineEntries(doc.productLineEntries);
  out.linkToMainTree = localizeMainTreeLinks(doc.linkToMainTree);
  out.productCount = Number.isFinite(doc.productCount) ? doc.productCount : 0;
  if (Array.isArray(doc.applications)) {
    // Nested applications inside a technology node.
    out.applications = doc.applications
      .filter((a) => a && a.isActive !== false)
      .map((a) => localizeSubDoc(a, locale));
    out.applicationCount = out.applications.length;
  }
  return out;
};

const localizeNode = (node, locale) => {
  if (!node) return node;
  const localized = localizeFields(node, locale, LOCALIZABLE_FIELDS);
  localized.isFeatured = node.isFeatured === true;
  localized.productCount = Number.isFinite(node.productCount) ? node.productCount : 0;
  if (node.introductions) {
    localized.introductions = {
      vi: node.introductions.vi || '',
      en: node.introductions.en || '',
    };
  } else {
    localized.introductions = { vi: '', en: '' };
  }
  localized.productLineEntries = localizeProductLineEntries(node.productLineEntries);
  if (Array.isArray(node.technologies)) {
    localized.technologies = node.technologies
      .filter((t) => t && t.isActive !== false)
      .map((t) => localizeSubDoc(t, locale));
  }
  if (Array.isArray(node.applications)) {
    localized.applications = node.applications
      .filter((a) => a && a.isActive !== false)
      .map((a) => localizeSubDoc(a, locale));
  }
  return localized;
};

export const getAllMarketTrees = async (req, res, next) => {
  try {
    const locale = resolveLocale(req);
    const featuredOnly = req.query.featured === 'true' || req.query.featured === '1';
    const cacheKey = cacheKeys.publicMarkets({ featuredOnly, locale });
    let items = cacheStore.get(cacheKey);
    if (!items) {
      items = await marketTreeService.getPublic({ featuredOnly });
      cacheStore.set(cacheKey, items, TTL.PUBLIC_MARKETS);
    }
    const localized = items.map((node) => localizeNode(node, locale));
    return apiResponse.ok(res, localized);
  } catch (err) {
    next(err);
  }
};

export const getMarketTreeById = async (req, res, next) => {
  try {
    const locale = resolveLocale(req);
    const tree = await marketTreeService.getById(req.params.id);
    if (!tree) return apiResponse.notFound(res, 'Cây ngành không tồn tại');
    return apiResponse.ok(res, localizeNode(tree, locale));
  } catch (err) {
    next(err);
  }
};
