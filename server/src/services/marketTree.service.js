import mongoose from 'mongoose';
import MarketTree from '../models/MarketTree.js';
import Product from '../models/Product.js';
import { AppError } from '../utils/AppError.js';
import {
  invalidatePublicCache,
  invalidateHomeCache,
  invalidateProductsCache,
} from '../utils/cache.js';

const invalidate = () => {
  invalidatePublicCache();
  invalidateHomeCache();
};

const PRODUCT_PREVIEW_FIELDS =
  'name nameEn imageUrl slug productCode applications';

const APPLICATION_PREVIEW_FIELDS =
  '_id title titleEn description descriptionEn imageUrl';

const sanitizeProductLineEntries = (entries = []) =>
  (Array.isArray(entries) ? entries : [])
    .map((entry) => {
      const productLineId = entry?.productLineId?._id || entry?.productLineId
        ? String(entry.productLineId?._id || entry.productLineId)
        : null;
      return productLineId ? { productLineId } : null;
    })
    .filter(Boolean);

const sanitizeProductEntries = (entries = []) =>
  (Array.isArray(entries) ? entries : [])
    .map((entry) => {
      const productId =
        entry && (entry.productId?._id || entry.productId)
          ? String(entry.productId?._id || entry.productId)
          : null;
      const applicationIndex = Number.isFinite(Number(entry?.applicationIndex))
        ? Number(entry.applicationIndex)
        : -1;
      if (!productId || applicationIndex < 0) return null;
      return { productId, applicationIndex };
    })
    .filter(Boolean);

const sanitizeSubDocs = (list = []) =>
  (Array.isArray(list) ? list : [])
    .filter((s) => s && s.title)
    .map((s) => {
      let linkToMainTree = null;
      if (s.linkToMainTree) {
        const raw = s.linkToMainTree?._id || s.linkToMainTree;
        try {
          linkToMainTree = raw ? String(raw) : null;
        } catch (_) {
          linkToMainTree = null;
        }
      }
      return {
        _id: s._id,
        title: s.title || '',
        titleEn: s.titleEn || '',
        description: s.description || '',
        descriptionEn: s.descriptionEn || '',
        imageUrl: s.imageUrl || '',
        order: Number.isFinite(s.order) ? s.order : 0,
        isActive: s.isActive !== false,
        linkToMainTree,
        linkCustomUrl: typeof s.linkCustomUrl === 'string' ? s.linkCustomUrl.trim() : '',
        productEntries: sanitizeProductEntries(s.productEntries),
      };
    });

const sortSubDocs = (node) => {
  if (Array.isArray(node.applications)) {
    node.applications = [...node.applications].sort((a, b) => {
      const ao = a.order ?? 0;
      const bo = b.order ?? 0;
      if (ao !== bo) return ao - bo;
      return (a.title || '').localeCompare(b.title || '');
    });
  }
  if (Array.isArray(node.technologies)) {
    node.technologies = [...node.technologies].sort((a, b) => {
      const ao = a.order ?? 0;
      const bo = b.order ?? 0;
      if (ao !== bo) return ao - bo;
      return (a.title || '').localeCompare(b.title || '');
    });
  }
  return node;
};

