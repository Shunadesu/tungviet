import { marketTreeService } from '../../services/marketTree.service.js';
import { apiResponse } from '../../utils/apiResponse.js';
import { localizeFields, resolveLocale } from '../../utils/i18n.js';

const LOCALIZABLE_FIELDS = ['title', 'description'];
const PRODUCT_LOCALIZABLE_FIELDS = ['name'];

const localizeProductPreview = (product, locale) => {
  if (!product) return product;
  return localizeFields(product, locale, PRODUCT_LOCALIZABLE_FIELDS);
};

const localizeSubDoc = (doc, locale) => {
  if (!doc) return doc;
  const out = localizeFields(doc, locale, LOCALIZABLE_FIELDS);
  if (Array.isArray(doc.productIds)) {
    out.productIds = doc.productIds.map((p) => localizeProductPreview(p, locale));
  }
  return out;
};

const localizeNode = (node, locale) => {
  if (!node) return node;
  const localized = localizeFields(node, locale, LOCALIZABLE_FIELDS);
  if (Array.isArray(node.children)) {
    localized.children = node.children.map((c) => localizeNode(c, locale));
  }
  if (Array.isArray(node.applications)) {
    localized.applications = node.applications
      .filter((a) => a && a.isActive !== false)
      .map((a) => localizeSubDoc(a, locale));
  }
  if (Array.isArray(node.technologies)) {
    localized.technologies = node.technologies
      .filter((t) => t && t.isActive !== false)
      .map((t) => localizeSubDoc(t, locale));
  }
  return localized;
};

export const getAllMarketTrees = async (req, res, next) => {
  try {
    const locale = resolveLocale(req);
    const items = await marketTreeService.getPublic({ mainTree: req.query.mainTree });
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