import MarketTree from '../models/MarketTree.js';
import { invalidatePublicCache } from '../utils/cache.js';

const invalidate = () => invalidatePublicCache();

const DEFAULT_MARKET_TREES = [
  // For "Sơn & lớp phủ"
  {
    mainTreeSlug: 'son-va-lop-phu',
    parentTitle: null,
    title: 'Sơn gỗ',
    titleEn: 'Wood Coatings',
    description: 'Sơn và vecni dùng cho gỗ tự nhiên, gỗ công nghiệp.',
    descriptionEn: 'Paints and varnishes for natural and engineered wood.',
    order: 0,
    children: [
      { title: 'Sơn PU', titleEn: 'PU Coatings', order: 0 },
      { title: 'Sơn NC', titleEn: 'NC Coatings', order: 1 },
    ],
  },
  // For "Keo & chất kết dính"
  {
    mainTreeSlug: 'keo-va-chat-ket-dinh',
    parentTitle: null,
    title: 'Keo công nghiệp',
    titleEn: 'Industrial Adhesives',
    description: 'Các dòng keo dùng trong sản xuất công nghiệp.',
    descriptionEn: 'Adhesive products for industrial manufacturing.',
    order: 0,
    children: [
      { title: 'Keo dán gỗ', titleEn: 'Wood Glue', order: 0 },
      { title: 'Keo công nghiệp', titleEn: 'Industrial Glue', order: 1 },
    ],
  },
];

export const marketTreeService = {
  async getPublic({ mainTree } = {}) {
    const query = { isActive: true };
    if (mainTree) query.mainTree = mainTree;
    const flat = await MarketTree.find(query)
      .sort({ order: 1, title: 1 })
      .lean();

    // Build nested tree: parents with .children[]
    const parents = flat.filter((n) => !n.parent);
    const childMap = new Map();
    for (const node of flat) {
      if (node.parent) {
        const parentId = String(node.parent);
        if (!childMap.has(parentId)) childMap.set(parentId, []);
        childMap.get(parentId).push(node);
      }
    }
    return parents.map((p) => ({
      ...p,
      children: childMap.get(String(p._id)) || [],
    }));
  },

  async getAdmin({ mainTree } = {}) {
    const filter = {};
    if (mainTree) filter.mainTree = mainTree;
    return MarketTree.find(filter)
      .sort({ mainTree: 1, parent: 1, order: 1, title: 1 })
      .lean();
  },

  async getById(id) {
    return MarketTree.findById(id).lean();
  },

  async create(data) {
    const maxOrder = await MarketTree.findOne({ mainTree: data.mainTree }).sort({ order: -1 }).lean();
    const order = data.order ?? (maxOrder ? maxOrder.order + 1 : 0);
    const doc = new MarketTree({
      mainTree: data.mainTree || null,
      parent: data.parent || null,
      title: data.title,
      titleEn: data.titleEn || '',
      description: data.description || '',
      descriptionEn: data.descriptionEn || '',
      imageUrl: data.imageUrl || '',
      order,
      isActive: data.isActive !== false,
    });
    await doc.save();
    invalidate();
    return doc.toObject();
  },

  async update(id, data) {
    const doc = await MarketTree.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    invalidate();
    return doc?.toObject() || null;
  },

  async remove(id) {
    // Remove children too
    await MarketTree.deleteMany({ parent: id });
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

  async seedDefaults(mainTrees = []) {
    const count = await MarketTree.countDocuments();
    if (count > 0) return { skipped: true, total: count };

    const MainTreeModule = await import('../models/MainTree.js');
    const trees = mainTrees.length > 0 ? mainTrees : await MainTreeModule.default.find().lean();
    const bySlug = new Map(trees.map((t) => [t.slug, t]));

    let order = 0;
    for (const def of DEFAULT_MARKET_TREES) {
      const mt = bySlug.get(def.mainTreeSlug);
      if (!mt) continue;
      const parentDoc = new MarketTree({
        mainTree: mt._id,
        parent: null,
        title: def.title,
        titleEn: def.titleEn || '',
        description: def.description || '',
        descriptionEn: def.descriptionEn || '',
        order: def.order ?? order++,
        isActive: true,
      });
      await parentDoc.save();

      let childOrder = 0;
      for (const child of def.children || []) {
        await new MarketTree({
          mainTree: mt._id,
          parent: parentDoc._id,
          title: child.title,
          titleEn: child.titleEn || '',
          description: child.description || '',
          descriptionEn: child.descriptionEn || '',
          order: child.order ?? childOrder++,
          isActive: true,
        }).save();
      }
    }
    return { skipped: false, total: await MarketTree.countDocuments() };
  },
};

export default marketTreeService;