export const marketTreeService = {
  async getPublic({ featuredOnly } = {}) {
    const query = { isActive: true };
    if (featuredOnly) query.isFeatured = true;

    const flat = await MarketTree.find(query)
      .sort({ isFeatured: -1, order: 1, title: 1 })
      .populate({
        path: 'industry',
        select: '_id name nameEn slug',
      })
      .populate({
        path: 'productLineEntries.productLineId',
        select: 'name nameEn slug imageUrl description descriptionEn',
      })
      .populate({
        path: 'applications.productEntries.productId',
        select: PRODUCT_PREVIEW_FIELDS,
        populate: {
          path: 'applications',
          select: APPLICATION_PREVIEW_FIELDS,
        },
      })
      .populate({
        path: 'technologies',
      })
      .populate({
        path: 'technologies.linkToMainTree',
        select: '_id name nameEn slug',
      })
      .populate({
        path: 'applications.linkToMainTree',
        select: '_id name nameEn slug',
      })
      .lean();

    const ids = flat.map((n) => n._id);
    let productCountMap = new Map();
    if (ids.length > 0) {
      const counts = await Product.aggregate([
        {
          $match: {
            marketIds: { $in: ids },
            isActive: true,
            webStatus: 'published',
          },
        },
        { $unwind: '$marketIds' },
        { $match: { marketIds: { $in: ids } } },
        { $group: { _id: '$marketIds', count: { $sum: 1 } } },
      ]);
      productCountMap = new Map(counts.map((c) => [String(c._id), c.count]));
    }

    return flat.map((node) => {
      const enriched = {
        ...node,
        productCount: productCountMap.get(String(node._id)) || 0,
      };
      return sortSubDocs(enriched);
    });
  },

  async getAdmin({ search } = {}) {
    const filter = {};
    if (search) filter.title = { $regex: search, $options: 'i' };
    return MarketTree.find(filter)
      .sort({ order: 1, title: 1 })
      .lean();
  },

  async getById(id) {
    return MarketTree.findById(id)
      .populate({
        path: 'industry',
        select: '_id name nameEn slug',
      })
      .populate({
        path: 'productLineEntries.productLineId',
        select: 'name nameEn slug imageUrl description descriptionEn',
      })
      .populate({
        path: 'applications.productEntries.productId',
        select: PRODUCT_PREVIEW_FIELDS,
        populate: {
          path: 'applications',
          select: APPLICATION_PREVIEW_FIELDS,
        },
      })
      .populate({
        path: 'technologies',
      })
      .populate({
        path: 'technologies.linkToMainTree',
        select: '_id name nameEn slug',
      })
      .populate({
        path: 'applications.linkToMainTree',
        select: '_id name nameEn slug',
      })
      .lean();
  },

  async getPublicFeatured({ limit = 6 } = {}) {
    return MarketTree.find({ isActive: true, isFeatured: true })
      .sort({ order: 1, title: 1 })
      .limit(limit)
      .populate({
        path: 'industry',
        select: '_id name nameEn slug',
      })
      .lean();
  },

  async getPublicGrouped() {
    const all = await MarketTree.find({ isActive: true })
      .sort({ order: 1, title: 1 })
      .populate({
        path: 'industry',
        select: '_id name nameEn slug',
      })
      .lean();

    // Group by industry id; null industry => "Other"
    const groups = new Map();
    for (const node of all) {
      const industry = node.industry
        ? {
            _id: String(node.industry._id || node.industry),
            name: node.industry.name || '',
            nameEn: node.industry.nameEn || '',
            slug: node.industry.slug || '',
          }
        : null;
      const key = industry ? String(industry._id) : '__ungrouped__';
      if (!groups.has(key)) {
        groups.set(key, {
          industry,
          markets: [],
        });
      }
      groups.get(key).markets.push(node);
    }

    return Array.from(groups.values());
  },

  async create(data) {
    const maxOrder = await MarketTree.findOne().sort({ order: -1 }).lean();
    const order = data.order ?? (maxOrder ? maxOrder.order + 1 : 0);
    const doc = new MarketTree({
      slug: data.slug || '',
      title: data.title,
      titleEn: data.titleEn || '',
      description: data.description || '',
      descriptionEn: data.descriptionEn || '',
      introductions: {
        vi: data?.introductions?.vi || '',
        en: data?.introductions?.en || '',
      },
      imageUrl: data.imageUrl || '',
      industry: data.industry || null,
      order,
      isActive: data.isActive !== false,
      isFeatured: data.isFeatured === true,
      applications: sanitizeSubDocs(data.applications),
      technologies: sanitizeSubDocs(data.technologies),
      productLineEntries: sanitizeProductLineEntries(data.productLineEntries),
    });
    await doc.save();
    invalidate();
    return doc.toObject();
  },

  async update(id, data) {
    const updatePayload = { ...data };

    if (data.introductions !== undefined) {
      updatePayload.introductions = {
        vi: data.introductions?.vi || '',
        en: data.introductions?.en || '',
      };
    }

    if (data.applications !== undefined) {
      updatePayload.applications = sanitizeSubDocs(data.applications);
    }
    if (data.technologies !== undefined) {
      updatePayload.technologies = sanitizeSubDocs(data.technologies);
    }
    if (data.productLineEntries !== undefined) {
      updatePayload.productLineEntries = sanitizeProductLineEntries(data.productLineEntries);
    }
    if (data.isFeatured !== undefined) {
      updatePayload.isFeatured = data.isFeatured === true;
    }
    if (data.industry !== undefined) {
      updatePayload.industry = data.industry || null;
    }

    const doc = await MarketTree.findByIdAndUpdate(id, updatePayload, {
      new: true,
      runValidators: true,
    });
    invalidate();
    return doc?.toObject() || null;
  },

  async remove(id) {
    await MarketTree.findByIdAndDelete(id);
    invalidate();
  },

  async reorder(orderList) {
    const ops = orderList.map((item) => ({
      updateOne: {
        filter: { _id: item._id },
        update: { order: item.order },
      },
    }));
    await MarketTree.bulkWrite(ops);
    invalidate();
  },

  async bulk({ action, ids, isActive } = {}) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw AppError.badRequest('ids phai la mot mang khong rong');
    }
    const idList = ids.map(String).filter(Boolean);
    if (idList.length === 0) {
      throw AppError.badRequest('ids phai la mot mang khong rong');
    }

    if (action === 'delete') {
      const res = await MarketTree.deleteMany({ _id: { $in: idList } });
      invalidate();
      return { deleted: res.deletedCount || 0 };
    }

    if (action === 'toggleActive') {
      const value = isActive === true;
      const res = await MarketTree.updateMany(
        { _id: { $in: idList } },
        { $set: { isActive: value } }
      );
      invalidate();
      return { modified: res.modifiedCount || res.matchedCount || 0, isActive: value };
    }

    throw AppError.badRequest(`Unsupported bulk action: ${action}`);
  },
};

export default marketTreeService;
