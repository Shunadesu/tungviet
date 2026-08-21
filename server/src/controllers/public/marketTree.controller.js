import { marketTreeService } from '../../services/marketTree.service.js';
import { apiResponse } from '../../utils/apiResponse.js';
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
        applicationIndex: Number.isFinite(entry.applicationIndex)
          ? entry.applicationIndex
          : -1,
      };
    })
    .filter(Boolean);

const localizeSubDoc = (doc, locale) => {
  if (!doc) return doc;
  const out = localizeFields(doc, locale, LOCALIZABLE_FIELDS);
  out.productEntries = localizeProductEntries(doc.productEntries, locale);
  out.linkToMainTree = doc.linkToMainTree || null;
  out.linkCustomUrl = doc.linkCustomUrl || '';
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
    const items = await marketTreeService.getPublic({
      featuredOnly: req.query.featured === 'true' || req.query.featured === '1',
    });
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
