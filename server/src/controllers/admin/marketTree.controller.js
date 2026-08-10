import { marketTreeService } from '../../services/marketTree.service.js';
import { apiResponse } from '../../utils/apiResponse.js';

const toObjectIdOrNull = (value) => {
  if (!value) return null;
  if (typeof value !== 'string') return null;
  return value;
};

const sanitizeSubDocPayload = (list) =>
  (Array.isArray(list) ? list : [])
    .filter((s) => s && s.title)
    .map((s) => ({
      _id: s._id || undefined,
      title: s.title || '',
      titleEn: s.titleEn || '',
      description: s.description || '',
      descriptionEn: s.descriptionEn || '',
      imageUrl: s.imageUrl || '',
      order: Number.isFinite(Number(s.order)) ? Number(s.order) : 0,
      isActive: s.isActive !== false,
      productIds: Array.isArray(s.productIds)
        ? s.productIds.map(toObjectIdOrNull).filter(Boolean)
        : [],
    }));

export const getAllMarketTrees = async (req, res, next) => {
  try {
    const { mainTree } = req.query;
    const items = await marketTreeService.getAdmin({ mainTree });
    return apiResponse.ok(res, items);
  } catch (err) {
    next(err);
  }
};

export const getMarketTreeById = async (req, res, next) => {
  try {
    const tree = await marketTreeService.getById(req.params.id);
    if (!tree) return apiResponse.notFound(res, 'Cây ngành không tồn tại');
    return apiResponse.ok(res, tree);
  } catch (err) {
    next(err);
  }
};

export const createMarketTree = async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      applications: sanitizeSubDocPayload(req.body?.applications),
      technologies: sanitizeSubDocPayload(req.body?.technologies),
    };
    const tree = await marketTreeService.create(payload);
    return apiResponse.created(res, tree, 'Tạo cây ngành thành công');
  } catch (err) {
    next(err);
  }
};

export const updateMarketTree = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (req.body?.applications !== undefined) {
      payload.applications = sanitizeSubDocPayload(req.body.applications);
    }
    if (req.body?.technologies !== undefined) {
      payload.technologies = sanitizeSubDocPayload(req.body.technologies);
    }
    const tree = await marketTreeService.update(req.params.id, payload);
    if (!tree) return apiResponse.notFound(res, 'Cây ngành không tồn tại');
    return apiResponse.ok(res, tree, 'Cập nhật cây ngành thành công');
  } catch (err) {
    next(err);
  }
};

export const deleteMarketTree = async (req, res, next) => {
  try {
    await marketTreeService.remove(req.params.id);
    return apiResponse.ok(res, null, 'Xóa cây ngành thành công');
  } catch (err) {
    next(err);
  }
};

export const reorderMarketTrees = async (req, res, next) => {
  try {
    const { order } = req.body;
    if (!Array.isArray(order)) {
      return apiResponse.badRequest(res, 'order ph must be an array');
    }
    await marketTreeService.reorder(order);
    return apiResponse.ok(res, null, 'Cập nhật thứ tự thành công');
  } catch (err) {
    next(err);
  }
};