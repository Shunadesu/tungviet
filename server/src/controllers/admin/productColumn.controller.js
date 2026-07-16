import { productColumnService } from '../../services/productColumn.service.js';
import { apiResponse } from '../../utils/apiResponse.js';

export const getAllProductColumns = async (req, res, next) => {
  try {
    const items = await productColumnService.listAdmin();
    return apiResponse.ok(res, items);
  } catch (err) {
    next(err);
  }
};

export const getProductColumnById = async (req, res, next) => {
  try {
    const item = await productColumnService.getById(req.params.id);
    return apiResponse.ok(res, item);
  } catch (err) {
    next(err);
  }
};

export const createProductColumn = async (req, res, next) => {
  try {
    const item = await productColumnService.create(req.body);
    return apiResponse.created(res, item, 'Tạo cột thành công');
  } catch (err) {
    next(err);
  }
};

export const updateProductColumn = async (req, res, next) => {
  try {
    const item = await productColumnService.update(req.params.id, req.body);
    return apiResponse.ok(res, item, 'Cập nhật cột thành công');
  } catch (err) {
    next(err);
  }
};

export const deleteProductColumn = async (req, res, next) => {
  try {
    await productColumnService.delete(req.params.id);
    return apiResponse.ok(res, null, 'Xóa cột thành công');
  } catch (err) {
    next(err);
  }
};

export const restoreProductColumn = async (req, res, next) => {
  try {
    const item = await productColumnService.restore(req.params.id);
    return apiResponse.ok(res, item, 'Khôi phục cột thành công');
  } catch (err) {
    next(err);
  }
};

export const reorderProductColumns = async (req, res, next) => {
  try {
    const { order } = req.body;
    const items = await productColumnService.reorder(order);
    return apiResponse.ok(res, items, 'Sắp xếp cột thành công');
  } catch (err) {
    next(err);
  }
};