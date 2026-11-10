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

const PRODUCT_PUBLIC_PROJECTION = '_id productCode name nameEn description descriptionEn imageUrl gallery price priceVisible webStatus targetAudience softeningPoint acidValue color applications attributes tdsUrl isFeatured isNew displayOrder viewCount industries productLines createdAt updatedAt';

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

const normalizeId = (val) => {
  if (!val) return null;
  const raw = val && typeof val === 'object' ? (val._id || val) : val;
  try {
    const str = String(raw);
    return mongoose.Types.ObjectId.isValid(str) ? str : null;
  } catch (_) {
    return null;
  }
};

/**
 * Sanitize product.marketEntries: array of
 *   { marketId, technologyIds: [...], applicationIds: [...] }
 * `technologyIds` and `applicationIds` reference subdoc _ids inside
 * MarketTree.technologies[] and MarketTree.applications[].
 */
export const sanitizeMarketEntries = (list = []) => {
  if (!Array.isArray(list)) return [];
  const out = [];
  for (const entry of list) {
    if (!entry || typeof entry !== 'object') continue;
    const marketId = normalizeId(entry.marketId);
    if (!marketId) continue;
    const techIds = Array.isArray(entry.technologyIds)
      ? entry.technologyIds.map(normalizeId).filter(Boolean)
      : [];
    const appIds = Array.isArray(entry.applicationIds)
      ? entry.applicationIds.map(normalizeId).filter(Boolean)
      : [];
    out.push({
      marketId,
      technologyIds: techIds,
      applicationIds: appIds,
    });
  }
  return out;
};

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

/**
 * Bộ lọc "Điểm làm mềm".
 *
 * `Product.softeningPoint` lưu dưới dạng chuỗi tự do: "127-135", "78", "3-4+".
 * Vì vậy không thể so khớp chuỗi trực tiếp với một khoảng lọc — phải parse ra
 * cặp [min, max] rồi kiểm tra khoảng của sản phẩm có giao với khoảng lọc hay không.
 *
 * Giá trị khoảng lọc hợp lệ (giống bảng `SOFTENING_RANGES` ở client):
 *   "<80", "80-100", "100-120", ">120"
 * Mọi giá trị khác vẫn được hiểu là so khớp chính xác (hành vi cũ).
 */
const SOFTENING_RANGES = {
  '<80': { min: -1e9, max: 80 },
  '80-100': { min: 80, max: 100 },
  '100-120': { min: 100, max: 120 },
  '>120': { min: 120, max: 1e9 },
};

const SOFTENING_NUMBER_REGEX = '[0-9]+(?:\\.[0-9]+)?';

/**
 * Tạo điều kiện `$expr` lọc theo khoảng điểm làm mềm.
 *
 * MongoDB không có kiểu số cho field này nên phải trích số bằng `$regexFindAll`
 * rồi so sánh min/max. Dùng `$reduce` để tính min/max nên tương thích mọi
 * phiên bản MongoDB >= 4.4 (không phụ thuộc toán tử mảng `$min`/`$max`).
 */
const softeningRangeFilter = (min, max) => ({
  $expr: {
    $let: {
      vars: {
        nums: {
          $map: {
            input: {
              $regexFindAll: {
                input: { $ifNull: ['$softeningPoint', ''] },
                regex: SOFTENING_NUMBER_REGEX,
              },
            },
            as: 'n',
            in: { $toDouble: '$$n.match' },
          },
        },
      },
      in: {
        $let: {
          vars: {
            pMin: {
              $reduce: {
                input: '$$nums',
                initialValue: null,
                in: {
                  $cond: [
                    { $eq: ['$$value', null] },
                    '$$this',
                    { $cond: [{ $lt: ['$$this', '$$value'] }, '$$this', '$$value'] },
                  ],
                },
              },
            },
            pMax: {
              $reduce: {
                input: '$$nums',
                initialValue: null,
                in: {
                  $cond: [
                    { $eq: ['$$value', null] },
                    '$$this',
                    { $cond: [{ $gt: ['$$this', '$$value'] }, '$$this', '$$value'] },
                  ],
                },
              },
            },
          },
          in: {
            $and: [
              { $ne: ['$$pMin', null] },
              { $lte: ['$$pMin', max] },
              { $gte: ['$$pMax', min] },
            ],
          },
        },
      },
    },
  },
});

