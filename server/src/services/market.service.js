import Market from '../models/Market.js';
import { AppError } from '../utils/AppError.js';
import { buildPagination } from '../utils/apiResponse.js';
import { invalidatePublicCache } from '../utils/cache.js';

const invalidate = () => invalidatePublicCache();

const PRODUCT_POPULATE = {
  path: 'selectedProducts',
  select: 'name nameEn description descriptionEn imageUrl softeningPoint acidValue color benefits applications tdsUrl isActive'
};

const TECH_PRODUCT_POPULATE = {
  path: 'products',
  select: 'name nameEn imageUrl isActive'
};

const APP_PRODUCT_POPULATE = {
  path: 'products',
  select: 'name nameEn imageUrl isActive'
};

export const marketService = {
  async listPublic({ search, page = 1, limit = 20 } = {}) {
    const query = { isActive: true };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { titleEn: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Market.find(query)
        .populate(PRODUCT_POPULATE)
        .populate(TECH_PRODUCT_POPULATE)
        .populate(APP_PRODUCT_POPULATE)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Market.countDocuments(query),
    ]);
    return { items, pagination: buildPagination(page, limit, total) };
  },

  async listAdmin({ search, status, page = 1, limit = 20 } = {}) {
    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { titleEn: { $regex: search, $options: 'i' } }
      ];
    }
    if (status !== undefined) query.isActive = status === true || status === 'true';
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Market.find(query)
        .populate({ ...PRODUCT_POPULATE, select: 'name nameEn isActive' })
        .populate({ ...TECH_PRODUCT_POPULATE, select: 'name nameEn isActive' })
        .populate({ ...APP_PRODUCT_POPULATE, select: 'name nameEn isActive' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Market.countDocuments(query),
    ]);
    return { items, pagination: buildPagination(page, limit, total) };
  },

  async getById(id, { onlyActive = false, populate = true } = {}) {
    const query = onlyActive ? { _id: id, isActive: true } : { _id: id };
    let q = Market.findOne(query);
    if (populate) {
      q = q.populate(PRODUCT_POPULATE);
    }
    const market = await q;
    if (!market) throw AppError.notFound('Thị trường không tồn tại');
    return market;
  },

  async getByIdLean(id, { onlyActive = false } = {}) {
    const query = onlyActive ? { _id: id, isActive: true } : { _id: id };
    const market = await Market.findOne(query)
      .populate(PRODUCT_POPULATE)
      .populate(TECH_PRODUCT_POPULATE)
      .populate(APP_PRODUCT_POPULATE)
      .lean();
    if (!market) throw AppError.notFound('Thị trường không tồn tại');
    return market;
  },

  async create(payload) {
    const { title, titleEn = '', imageUrl = '', description = '', descriptionEn = '', tdsUrl = '', technologies = [], applications = [], selectedProducts = [] } = payload;
    const market = new Market({
      title,
      titleEn,
      imageUrl,
      description,
      descriptionEn,
      tdsUrl,
      technologies,
      applications,
      selectedProducts
    });
    await market.save();
    invalidate();
    return market;
  },

  async update(id, payload) {
    const { title, titleEn, imageUrl, description, descriptionEn, tdsUrl, technologies, applications, selectedProducts, isActive } = payload;
    const market = await Market.findByIdAndUpdate(
      id,
      { title, titleEn, imageUrl, description, descriptionEn, tdsUrl, technologies, applications, selectedProducts, isActive },
      { new: true, runValidators: true }
    ).populate(PRODUCT_POPULATE).populate(TECH_PRODUCT_POPULATE).populate(APP_PRODUCT_POPULATE);
    if (!market) throw AppError.notFound('Thị trường không tồn tại');
    invalidate();
    return market;
  },

  async delete(id) {
    const market = await Market.findOne({ _id: id });
    if (!market) throw AppError.notFound('Thị trường không tồn tại');
    await market.delete();
    invalidate();
    return market;
  },

  async restore(id) {
    const market = await Market.findOneDeleted({ _id: id });
    if (!market) throw AppError.notFound('Thị trường không tồn tại trong thùng rác');
    await market.restore();
    invalidate();
    return market;
  },

  async addProducts(id, productIds) {
    const market = await Market.findById(id);
    if (!market) throw AppError.notFound('Thị trường không tồn tại');
    const newProducts = productIds.filter(pid => !market.selectedProducts.includes(pid));
    market.selectedProducts.push(...newProducts);
    await market.save();
    invalidate();
    return market.populate(PRODUCT_POPULATE);
  },

  async removeProducts(id, productIds) {
    const market = await Market.findById(id);
    if (!market) throw AppError.notFound('Thị trường không tồn tại');
    market.selectedProducts = market.selectedProducts.filter(
      pid => !productIds.includes(pid.toString())
    );
    await market.save();
    invalidate();
    return market.populate(PRODUCT_POPULATE);
  }
};
