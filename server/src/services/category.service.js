import mongoose from 'mongoose';
import Category from '../models/Category.js';
import MainTree from '../models/MainTree.js';
import { AppError } from '../utils/AppError.js';
import { buildPagination } from '../utils/apiResponse.js';
import { invalidatePublicCache } from '../utils/cache.js';

const SORT_MAP = {
  name_asc: { name: 1 },
  name_desc: { name: -1 },
  order_asc: { order: 1, name: 1 },
};

const invalidate = () => invalidatePublicCache();

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');

const resolveIdOrSlug = async (value) => {
  if (!value) return null;
  if (mongoose.Types.ObjectId.isValid(value)) return value;
  const doc = await Category.findOne({ slug: value }).select('_id').lean();
  return doc ? doc._id : null;
};

const resolveMainTreeId = async (value) => {
  if (!value) return null;
  if (mongoose.Types.ObjectId.isValid(value)) return value;
  const doc = await MainTree.findOne({ slug: value }).select('_id').lean();
  return doc ? doc._id : null;
};

export const categoryService = {
  async list({ includeInactive = false, sort = 'order_asc', mainTree } = {}) {
    const query = includeInactive ? {} : { isActive: true };
    if (mainTree) {
      const mtId = await resolveMainTreeId(mainTree);
      if (mtId) query.mainTree = mtId;
    }
    const sortOption = SORT_MAP[sort] || SORT_MAP.order_asc;
    return Category.find(query).sort(sortOption).lean();
  },

  async listPaginated({
    includeInactive = false,
    sort = 'order_asc',
    mainTree,
    page = 1,
    limit = 20,
  } = {}) {
    const query = includeInactive ? {} : { isActive: true };
    if (mainTree) {
      const mtId = await resolveMainTreeId(mainTree);
      if (mtId) query.mainTree = mtId;
    }
    const sortOption = SORT_MAP[sort] || SORT_MAP.order_asc;
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Category.find(query)
        .populate('mainTree', 'name nameEn slug')
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
      Category.countDocuments(query),
    ]);
    return { items, pagination: buildPagination(page, limit, total) };
  },

  async getById(id, { onlyActive = false } = {}) {
    const docId = await resolveIdOrSlug(id);
    const query = onlyActive ? { _id: docId, isActive: true } : { _id: docId };
    const category = await Category.findOne(query)
      .populate('mainTree', 'name nameEn slug')
      .lean();
    if (!category) throw AppError.notFound('Danh mục không tồn tại');
    return category;
  },

  async create(payload) {
    const {
      name,
      nameEn = '',
      slug,
      description = '',
      descriptionEn = '',
      imageUrl = '',
      mainTree = null,
      order = 0,
      isActive = true,
    } = payload;

    const finalSlug = slug || slugify(name);
    const category = new Category({
      name,
      nameEn,
      slug: finalSlug,
      description,
      descriptionEn,
      imageUrl,
      mainTree: mainTree || null,
      order,
      isActive,
    });
    await category.save();
    invalidate();
    return category.toObject();
  },

  async update(id, payload) {
    const update = { ...payload };
    if (update.name && !update.slug) {
      update.slug = slugify(update.name);
    }
    const category = await Category.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });
    if (!category) throw AppError.notFound('Danh mục không tồn tại');
    invalidate();
    return category.toObject();
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

  async reorder(orderList) {
    const ops = orderList.map((item) => ({
      updateOne: {
        filter: { _id: item._id },
        update: { order: item.order },
      },
    }));
    await Category.bulkWrite(ops);
    invalidate();
  },
};

export default categoryService;