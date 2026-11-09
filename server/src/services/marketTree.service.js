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

const PRODUCT_LINE_PREVIEW_FIELDS = 'name nameEn slug imageUrl';

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
      return productId ? { productId } : null;
    })
    .filter(Boolean);

const sanitizeLinkIds = (value) =>
  (Array.isArray(value) ? value : value ? [value] : [])
    .map((v) => {
      const raw = v?._id || v;
      try { return String(raw) || null; }
      catch (_) { return null; }
    })
    .filter(Boolean);

const sanitizeSpecifications = (list) =>
  (Array.isArray(list) ? list : [])
    .filter((spec) => spec && typeof spec.key === 'string' && spec.key.trim())
    .map((spec, idx) => ({
      _id: spec._id || undefined,
      key: spec.key.trim(),
      value: typeof spec.value === 'string' ? spec.value : '',
      valueEn: typeof spec.valueEn === 'string' ? spec.valueEn : '',
      unit: typeof spec.unit === 'string' ? spec.unit.trim() : '',
      order: Number.isFinite(Number(spec.order)) ? Number(spec.order) : idx,
    }));

/**
 * Chuẩn hóa một sub-document (technology / application) trước khi lưu.
 * Giữ lại toàn bộ field đã nhập ở admin: specifications, productLineEntries,
 * productEntries, linkToMainTree, linkCustomUrl.
 */
const sanitizeSubDocs = (list = [], kind = 'application') => {
  return (Array.isArray(list) ? list : [])
    .filter((s) => s && s.title)
    .map((s) => {
      const base = {
        _id: s._id || undefined,
        title: s.title || '',
        titleEn: s.titleEn || '',
        description: s.description || '',
        descriptionEn: s.descriptionEn || '',
        imageUrl: s.imageUrl || '',
        order: Number.isFinite(s.order) ? s.order : 0,
        isActive: s.isActive !== false,
        linkToMainTree: sanitizeLinkIds(s.linkToMainTree),
        linkCustomUrl: typeof s.linkCustomUrl === 'string' ? s.linkCustomUrl : '',
        productLineEntries: sanitizeProductLineEntries(s.productLineEntries),
        productEntries: sanitizeProductEntries(s.productEntries),
      };
      if (kind === 'technology') {
        base.specifications = sanitizeSpecifications(s.specifications);
        // Preserve nested applications when sanitising a technology node.
        base.applications = sanitizeSubDocs(s.applications, 'application');
      }
      return base;
    });
};

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

/**
 * Đếm số sản phẩm gắn với từng công nghệ / ứng dụng của một market.
 * Nguồn dữ liệu: `Product.marketEntries` — mỗi entry gồm marketId,
 * technologyIds và applicationIds trỏ tới _id của sub-document.
 */
const getSubDocProductCounts = async (marketId) => {
  const techCounts = new Map();
  const appCounts = new Map();

  if (!marketId || !mongoose.Types.ObjectId.isValid(String(marketId))) {
    return { techCounts, appCounts };
  }

  const mid = new mongoose.Types.ObjectId(String(marketId));

  const [techAgg, appAgg] = await Promise.all([
    Product.aggregate([
      { $match: { marketEntries: { $elemMatch: { marketId: mid } } } },
      { $unwind: '$marketEntries' },
      { $match: { 'marketEntries.marketId': mid } },
      // Dedup theo product: gom cac technologyIds trùng nhau ve mot danh sach.
      {
        $group: {
          _id: '$_id',
          techIds: { $addToSet: '$marketEntries.technologyIds' },
        },
      },
      { $unwind: '$techIds' },
      { $unwind: '$techIds' },
      { $group: { _id: '$techIds', count: { $sum: 1 } } },
    ]),
    Product.aggregate([
      { $match: { marketEntries: { $elemMatch: { marketId: mid } } } },
      { $unwind: '$marketEntries' },
      { $match: { 'marketEntries.marketId': mid } },
      {
        $group: {
          _id: '$_id',
          appIds: { $addToSet: '$marketEntries.applicationIds' },
        },
      },
      { $unwind: '$appIds' },
      { $unwind: '$appIds' },
      { $group: { _id: '$appIds', count: { $sum: 1 } } },
    ]),
  ]);

  for (const row of techAgg) techCounts.set(String(row._id), row.count);
  for (const row of appAgg) appCounts.set(String(row._id), row.count);

  return { techCounts, appCounts };
};

/**
 * Gắn productCount (và applicationCount cho technology) dựa trên
 * Product.marketEntries của chính market đó.
 */
const attachProductCounts = (node, { techCounts, appCounts }) => {
  const applyApp = (app) => ({
    ...app,
    productCount: appCounts.get(String(app._id)) || 0,
  });

  if (Array.isArray(node.applications)) {
    node.applications = node.applications.map(applyApp);
  }

  if (Array.isArray(node.technologies)) {
    node.technologies = node.technologies.map((tech) => {
      const nested = Array.isArray(tech.applications)
        ? tech.applications.map(applyApp)
        : [];
      return {
        ...tech,
        applications: nested,
        applicationCount: nested.length,
        productCount: techCounts.get(String(tech._id)) || 0,
      };
    });
  }

  return node;
};

