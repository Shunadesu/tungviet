import { mainTreeService } from '../../services/mainTree.service.js';
import { apiResponse } from '../../utils/apiResponse.js';

const sanitizeLinkField = (val) => {
  if (!val) return null;
  const raw = val?._id || val;
  try { return String(raw) || null; }
  catch (_) { return null; }
};

const sanitizeSpecifications = (list) =>
  (Array.isArray(list) ? list : [])
    .filter((spec) => spec && typeof spec.key === 'string' && spec.key.trim())
    .map((spec) => ({
      _id: spec._id || undefined,
      key: spec.key.trim(),
      value: typeof spec.value === 'string' ? spec.value : '',
      valueEn: typeof spec.valueEn === 'string' ? spec.valueEn : '',
      unit: typeof spec.unit === 'string' ? spec.unit.trim() : '',
      order: Number.isFinite(Number(spec.order)) ? Number(spec.order) : 0,
    }));

const sanitizeSubDocPayload = (list) =>
  (Array.isArray(list) ? list : [])
    .filter((s) => s && s.title)
    .map((s) => {
      const base = {
        _id: s._id || undefined,
        title: s.title || '',
        titleEn: s.titleEn || '',
        description: s.description || '',
        descriptionEn: s.descriptionEn || '',
        imageUrl: s.imageUrl || '',
        order: Number.isFinite(Number(s.order)) ? Number(s.order) : 0,
        isActive: s.isActive !== false,
        linkToMainTree: sanitizeLinkField(s.linkToMainTree),
        linkCustomUrl: typeof s.linkCustomUrl === 'string' ? s.linkCustomUrl.trim() : '',
      };
      if (Array.isArray(s.specifications) || s.specifications !== undefined) {
        base.specifications = sanitizeSpecifications(s.specifications);
      }
      return base;
    });

export const getAllMainTrees = async (req, res, next) => {
  try {
    const { isActive } = req.query;
    const items = await mainTreeService.getAdmin({ isActive });
    return apiResponse.ok(res, items);
  } catch (err) {
    next(err);
  }
};

export const getMainTreeById = async (req, res, next) => {
  try {
    const tree = await mainTreeService.getById(req.params.id);
    if (!tree) return apiResponse.notFound(res, 'Ngành hàng không tồn tại');
    return apiResponse.ok(res, tree);
  } catch (err) {
    next(err);
  }
};

export const createMainTree = async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      technologies: sanitizeSubDocPayload(req.body?.technologies),
      applications: sanitizeSubDocPayload(req.body?.applications),
    };
    const tree = await mainTreeService.create(payload);
    return apiResponse.created(res, tree, 'Tạo ngành hàng thành công');
  } catch (err) {
    next(err);
  }
};

export const updateMainTree = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (req.body?.technologies !== undefined) {
      payload.technologies = sanitizeSubDocPayload(req.body.technologies);
    }
    if (req.body?.applications !== undefined) {
      payload.applications = sanitizeSubDocPayload(req.body.applications);
    }
    const tree = await mainTreeService.update(req.params.id, payload);
    if (!tree) return apiResponse.notFound(res, 'Ngành hàng không tồn tại');
    return apiResponse.ok(res, tree, 'Cập nhật ngành hàng thành công');
  } catch (err) {
    next(err);
  }
};

export const deleteMainTree = async (req, res, next) => {
  try {
    await mainTreeService.remove(req.params.id);
    return apiResponse.ok(res, null, 'Xóa ngành hàng thành công');
  } catch (err) {
    next(err);
  }
};

export const reorderMainTrees = async (req, res, next) => {
  try {
    const { order } = req.body;
    if (!Array.isArray(order)) {
      return apiResponse.badRequest(res, 'order ph must be an array');
    }
    await mainTreeService.reorder(order);
    return apiResponse.ok(res, null, 'Cập nhật thứ tự thành công');
  } catch (err) {
    next(err);
  }
};

export const bulkMainTrees = async (req, res, next) => {
  try {
    const { action, ids, isActive } = req.body || {};
    const result = await mainTreeService.bulk({ action, ids, isActive });
    return apiResponse.ok(res, result, 'Thao tác hàng loạt thành công');
  } catch (err) {
    next(err);
  }
};