import mongoose from 'mongoose';
import Product from '../models/Product.js';
import MainTree from '../models/MainTree.js';
import Category from '../models/Category.js';
import MarketTree from '../models/MarketTree.js';
import { AppError } from '../utils/AppError.js';
import { buildPagination } from '../utils/apiResponse.js';
import {
  invalidatePublicCache,
  invalidateHomeCache,
  invalidateProductsCache,
} from '../utils/cache.js';

const SORT_MAP = {
  name_asc: { name: 1 },
  name_desc: { name: -1 },
  newest: { createdAt: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  popularity: { viewCount: -1 },
  featured: { isFeatured: -1, displayOrder: 1, createdAt: -1 },
  isNew: { isNew: -1, createdAt: -1 },
};

const PRODUCT_PUBLIC_PROJECTION = '_id productCode name nameEn description descriptionEn imageUrl gallery tags price priceVisible webStatus targetAudience softeningPoint acidValue color applications attributes tdsUrl isFeatured isNew displayOrder viewCount industries productLines createdAt updatedAt';

const PRODUCT_LIST_PROJECTION = '_id productCode name nameEn imageUrl price priceVisible isFeatured isNew viewCount industries productLines';

const populatePublicFields = (q) =>
  q
    .populate('industries', 'name nameEn slug')
    .populate('productLines', 'name nameEn slug')
    .populate('marketIds', 'title titleEn slug');

const baseActiveQuery = () => ({ isActive: true, webStatus: 'published' });

const invalidate = () => {
  invalidateProductsCache();
  invalidateHomeCache();
  invalidatePublicCache();
};

const resolveIdOrSlug = async (value, Model) => {
  if (!value) return null;
  if (mongoose.Types.ObjectId.isValid(value)) return value;
  const doc = await Model.findOne({ slug: value }).select('_id').lean();
  return doc ? doc._id : null;
};

/**
 * Normalize an incoming filter param that may arrive as:
 *   - a single string  ("64f...")
 *   - an array of strings (when express parses repeated query keys)
 *   - a single comma-separated string ("64f,64e,64d")
 * and produce an array of Mongo ObjectIds (with slugs resolved to ids).
 */
const resolveIdList = async (raw, Model) => {
  if (raw === undefined || raw === null || raw === '') return [];
  const parts = Array.isArray(raw) ? raw : String(raw).split(',');
  const out = [];
  for (const part of parts) {
    const trimmed = String(part).trim();
    if (!trimmed) continue;
    const id = await resolveIdOrSlug(trimmed, Model);
    if (id) out.push(String(id));
  }
  return out;
};

export const parseBenefitsText = (text) => {
  if (!text || typeof text !== 'string') return [];
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/^[\s*▪•\-\u2022]+/, '').trim())
    .filter((line) => line.length > 0);
};

export const sanitizeApplications = (list = []) =>
  (Array.isArray(list) ? list : [])
    .filter((s) => s && (s.title || s.titleEn))
    .map((s) => ({
      _id: s._id || undefined,
      title: s.title || '',
      titleEn: s.titleEn || '',
      description: s.description || '',
      descriptionEn: s.descriptionEn || '',
      imageUrl: s.imageUrl || '',
      order: Number.isFinite(Number(s.order)) ? Number(s.order) : 0,
      isActive: s.isActive !== false,
    }));

/**
 * Build a `$in` query for a list of MainTree ids.
 *   empty list  → no constraint (match all)
 *   non-empty   → product.industries overlaps any of the ids
 */
const industriesMatch = (ids) => {
  if (!ids || ids.length === 0) return null;
  return { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) };
};

const marketMatch = (ids) => {
  if (!ids || ids.length === 0) return null;
  return { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) };
};