/**
 * Dựng query lọc cho danh sách SKU public.
 *
 * Dùng chung cho `listPublic` (danh sách SKU) và `listPublicProductLines`
 * (gom nhóm theo product line) để hai endpoint luôn áp dụng cùng bộ lọc.
 */
const buildPublicQuery = async ({
  search,
  searchFields = ['name'],
  industries,
  productLine,
  market,
  technology,
  application,
  softeningPoint,
} = {}) => {
  const query = baseActiveQuery();

  if (search) {
    const rx = { $regex: search, $options: 'i' };
    // `searchFields` quy định các field được so khớp từ khoá.
    query.$or = searchFields.map((field) => ({ [field]: rx }));
  }

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

  // Loc san pham theo cong nghe / ung dung (sub-document) cua mot market.
  // `Product.marketEntries` luu technologyIds / applicationIds tro toi
  // _id cua sub-document trong MarketTree.
  const techId = normalizeId(technology);
  const appId = normalizeId(application);
  if (techId || appId) {
    const elemMatch = {};
    if (marketIds.length === 1) {
      elemMatch.marketId = new mongoose.Types.ObjectId(marketIds[0]);
    }
    if (techId) elemMatch.technologyIds = new mongoose.Types.ObjectId(techId);
    if (appId) elemMatch.applicationIds = new mongoose.Types.ObjectId(appId);
    query.marketEntries = { $elemMatch: elemMatch };
  }

  if (softeningPoint && String(softeningPoint).trim()) {
    const raw = String(softeningPoint).trim();
    const range = SOFTENING_RANGES[raw];
    // Khoảng lọc ("<80", "80-100", ...) → so khớp theo khoảng số.
    // Giá trị khác → so khớp chính xác (hành vi cũ, vẫn giữ để tương thích).
    if (range) {
      Object.assign(query, softeningRangeFilter(range.min, range.max));
    } else {
      query.softeningPoint = raw;
    }
  }

  return query;
};

