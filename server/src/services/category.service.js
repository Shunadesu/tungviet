import Category from '../models/Category.js';
import { AppError } from '../utils/AppError.js';
import { buildPagination } from '../utils/apiResponse.js';
import { invalidatePublicCache } from '../utils/cache.js';

const SORT_MAP = {
  name_asc: { name: 1 },
  name_desc: { name: -1 },
};

const invalidate = () => invalidatePublicCache();

export const categoryService = {
  async list({ includeInactive = false, sort = 'name_asc', page, limit } = {}) {
    const query = includeInactive ? {} : { isActive: true };
    const sortOption = SORT_MAP[sort] || { name: 1 };
    return Category.find(query).sort(sortOption);
  },

  async listPaginated({ includeInactive = false, sort = 'name_asc', page = 1, limit = 20 } = {}) {
    const query = includeInactive ? {} : { isActive: true };
    const sortOption = SORT_MAP[sort] || { name: 1 };
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Category.find(query).sort(sortOption).skip(skip).limit(limit),
      Category.countDocuments(query),
    ]);
    return { items, pagination: buildPagination(page, limit, total) };
  },

  async getById(id, { onlyActive = false } = {}) {
    const query = onlyActive ? { _id: id, isActive: true } : { _id: id };
    const category = await Category.findOne(query);
    if (!category) throw AppError.notFound('Danh mục không tồn tại');
    return category;
  },

  async create(payload) {
    const { name, nameEn = '', description = '', descriptionEn = '', imageUrl = '' } = payload;
    const category = new Category({ name, nameEn, description, descriptionEn, imageUrl });
    await category.save();
    invalidate();
    return category;
  },

  async update(id, payload) {
    const { name, nameEn, description, descriptionEn, imageUrl, isActive } = payload;
    const category = await Category.findByIdAndUpdate(
      id,
      { name, nameEn, description, descriptionEn, imageUrl, isActive },
      { new: true, runValidators: true }
    );
    if (!category) throw AppError.notFound('Danh mục không tồn tại');
    invalidate();
    return category;
  },

  async delete(id) {
    const category = await Category.findOne({ _id: id });
    if (!category) throw AppError.notFound('Danh mục không tồn tại');
    await category.delete();
    invalidate();
    return category;
  },

  async restore(id) {
    const category = await Category.findOneDeleted({ _id: id });
    if (!category) throw AppError.notFound('Danh mục không tồn tại trong thùng rác');
    await category.restore();
    invalidate();
    return category;
  },

  async batchDelete(ids) {
    const results = await Category.delete({ _id: { $in: ids } });
    invalidate();
    return results;
  },
};