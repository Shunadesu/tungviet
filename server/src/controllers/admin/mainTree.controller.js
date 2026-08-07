import { mainTreeService } from '../../services/mainTree.service.js';
import { apiResponse } from '../../utils/apiResponse.js';

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
    const tree = await mainTreeService.create(req.body);
    return apiResponse.created(res, tree, 'Tạo ngành hàng thành công');
  } catch (err) {
    next(err);
  }
};

export const updateMainTree = async (req, res, next) => {
  try {
    const tree = await mainTreeService.update(req.params.id, req.body);
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