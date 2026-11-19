import mongoose from 'mongoose';
import Category from '../models/Category.js';
import MainTree from '../models/MainTree.js';
import Product from '../models/Product.js';
import { AppError } from '../utils/AppError.js';
import { buildPagination } from '../utils/apiResponse.js';
import { invalidatePublicCache } from '../utils/cache.js';

const SORT_MAP = {
  name_asc: { name: 1 },
  name_desc: { name: -1 },
  order_asc: { order: 1, name: 1 },
  newest: { createdAt: -1 },
};

/**
 * Đếm số SKU thuộc mỗi product line.
 *
 * Quản trị cần thấy TẤT CẢ SKU đang hoạt động (kể cả nháp / lưu trữ),
 * nên không lọc `webStatus` — chỉ loại sản phẩm đã xoá mềm.
 * Một SKU thuộc nhiều product line sẽ được đếm trong từng nhóm.
 */
const countSkusByProductLine = async (categoryIds) => {
  if (categoryIds.length === 0) return new Map();

  const counts = await Product.aggregate([
    {
      $match: {
        productLines: { $in: categoryIds },
        isActive: true,
        isDeleted: { $ne: true },
      },
    },
    { $unwind: '$productLines' },
    { $match: { productLines: { $in: categoryIds } } },
    { $group: { _id: '$productLines', count: { $sum: 1 } } },
  ]);

  return new Map(counts.map((c) => [String(c._id), c.count]));
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
  /**
   * Danh sách product line kèm số SKU thuộc mỗi nhóm.
   *
   * `skuCount` được tính bằng aggregation trên `Product.productLines` —
   * 1 SKU có thể thuộc nhiều product line nên được đếm trong từng nhóm.
   */
  async list({ includeInactive = false, sort = 'order_asc', mainTree, withSkuCount = false } = {}) {
    const query = includeInactive ? {} : { isActive: true };
    if (mainTree) {
      const mtId = await resolveMainTreeId(mainTree);
      if (mtId) query.mainTree = mtId;
    }
    const sortOption = SORT_MAP[sort] || SORT_MAP.order_asc;
    const categories = await Category.find(query).sort(sortOption).lean();
    if (!withSkuCount) return categories;

    const ids = categories.map((c) => c._id);
    if (ids.length === 0) return categories.map((c) => ({ ...c, skuCount: 0 }));

    const counts = await Product.aggregate([
      {
        $match: {
          productLines: { $in: ids },
          isActive: true,
          webStatus: 'published',
          isDeleted: { $ne: true },
        },
      },
      { $unwind: '$productLines' },
      { $match: { productLines: { $in: ids } } },
      { $group: { _id: '$productLines', count: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

    return categories.map((c) => ({ ...c, skuCount: countMap.get(String(c._id)) || 0 }));
  },

  /**
   * Danh sách product line phân trang (dùng cho trang quản trị).
   *
   * Hỗ trợ bộ lọc / sắp xếp:
   *   - `search`      : khớp name / nameEn / slug / description
   *   - `status`      : 'all' | 'active' | 'inactive'
   *   - `mainTree`    : lọc theo ngành hàng
   *   - `hasProducts` : '1' (có SKU) | '0' (chưa có SKU)
   *   - `sort`        : order_asc | name_asc | name_desc | newest | sku_desc
   *
   * Mỗi item kèm `skuCount` = số SKU đang hoạt động thuộc product line đó
   * (tính cả SKU nháp/lưu trữ, chỉ loại sản phẩm đã xoá mềm).
   *
   * Vì `skuCount` và bộ lọc `hasProducts` phụ thuộc vào kết quả aggregation,
   * toàn bộ bước lọc/sắp xếp được thực hiện trong bộ nhớ rồi mới cắt trang.
   * Số lượng product line nhỏ nên cách này hoàn toàn ổn.
   */
  async listPaginated({
    includeInactive = false,
    sort = 'order_asc',
    mainTree,
    search,
    status = 'all',
    hasProducts,
    page = 1,
    limit = 20,
  } = {}) {
    const query = {};

    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    } else if (!includeInactive) {
      query.isActive = true;
    }

    if (mainTree) {
      const mtId = await resolveMainTreeId(mainTree);
      if (mtId) query.mainTree = mtId;
    }

    if (search && String(search).trim()) {
      const rx = { $regex: String(search).trim(), $options: 'i' };
      query.$or = [{ name: rx }, { nameEn: rx }, { slug: rx }, { description: rx }];
    }

    const candidates = await Category.find(query)
      .populate('mainTree', 'name nameEn slug')
      .lean();

    const skuCountMap = await countSkusByProductLine(candidates.map((c) => c._id));

    let list = candidates.map((c) => ({
      ...c,
      skuCount: skuCountMap.get(String(c._id)) || 0,
    }));

    if (hasProducts === '1' || hasProducts === '0') {
      const wantProducts = hasProducts === '1';
      list = list.filter((c) => (c.skuCount > 0) === wantProducts);
    }

    const nameOf = (c) => `${c.name || ''} ${c.nameEn || ''}`.trim().toLowerCase();
    switch (sort) {
      case 'name_asc':
        list.sort((a, b) => nameOf(a).localeCompare(nameOf(b)));
        break;
      case 'name_desc':
        list.sort((a, b) => nameOf(b).localeCompare(nameOf(a)));
        break;
      case 'newest':
        list.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        break;
      case 'sku_desc':
        list.sort(
          (a, b) => b.skuCount - a.skuCount || nameOf(a).localeCompare(nameOf(b))
        );
        break;
      default:
        list.sort(
          (a, b) => (a.order ?? 0) - (b.order ?? 0) || nameOf(a).localeCompare(nameOf(b))
        );
    }

    const total = list.length;
    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const safeLimit = Math.max(1, parseInt(limit, 10) || 20);
    const skip = (safePage - 1) * safeLimit;
    const items = list.slice(skip, skip + safeLimit);

    return { items, pagination: buildPagination(safePage, safeLimit, total) };
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

  /**
   * Số liệu tổng quan cho trang quản trị.
   *
   * `totalSku` = tổng số SKU đang hoạt động (kể cả nháp/lưu trữ) đã được
   * gán vào ít nhất một product line.
   */
  async getStats() {
    const [total, active, inactive] = await Promise.all([
      Category.countDocuments({}),
      Category.countDocuments({ isActive: true }),
      Category.countDocuments({ isActive: false }),
    ]);

    // Đếm SKU DUY NHẤT đang hoạt động và đã được gán vào ít nhất một
    // product line — group theo chính product để không đếm trùng khi một
    // SKU thuộc nhiều product line.
    const skuRows = await Product.aggregate([
      {
        $match: {
          isActive: true,
          isDeleted: { $ne: true },
          productLines: { $exists: true, $ne: [] },
        },
      },
      { $group: { _id: '$_id' } },
      { $count: 'total' },
    ]);

    const totalSku = skuRows[0]?.total || 0;

    return { total, active, inactive, totalSku };
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