const withProductCounts = async (node) => {
  const { techCounts, appCounts } = await getSubDocProductCounts(node?._id);
  return attachProductCounts(node, { techCounts, appCounts });
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
        strictPopulate: false,
      })
      .populate({
        path: 'productLineEntries.productLineId',
        select: PRODUCT_LINE_PREVIEW_FIELDS,
        strictPopulate: false,
      })
      .populate({
        path: 'applications.productEntries.productId',
        select: PRODUCT_PREVIEW_FIELDS,
        strictPopulate: false,
      })
      .populate({
        path: 'applications.productLineEntries.productLineId',
        select: PRODUCT_LINE_PREVIEW_FIELDS,
        strictPopulate: false,
      })
      .populate({
        path: 'applications.linkToMainTree',
        select: '_id name nameEn slug',
        strictPopulate: false,
      })
      .populate({
        path: 'technologies.linkToMainTree',
        select: '_id name nameEn slug',
        strictPopulate: false,
      })
      .populate({
        path: 'technologies.applications.linkToMainTree',
        select: '_id name nameEn slug',
        strictPopulate: false,
      })
      .populate({
        path: 'technologies.applications.productEntries.productId',
        select: PRODUCT_PREVIEW_FIELDS,
        strictPopulate: false,
      })
      .populate({
        path: 'technologies.applications.productLineEntries.productLineId',
        select: PRODUCT_LINE_PREVIEW_FIELDS,
        strictPopulate: false,
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
    const tree = await MarketTree.findById(id)
      .populate({
        path: 'industry',
        select: '_id name nameEn slug',
        strictPopulate: false,
      })
      .populate({
        path: 'productLineEntries.productLineId',
        select: PRODUCT_LINE_PREVIEW_FIELDS,
        strictPopulate: false,
      })
      .populate({
        path: 'applications.productEntries.productId',
        select: PRODUCT_PREVIEW_FIELDS,
        strictPopulate: false,
      })
      .populate({
        path: 'applications.productLineEntries.productLineId',
        select: PRODUCT_LINE_PREVIEW_FIELDS,
        strictPopulate: false,
      })
      .populate({
        path: 'applications.linkToMainTree',
        select: '_id name nameEn slug',
        strictPopulate: false,
      })
      .populate({
        path: 'technologies.linkToMainTree',
        select: '_id name nameEn slug',
        strictPopulate: false,
      })
      .populate({
        path: 'technologies.applications.linkToMainTree',
        select: '_id name nameEn slug',
        strictPopulate: false,
      })
      .populate({
        path: 'technologies.applications.productEntries.productId',
        select: PRODUCT_PREVIEW_FIELDS,
        strictPopulate: false,
      })
      .populate({
        path: 'technologies.applications.productLineEntries.productLineId',
        select: PRODUCT_LINE_PREVIEW_FIELDS,
        strictPopulate: false,
      })
      .lean();

    if (!tree) return null;
    return withProductCounts(sortSubDocs(tree));
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
    // industry can be an array (multiple MainTrees)
    const groups = new Map();
    for (const node of all) {
      // Resolve industry: may be an array of ObjectIds or array of populated objects
      const industryIds = Array.isArray(node.industry) ? node.industry : [];
      if (industryIds.length === 0) {
        // No industries → "Other"
        const key = '__ungrouped__';
        if (!groups.has(key)) {
          groups.set(key, {
            industry: null,
            markets: [],
          });
        }
        groups.get(key).markets.push(node);
      } else {
        // One or more industries → add to each group
        for (const indRaw of industryIds) {
          const industry = {
            _id: String(indRaw._id || indRaw),
            name: indRaw.name || '',
            nameEn: indRaw.nameEn || '',
            slug: indRaw.slug || '',
          };
          const key = String(industry._id);
          if (!groups.has(key)) {
            groups.set(key, {
              industry,
              markets: [],
            });
          }
          groups.get(key).markets.push(node);
        }
      }
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
      industry: Array.isArray(data.industry) ? data.industry : [],
      order,
      isActive: data.isActive !== false,
      isFeatured: data.isFeatured === true,
      applications: sanitizeSubDocs(data.applications, 'application'),
      technologies: sanitizeSubDocs(data.technologies, 'technology'),
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
        vi: data?.introductions?.vi || '',
        en: data?.introductions?.en || '',
      };
    }

    if (data.applications !== undefined) {
      updatePayload.applications = sanitizeSubDocs(data.applications, 'application');
    }
    if (data.technologies !== undefined) {
      updatePayload.technologies = sanitizeSubDocs(data.technologies, 'technology');
    }
    if (data.productLineEntries !== undefined) {
      updatePayload.productLineEntries = sanitizeProductLineEntries(data.productLineEntries);
    }
    if (data.isFeatured !== undefined) {
      updatePayload.isFeatured = data.isFeatured === true;
    }
    if (data.industry !== undefined) {
      updatePayload.industry = Array.isArray(data.industry) ? data.industry : [];
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

    if (action === 'delete') {
      const res = await MarketTree.deleteMany({ _id: { $in: idList } });
      invalidate();
      return { modified: res.deletedCount || 0, deleted: res.deletedCount || 0 };
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

// touched 09/18/2026 17:16:41