export const productService = {
  async listPublic({
    search,
    sort,
    industries,
    productLine,
    market,
    softeningPoint,
    page = 1,
    limit = 20,
  } = {}) {
    const query = baseActiveQuery();
    if (search) query.name = { $regex: search, $options: 'i' };

    const industryIds = await resolveIdList(industries, MainTree);
    const indMatch = industriesMatch(industryIds);
    if (indMatch) query.industries = indMatch;

    const productLineIds = await resolveIdList(productLine, Category);
    if (productLineIds.length > 0) {
      query.productLines = {
        $in: productLineIds.map((id) => new mongoose.Types.ObjectId(id)),
      };
    }

    const marketIds = await resolveIdList(market, MarketTree);
    const mktMatch = marketMatch(marketIds);
    if (mktMatch) query.marketIds = mktMatch;

    if (softeningPoint && String(softeningPoint).trim()) {
      query.softeningPoint = String(softeningPoint).trim();
    }

    const sortOption = SORT_MAP[sort] || { createdAt: -1 };
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Product.find(query)
        .populate('industries', 'name nameEn slug')
        .populate('productLines', 'name nameEn slug')
        .populate('marketIds', 'title titleEn slug')
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);
    return { items, pagination: buildPagination(page, limit, total) };
  },

  async listPublicFeatured({ limit = 8 } = {}) {
    return Product.find({ ...baseActiveQuery(), isFeatured: true })
      .select(PRODUCT_LIST_PROJECTION)
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(limit)
      .populate('industries', 'name nameEn slug')
      .populate('productLines', 'name nameEn slug')
      .lean();
  },

  async listPublicPopular({ limit = 4 } = {}) {
    return Product.find(baseActiveQuery())
      .select(PRODUCT_LIST_PROJECTION)
      .sort({ viewCount: -1, createdAt: -1 })
      .limit(limit)
      .populate('industries', 'name nameEn slug')
      .populate('productLines', 'name nameEn slug')
      .lean();
  },

  async listPublicNew({ limit = 4 } = {}) {
    return Product.find({ ...baseActiveQuery(), isNew: true })
      .select(PRODUCT_LIST_PROJECTION)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('industries', 'name nameEn slug')
      .populate('productLines', 'name nameEn slug')
      .lean();
  },

  async listRelated(id, { limit = 4 } = {}) {
    if (!mongoose.Types.ObjectId.isValid(id)) return [];
    const base = await Product.findOne({ _id: id, ...baseActiveQuery() })
      .select('industries marketIds')
      .lean();
    if (!base) return [];

    const industryIds = (base.industries || []).map(String);
    const marketIds = (base.marketIds || []).map(String);

    if (industryIds.length === 0 && marketIds.length === 0) return [];

    const orConditions = [];
    if (industryIds.length > 0) {
      orConditions.push({
        industries: { $in: industryIds.map((i) => new mongoose.Types.ObjectId(i)) },
      });
    }
    if (marketIds.length > 0) {
      orConditions.push({
        marketIds: { $in: marketIds.map((m) => new mongoose.Types.ObjectId(m)) },
      });
    }

    return Product.find({
      ...baseActiveQuery(),
      _id: { $ne: id },
      $or: orConditions,
    })
      .select(PRODUCT_LIST_PROJECTION)
      .sort({ isFeatured: -1, viewCount: -1, createdAt: -1 })
      .limit(limit)
      .populate('industries', 'name nameEn slug')
      .populate('productLines', 'name nameEn slug')
      .lean();
  },

  async listByIds(ids = []) {
    const cleaned = (Array.isArray(ids) ? ids : [])
      .filter(Boolean)
      .map(String)
      .filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (cleaned.length === 0) return [];
    return Product.find({
      _id: { $in: cleaned.map((id) => new mongoose.Types.ObjectId(id)) },
      ...baseActiveQuery(),
    })
      .select(PRODUCT_PUBLIC_PROJECTION)
      .populate('industries', 'name nameEn slug')
      .populate('productLines', 'name nameEn slug')
      .lean();
  },

  async listAdmin({
    search,
    status,
    webStatus,
    industries,
    productLine,
    market,
    page = 1,
    limit = 20,
  } = {}) {
    const query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    if (status !== undefined) query.isActive = status === true || status === 'true';
    if (webStatus) query.webStatus = webStatus;

    const industryIds = await resolveIdList(industries, MainTree);
    const indMatch = industriesMatch(industryIds);
    if (indMatch) query.industries = indMatch;

    const productLineIds = await resolveIdList(productLine, Category);
    if (productLineIds.length > 0) {
      query.productLines = {
        $in: productLineIds.map((id) => new mongoose.Types.ObjectId(id)),
      };
    }

    const marketIds = await resolveIdList(market, MarketTree);
    const mktMatch = marketMatch(marketIds);
    if (mktMatch) query.marketIds = mktMatch;

    const sortOption = SORT_MAP['newest'];
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Product.find(query)
        .populate('industries', 'name nameEn slug')
        .populate('productLines', 'name nameEn slug')
        .populate('marketIds', 'title titleEn slug')
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);
    return { items, pagination: buildPagination(page, limit, total) };
  },

  async getById(id, { onlyActive = false, populate = false } = {}) {
    const query = onlyActive
      ? { _id: id, isActive: true, webStatus: 'published' }
      : { _id: id };
    let q = Product.findOne(query);
    if (populate) {
      q = q
        .populate('industries', 'name nameEn slug')
        .populate('productLines', 'name nameEn slug');
    }
    const product = await q.lean();
    if (!product) throw AppError.notFound('Sản phẩm không tồn tại');
    return product;
  },

  async getByIdLean(id, { onlyActive = false } = {}) {
    const query = onlyActive
      ? { _id: id, isActive: true, webStatus: 'published' }
      : { _id: id };
    const product = await Product.findOne(query)
      .populate('industries', 'name nameEn slug')
      .populate('productLines', 'name nameEn slug')
      .lean();
    if (!product) throw AppError.notFound('Sản phẩm không tồn tại');
    return product;
  },

  async create(payload) {
    const {
      productCode = '',
      name,
      nameEn = '',
      description = '',
      descriptionEn = '',
      imageUrl = '',
      gallery = [],
      tags = [],
      industries = [],
      productLines = [],
      marketIds = [],
      price = 0,
      priceVisible = true,
      webStatus = 'draft',
      targetAudience = '',
      softeningPoint = '',
      acidValue = '',
      color = '',
      benefits = [],
      applications = [],
      tdsUrl = '',
      attributes = {},
      isActive = true,
      isFeatured = false,
      isNew = false,
      displayOrder = 0,
    } = payload;

    const sanitizedAttributes =
      attributes && typeof attributes === 'object' && !Array.isArray(attributes)
        ? attributes
        : {};

    const sanitizedIndustries = Array.isArray(industries)
      ? industries.filter(Boolean).map(String)
      : [];

    const sanitizedProductLines = Array.isArray(productLines)
      ? productLines.filter(Boolean).map(String)
      : [];

    const sanitizedMarketIds = Array.isArray(marketIds)
      ? marketIds.filter(Boolean)
      : [];

    const sanitizedGallery = Array.isArray(gallery)
      ? gallery
          .filter((g) => g && g.url)
          .map((g, idx) => ({
            url: g.url,
            alt: g.alt || '',
            altEn: g.altEn || '',
            order: Number.isFinite(Number(g.order)) ? Number(g.order) : idx,
          }))
      : [];

    const sanitizedTags = Array.isArray(tags)
      ? tags.map((t) => String(t).trim()).filter(Boolean)
      : [];

    const sanitizedApplications = sanitizeApplications(applications);

    const product = new Product({
      productCode: productCode ? productCode.toUpperCase() : '',
      name,
      nameEn,
      description,
      descriptionEn,
      imageUrl,
      gallery: sanitizedGallery,
      tags: sanitizedTags,
      industries: sanitizedIndustries,
      productLines: sanitizedProductLines,
      marketIds: sanitizedMarketIds,
      price: Number(price) || 0,
      priceVisible: priceVisible !== false,
      webStatus: ['draft', 'published', 'archived'].includes(webStatus) ? webStatus : 'draft',
      targetAudience,
      softeningPoint,
      acidValue,
      color,
      benefits,
      applications: sanitizedApplications,
      tdsUrl,
      attributes: sanitizedAttributes,
      isActive,
      isFeatured: isFeatured === true,
      isNew: isNew === true,
      displayOrder: Number.isFinite(Number(displayOrder)) ? Number(displayOrder) : 0,
    });
    await product.save();
    invalidate();
    return product;
  },

  async update(id, payload) {
    const allowedFields = [
      'productCode', 'name', 'nameEn', 'description', 'descriptionEn', 'imageUrl',
      'gallery', 'tags', 'industries', 'productLines', 'marketIds', 'price', 'priceVisible',
      'webStatus', 'targetAudience', 'softeningPoint', 'acidValue', 'color', 'benefits',
      'applications', 'tdsUrl', 'attributes', 'isActive', 'isFeatured', 'isNew', 'displayOrder',
    ];
    const updateData = {};
    allowedFields.forEach((field) => {
      if (payload[field] !== undefined) {
        if (field === 'attributes') {
          if (payload.attributes && typeof payload.attributes === 'object' && !Array.isArray(payload.attributes)) {
            updateData.attributes = payload.attributes;
          }
        } else if (field === 'productCode') {
          updateData.productCode = payload.productCode ? payload.productCode.toUpperCase() : '';
        } else if (field === 'price') {
          updateData.price = Number(payload.price) || 0;
        } else if (field === 'marketIds') {
          updateData.marketIds = Array.isArray(payload.marketIds)
            ? payload.marketIds.filter(Boolean)
            : [];
        } else if (field === 'industries') {
          updateData.industries = Array.isArray(payload.industries)
            ? payload.industries.filter(Boolean).map(String)
            : [];
        } else if (field === 'productLines') {
          updateData.productLines = Array.isArray(payload.productLines)
            ? payload.productLines.filter(Boolean).map(String)
            : [];
        } else if (field === 'applications') {
          updateData.applications = sanitizeApplications(payload.applications);
        } else if (field === 'gallery') {
          updateData.gallery = Array.isArray(payload.gallery)
            ? payload.gallery
                .filter((g) => g && g.url)
                .map((g, idx) => ({
                  url: g.url,
                  alt: g.alt || '',
                  altEn: g.altEn || '',
                  order: Number.isFinite(Number(g.order)) ? Number(g.order) : idx,
                }))
            : [];
        } else if (field === 'tags') {
          updateData.tags = Array.isArray(payload.tags)
            ? payload.tags.map((t) => String(t).trim()).filter(Boolean)
            : [];
        } else if (field === 'isFeatured') {
          updateData.isFeatured = payload.isFeatured === true;
        } else if (field === 'isNew') {
          updateData.isNew = payload.isNew === true;
        } else if (field === 'displayOrder') {
          updateData.displayOrder = Number.isFinite(Number(payload.displayOrder))
            ? Number(payload.displayOrder)
            : 0;
        } else {
          updateData[field] = payload[field];
        }
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
  },
};

export default productService;