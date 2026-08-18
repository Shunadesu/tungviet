import MarketTree from '../models/MarketTree.js';
import Product from '../models/Product.js';
import { invalidatePublicCache } from '../utils/cache.js';

const invalidate = () => invalidatePublicCache();

const PRODUCT_PREVIEW_FIELDS =
  'name nameEn imageUrl slug productCode applications';

const APPLICATION_PREVIEW_FIELDS =
  '_id title titleEn description descriptionEn imageUrl';

const sanitizeProductEntries = (entries = []) =>
  (Array.isArray(entries) ? entries : [])
    .map((entry) => {
      const productId =
        entry && (entry.productId?._id || entry.productId)
          ? String(entry.productId?._id || entry.productId)
          : null;
      const rawIndex =
        entry && (entry.applicationIndex ?? entry.applicationIndex === 0)
          ? entry.applicationIndex
          : -1;
      const applicationIndex = Number.isFinite(Number(rawIndex))
        ? Number(rawIndex)
        : -1;
      if (!productId || applicationIndex < 0) return null;
      return { productId, applicationIndex };
    })
    .filter(Boolean);

const sanitizeSubDocs = (list = []) =>
  (Array.isArray(list) ? list : [])
    .filter((s) => s && s.title)
    .map((s) => ({
      _id: s._id,
      title: s.title || '',
      titleEn: s.titleEn || '',
      description: s.description || '',
      descriptionEn: s.descriptionEn || '',
      imageUrl: s.imageUrl || '',
      order: Number.isFinite(s.order) ? s.order : 0,
      isActive: s.isActive !== false,
      productEntries: sanitizeProductEntries(s.productEntries),
    }));

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

const DEFAULT_MARKET_TREES = [
  {
    title: 'Sơn gỗ',
    titleEn: 'Wood Coatings',
    description: 'Sơn và vecni dùng cho gỗ tự nhiên, gỗ công nghiệp.',
    descriptionEn: 'Paints and varnishes for natural and engineered wood.',
    order: 0,
    technologies: [
      {
        title: 'Công nghệ chống thấm nano',
        titleEn: 'Nano Waterproof Technology',
        description: 'Công nghệ nano tạo lớp màng chống thấm trên bề mặt gỗ.',
        descriptionEn: 'Nano technology that creates a waterproof film on wood surfaces.',
        order: 0,
      },
    ],
    applications: [
      {
        title: 'Sơn lót nội thất',
        titleEn: 'Interior Primer',
        description: 'Lớp lót tăng độ bám cho sơn phủ PU/NC trên nội thất gỗ.',
        descriptionEn: 'Primer coat to improve adhesion for PU/NC topcoats on interior wood.',
        order: 0,
      },
    ],
  },
  {
    title: 'Keo công nghiệp',
    titleEn: 'Industrial Adhesives',
    description: 'Các dòng keo dùng trong sản xuất công nghiệp.',
    descriptionEn: 'Adhesive products for industrial manufacturing.',
    order: 1,
    technologies: [
      {
        title: 'Công nghệ kết dính nhanh',
        titleEn: 'Fast-Bond Technology',
        description: 'Công nghệ đông cứng nhanh, rút ngắn thời gian ép.',
        descriptionEn: 'Rapid curing technology that shortens pressing time.',
        order: 0,
      },
    ],
    applications: [
      {
        title: 'Dán gỗ công nghiệp',
        titleEn: 'Engineered Wood Bonding',
        description: 'Ứng dụng kết dính ván MDF, ván dăm, gỗ ghép.',
        descriptionEn: 'Bonding applications for MDF, particle board, and laminated wood.',
        order: 0,
      },
    ],
  },
];

export const marketTreeService = {
  async getPublic({ featuredOnly } = {}) {
    const query = { isActive: true };
    if (featuredOnly) query.isFeatured = true;

    const flat = await MarketTree.find(query)
      .sort({ isFeatured: -1, order: 1, title: 1 })
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
        match: { isActive: true },
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
        path: 'applications.productEntries.productId',
        select: PRODUCT_PREVIEW_FIELDS,
        populate: {
          path: 'applications',
          select: APPLICATION_PREVIEW_FIELDS,
        },
      })
      .lean();
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
      order,
      isActive: data.isActive !== false,
      isFeatured: data.isFeatured === true,
      applications: sanitizeSubDocs(data.applications),
      technologies: sanitizeSubDocs(data.technologies),
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
    if (data.isFeatured !== undefined) {
      updatePayload.isFeatured = data.isFeatured === true;
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

  async seedDefaults() {
    const count = await MarketTree.countDocuments();
    if (count > 0) return { skipped: true, total: count };

    let order = 0;
    for (const def of DEFAULT_MARKET_TREES) {
      await new MarketTree({
        title: def.title,
        titleEn: def.titleEn || '',
        description: def.description || '',
        descriptionEn: def.descriptionEn || '',
        order: def.order ?? order++,
        isActive: true,
        applications: sanitizeSubDocs(def.applications),
        technologies: sanitizeSubDocs(def.technologies),
      }).save();
    }
    return { skipped: false, total: await MarketTree.countDocuments() };
  },
};

export default marketTreeService;
