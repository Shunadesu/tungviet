import { categoryService } from '../../services/category.service.js';
import Category from '../../models/Category.js';
import { apiResponse } from '../../utils/apiResponse.js';

export const getAllCategories = async (req, res, next) => {
  try {
    const { sort, page, limit } = req.query;
    const { items, pagination } = await categoryService.listPaginated({
      includeInactive: true,
      sort,
      page,
      limit,
    });
    return apiResponse.paginated(res, items, pagination);
  } catch (err) {
    next(err);
  }
};

export const getCategoryById = async (req, res, next) => {
  try {
    const category = await categoryService.getById(req.params.id);
    return apiResponse.ok(res, category);
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const category = await categoryService.create(req.body);
    return apiResponse.created(res, category, 'Tạo danh mục thành công');
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const category = await categoryService.update(req.params.id, req.body);
    return apiResponse.ok(res, category, 'Cập nhật danh mục thành công');
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    await categoryService.delete(req.params.id);
    return apiResponse.ok(res, null, 'Xóa danh mục thành công');
  } catch (err) {
    next(err);
  }
};

export const restoreCategory = async (req, res, next) => {
  try {
    const category = await categoryService.restore(req.params.id);
    return apiResponse.ok(res, category, 'Khôi phục danh mục thành công');
  } catch (err) {
    next(err);
  }
};

export const batchDeleteCategories = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return apiResponse.badRequest(res, 'Danh sách id không hợp lệ');
    }
    const result = await categoryService.batchDelete(ids);
    return apiResponse.ok(res, result, `Đã xóa ${result.deletedCount} danh mục`);
  } catch (err) {
    next(err);
  }
};