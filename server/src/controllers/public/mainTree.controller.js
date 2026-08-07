import { mainTreeService } from '../../services/mainTree.service.js';
import { apiResponse } from '../../utils/apiResponse.js';
import { localizeFields, resolveLocale } from '../../utils/i18n.js';

const LOCALIZABLE_FIELDS = ['name', 'description'];

export const getAllMainTrees = async (req, res, next) => {
  try {
    const locale = resolveLocale(req);
    const items = await mainTreeService.getPublic();
    const localized = items.map((doc) => localizeFields(doc, locale, LOCALIZABLE_FIELDS));
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
    return apiResponse.ok(res, localizeFields(tree, locale, LOCALIZABLE_FIELDS));
  } catch (err) {
    next(err);
  }
};