export const productService = {
  async listPublic({
    search,
    sort,
    industries,
    productLine,
    market,
    technology,
    application,
    softeningPoint,
    page = 1,
    limit = 20,
  } = {}) {
    const query = await buildPublicQuery({
      search,
      industries,
      productLine,
      market,
      technology,
      application,
      softeningPoint,
    });

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

  /**
   * Gom SKU theo "sản phẩm chính" (product line / Category).
   *
   * Mỗi nhóm trả về:
   *   - category: thông tin product line (đã populate mainTree)
   *   - skuCount: tổng số SKU đang publish thuộc nhóm (không tính bộ lọc)
   *   - matchingSkuCount: số SKU khớp bộ lọc hiện tại
   *
   * Nhóm chỉ được giữ lại khi `matchingSkuCount > 0` (trừ khi không có bộ lọc
   * nào thì giữ tất cả nhóm có SKU).
   */
  async listPublicProductLines({
    search,
    sort,
    industries,
    mainTree,
    market,
    technology,
    application,
    softeningPoint,
    productLine,
    page = 1,
    limit = 12,
  } = {}) {
    const filteredQuery = await buildPublicQuery({
      search,
      // Từ khoá khớp theo tên SKU (vi/en) hoặc mã SKU (productCode).
      searchFields: ['name', 'nameEn', 'productCode'],
      industries,
      market,
      technology,
      application,
      softeningPoint,
    });

    // Nhóm nào có SKU khớp bộ lọc (chỉ SKU publish + active).
    const matchingAgg = await Product.aggregate([
      { $match: filteredQuery },
      { $unwind: '$productLines' },
      {
        $group: {
          _id: '$productLines',
          matchingSkuCount: { $sum: 1 },
          newestAt: { $max: '$createdAt' },
          maxViews: { $max: '$viewCount' },
        },
      },
    ]);

    // Tổng số SKU publish của từng nhóm (không áp bộ lọc).
    const totalAgg = await Product.aggregate([
      { $match: baseActiveQuery() },
      { $unwind: '$productLines' },
      {
        $group: {
          _id: '$productLines',
          skuCount: { $sum: 1 },
          newestAt: { $max: '$createdAt' },
          maxViews: { $max: '$viewCount' },
        },
      },
    ]);

    const matchingMap = new Map(
      matchingAgg.map((g) => [String(g._id), g])
    );
    const totalMap = new Map(totalAgg.map((g) => [String(g._id), g]));

    // Tên product line khớp từ khoá → nhóm đó hiển thị toàn bộ SKU của nhóm.
    let nameMatchedIds = [];
    if (search && String(search).trim()) {
      const rx = { $regex: String(search).trim(), $options: 'i' };
      const cats = await Category.find({
        isActive: true,
        $or: [{ name: rx }, { nameEn: rx }],
      })
        .select('_id')
        .lean();
      nameMatchedIds = cats.map((c) => String(c._id));
    }

    const lineIds = Array.from(
      new Set([
        ...matchingMap.keys(),
        ...nameMatchedIds,
      ])
    ).filter((id) => totalMap.has(id) || matchingMap.has(id));

    if (lineIds.length === 0) {
      return { items: [], pagination: buildPagination(page, limit, 0) };
    }

    // mainTree lọc theo ngành hàng của chính product line.
    const categoryQuery = {
      _id: { $in: lineIds.map((id) => new mongoose.Types.ObjectId(id)) },
      isActive: true,
    };
    if (mainTree) {
      const mtId = await resolveIdOrSlug(mainTree, MainTree);
      if (mtId) categoryQuery.mainTree = mtId;
    }
    // Deep-link ?category= → chỉ giữ đúng product line đó.
    if (productLine) {
      const catIds = await resolveIdList(productLine, Category);
      if (catIds.length === 0) {
        return { items: [], pagination: buildPagination(page, limit, 0) };
      }
      categoryQuery._id = {
        $in: catIds.map((id) => new mongoose.Types.ObjectId(id)),
      };
    }

    const categories = await Category.find(categoryQuery)
      .populate('mainTree', 'name nameEn slug')
      .lean();

    const hasFilters = Boolean(
      search ||
        industries ||
        market ||
        technology ||
        application ||
        softeningPoint ||
        mainTree ||
        productLine
    );

    const groups = categories
      .map((cat) => {
        const id = String(cat._id);
        const matching = matchingMap.get(id);
        const total = totalMap.get(id);
        const matchingSkuCount = matching?.matchingSkuCount ?? 0;
        const skuCount = total?.skuCount ?? 0;
        // Nhóm khớp theo *tên product line* thì lấy toàn bộ SKU của nhóm.
        const effectiveMatching = nameMatchedIds.includes(id)
          ? skuCount
          : matchingSkuCount;
        return {
          category: cat,
          skuCount,
          matchingSkuCount: effectiveMatching,
          newestAt: matching?.newestAt || total?.newestAt || cat.createdAt || null,
          maxViews: matching?.maxViews ?? total?.maxViews ?? 0,
        };
      })
      .filter((g) => (hasFilters ? g.matchingSkuCount > 0 : g.skuCount > 0));

    // Sắp xếp theo nhóm.
    const nameOf = (cat) => `${cat.name || ''} ${cat.nameEn || ''}`.trim().toLowerCase();
    switch (sort) {
      case 'name_asc':
        groups.sort((a, b) => nameOf(a.category).localeCompare(nameOf(b.category)));
        break;
      case 'name_desc':
        groups.sort((a, b) => nameOf(b.category).localeCompare(nameOf(a.category)));
        break;
      case 'newest':
        groups.sort(
          (a, b) => new Date(b.newestAt || 0).getTime() - new Date(a.newestAt || 0).getTime()
        );
        break;
      case 'popularity':
        groups.sort((a, b) => b.maxViews - a.maxViews);
        break;
      default:
        groups.sort((a, b) => {
          const orderDiff = (a.category.order || 0) - (b.category.order || 0);
          if (orderDiff !== 0) return orderDiff;
          return nameOf(a.category).localeCompare(nameOf(b.category));
        });
    }

    const total = groups.length;
    const skip = (page - 1) * limit;
    const items = groups.slice(skip, skip + limit);
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
      industries = [],
      productLines = [],
      marketIds = [],
      marketEntries = [],
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

    const sanitizedMarketEntries = sanitizeMarketEntries(marketEntries);

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

    const sanitizedApplications = sanitizeApplications(applications);

    const product = new Product({
      productCode: productCode ? productCode.toUpperCase() : '',
      name,
      nameEn,
      description,
      descriptionEn,
      imageUrl,
      gallery: sanitizedGallery,
      industries: sanitizedIndustries,
      productLines: sanitizedProductLines,
      marketIds: sanitizedMarketIds,
      marketEntries: sanitizedMarketEntries,
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
      'gallery', 'industries', 'productLines', 'marketIds', 'marketEntries',
      'price', 'priceVisible',
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
        } else if (field === 'marketEntries') {
          updateData.marketEntries = sanitizeMarketEntries(payload.marketEntries);
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