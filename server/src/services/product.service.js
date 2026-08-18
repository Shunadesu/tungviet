import mongoose from 'mongoose';
import Product from '../models/Product.js';
import MainTree from '../models/MainTree.js';
import Category from '../models/Category.js';
import MarketTree from '../models/MarketTree.js';
import { AppError } from '../utils/AppError.js';
import { buildPagination } from '../utils/apiResponse.js';
import { invalidatePublicCache } from '../utils/cache.js';

const SORT_MAP = {
  name_asc: { name: 1 },
  name_desc: { name: -1 },
  newest: { createdAt: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  popularity: { viewCount: -1 },
};

const invalidate = () => invalidatePublicCache();

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
    page = 1,
    limit = 20,
  } = {}) {
    const query = { isActive: true, webStatus: 'published' };
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

    const sortOption = SORT_MAP[sort] || { createdAt: -1 };
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Product.find(query)
        .populate('industries', 'name nameEn slug')
        .populate('productLines', 'name nameEn slug')
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);
    return { items, pagination: buildPagination(page, limit, total) };
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

    const sanitizedApplications = sanitizeApplications(applications);

    const product = new Product({
      productCode: productCode ? productCode.toUpperCase() : '',
      name,
      nameEn,
      description,
      descriptionEn,
      imageUrl,
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
    });
    await product.save();
    invalidate();
    return product;
  },

  async update(id, payload) {
    const allowedFields = [
      'productCode', 'name', 'nameEn', 'description', 'descriptionEn', 'imageUrl',
      'industries', 'productLines', 'marketIds', 'price', 'priceVisible', 'webStatus', 'targetAudience',
      'softeningPoint', 'acidValue', 'color', 'benefits', 'applications', 'tdsUrl',
      'attributes', 'isActive',
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