import Product from '../models/Product.js';
import { AppError } from '../utils/AppError.js';
import { buildPagination } from '../utils/apiResponse.js';
import { invalidatePublicCache } from '../utils/cache.js';

const SORT_MAP = {
  name_asc: { name: 1 },
  name_desc: { name: -1 },
  newest: { createdAt: -1 },
};

const invalidate = () => invalidatePublicCache();

export const productService = {
  async listPublic({ search, sort, page = 1, limit = 20 } = {}) {
    const query = { isActive: true };
    if (search) query.name = { $regex: search, $options: 'i' };
    const sortOption = SORT_MAP[sort] || { createdAt: -1 };
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Product.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);
    return { items, pagination: buildPagination(page, limit, total) };
  },

  async listAdmin({ search, status, page = 1, limit = 20 } = {}) {
    const query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    if (status !== undefined) query.isActive = status === true || status === 'true';
    const sortOption = SORT_MAP['newest'];
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Product.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);
    return { items, pagination: buildPagination(page, limit, total) };
  },

  async getById(id, { onlyActive = false, populate = false } = {}) {
    const query = onlyActive ? { _id: id, isActive: true } : { _id: id };
    const product = await Product.findOne(query).lean();
    if (!product) throw AppError.notFound('Sản phẩm không tồn tại');
    return product;
  },

  async getByIdLean(id, { onlyActive = false } = {}) {
    const query = onlyActive ? { _id: id, isActive: true } : { _id: id };
    const product = await Product.findOne(query).lean();
    if (!product) throw AppError.notFound('Sản phẩm không tồn tại');
    return product;
  },

  async create(payload) {
    const {
      name,
      nameEn = '',
      description = '',
      descriptionEn = '',
      imageUrl = '',
      softeningPoint = '',
      acidValue = '',
      color = '',
      benefits = [],
      applications = [],
      tdsUrl = '',
      isActive = true
    } = payload;

    const product = new Product({
      name,
      nameEn,
      description,
      descriptionEn,
      imageUrl,
      softeningPoint,
      acidValue,
      color,
      benefits,
      applications,
      tdsUrl,
      isActive
    });
    await product.save();
    invalidate();
    return product;
  },

  async update(id, payload) {
    const allowedFields = [
      'name', 'nameEn', 'description', 'descriptionEn', 'imageUrl',
      'softeningPoint', 'acidValue', 'color', 'benefits', 'applications', 'tdsUrl', 'isActive'
    ];
    const updateData = {};
    allowedFields.forEach(field => {
      if (payload[field] !== undefined) {
        updateData[field] = payload[field];
      }
    });

    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!product) throw AppError.notFound('Sản phẩm không tồn tại');
    invalidate();
    return product;
  },

  async delete(id) {
    const product = await Product.findOne({ _id: id });
    if (!product) throw AppError.notFound('Sản phẩm không tồn tại');
    await product.delete();
    invalidate();
    return product;
  },

  async restore(id) {
    const product = await Product.findOneDeleted({ _id: id });
    if (!product) throw AppError.notFound('Sản phẩm không tồn tại trong thùng rác');
    await product.restore();
    invalidate();
    return product;
  },

  async batchDelete(ids) {
    const results = await Product.delete({ _id: { $in: ids } });
    invalidate();
    return results;
  },

  async updateTdsUrl(id, tdsUrl) {
    const product = await Product.findByIdAndUpdate(
      id,
      { tdsUrl },
      { new: true, runValidators: true }
    );
    if (!product) throw AppError.notFound('Sản phẩm không tồn tại');
    invalidate();
    return product;
  },

  async listForSelect() {
    const products = await Product.find({ isActive: true })
      .select('_id name nameEn')
      .sort({ name: 1 })
      .lean();
    return products;
  }
};
