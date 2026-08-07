import { postCategoryService } from '../../services/postCategory.service.js';
import { apiResponse } from '../../utils/apiResponse.js';

export const getAllPostCategories = async (req, res, next) => {
  try {
    const { isActive } = req.query;
    const items = await postCategoryService.getAdmin({ isActive });
    return apiResponse.ok(res, items);
  } catch (err) {
    next(err);
  }
};

export const getPostCategory = async (req, res, next) => {
  try {
    const doc = await postCategoryService.getById(req.params.id);
    if (!doc) return apiResponse.notFound(res, 'Không tìm thấy');
    return apiResponse.ok(res, doc);
  } catch (err) {
    next(err);
  }
};

export const createPostCategory = async (req, res, next) => {
  try {
    const { name } = req.body || {};
    if (!name?.trim()) return apiResponse.badRequest(res, 'Tên là bắt buộc');
    const doc = await postCategoryService.create(req.body);
    return apiResponse.created(res, doc, 'Tạo thành công');
  } catch (err) {
    next(err);
  }
};

export const updatePostCategory = async (req, res, next) => {
  try {
    const doc = await postCategoryService.update(req.params.id, req.body);
    if (!doc) return apiResponse.notFound(res, 'Không tìm thấy');
    return apiResponse.ok(res, doc, 'Cập nhật thành công');
  } catch (err) {
    next(err);
  }
};

export const deletePostCategory = async (req, res, next) => {
  try {
    await postCategoryService.remove(req.params.id);
    return apiResponse.ok(res, null, 'Xóa thành công');
  } catch (err) {
    next(err);
  }
};

export const reorderPostCategories = async (req, res, next) => {
  try {
    const { order } = req.body;
    if (!Array.isArray(order)) return apiResponse.badRequest(res, 'Danh sách không hợp lệ');
    await postCategoryService.reorder(order);
    return apiResponse.ok(res, null, 'Sắp xếp thành công');
  } catch (err) {
    next(err);
  }
};
