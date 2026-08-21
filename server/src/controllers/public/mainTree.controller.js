import { mainTreeService } from '../../services/mainTree.service.js';
import { apiResponse } from '../../utils/apiResponse.js';
import { localizeFields, resolveLocale } from '../../utils/i18n.js';

const LOCALIZABLE_FIELDS = ['name', 'description'];
const SUBDOC_LOCALIZABLE_FIELDS = ['title', 'description'];

const localizeSubDoc = (doc, locale) => {
  if (!doc) return doc;
  const out = localizeFields(doc, locale, SUBDOC_LOCALIZABLE_FIELDS);
  out.linkToMainTree = doc.linkToMainTree || null;
  out.linkCustomUrl = doc.linkCustomUrl || '';
  return out;
};

const localizeNode = (node, locale) => {
  if (!node) return node;
  const localized = localizeFields(node, locale, LOCALIZABLE_FIELDS);
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

export const getAllMainTrees = async (req, res, next) => {
  try {
    const locale = resolveLocale(req);
    const items = await mainTreeService.getPublic();
    const localized = items.map((doc) => localizeNode(doc, locale));
    return apiResponse.ok(res, localized);
  } catch (err) {
    next(err);
  }
};

export const getMainTreeById = async (req, res, next) => {
  try {
    const locale = resolveLocale(req);
    const tree = await mainTreeService.getById(req.params.id);
    if (!tree) return apiResponse.notFound(res, 'Ngành hàng không tồn tại');
    return apiResponse.ok(res, localizeNode(tree, locale));
  } catch (err) {
    next(err);
  }
};