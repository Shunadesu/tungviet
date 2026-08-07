import { marketTreeService } from '../../services/marketTree.service.js';
import { apiResponse } from '../../utils/apiResponse.js';
import { localizeFields, resolveLocale } from '../../utils/i18n.js';

const LOCALIZABLE_FIELDS = ['title', 'description'];

const localizeNode = (node, locale) => {
  if (!node) return node;
  const localized = localizeFields(node, locale, LOCALIZABLE_FIELDS);
  if (Array.isArray(node.children)) {
    localized.children = node.children.map((c) => localizeNode(c, locale));
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
    return apiResponse.ok(res, localizeFields(tree, locale, LOCALIZABLE_FIELDS));
  } catch (err) {
    next(err);
  }
};