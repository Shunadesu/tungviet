import MainTree from '../models/MainTree.js';
import { AppError } from '../utils/AppError.js';
import { invalidatePublicCache } from '../utils/cache.js';

const invalidate = () => invalidatePublicCache();

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');

const DEFAULT_MAIN_TREES = [
  {
    name: 'Hóa chất công nghiệp',
    nameEn: 'Industrial Chemicals',
    slug: 'hoa-chat-cong-nghiep',
    description: 'Các sản phẩm nhựa thông, rosin và hóa chất công nghiệp.',
    descriptionEn: 'Rosin, resin and industrial chemical products.',
    order: 0,
  },
  {
    name: 'Sơn & lớp phủ',
    nameEn: 'Coatings',
    slug: 'son-va-lop-phu',
    description: 'Nguyên liệu cho ngành sơn, vecni và lớp phủ công nghiệp.',
    descriptionEn: 'Raw materials for paints, varnishes and industrial coatings.',
    order: 1,
  },
  {
    name: 'Keo & chất kết dính',
    nameEn: 'Adhesives',
    slug: 'keo-va-chat-ket-dinh',
    description: 'Giải pháp keo công nghiệp và chất kết dính chuyên dụng.',
    descriptionEn: 'Industrial adhesive solutions for specialized applications.',
    order: 2,
  },
];

export const mainTreeService = {
  async getPublic({ mainTree } = {}) {
    const query = { isActive: true };
    if (mainTree) query._id = mainTree;
    const items = await MainTree.find(query).sort({ order: 1, name: 1 }).lean();
    return items;
  },

  async getAdmin({ isActive } = {}) {
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === true || isActive === 'true';
    const items = await MainTree.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .lean();
    return items;
  },

  async getById(id) {
    return MainTree.findById(id).lean();
  },

  async create(data) {
    let slug = data.slug || slugify(data.name || '');
    const exists = await MainTree.findOne({ slug }).lean();
    if (exists) slug = `${slug}-${Date.now()}`;

    const maxOrder = await MainTree.findOne().sort({ order: -1 }).lean();
    const order = data.order ?? (maxOrder ? maxOrder.order + 1 : 0);

    const doc = new MainTree({
      name: data.name,
      nameEn: data.nameEn || '',
      slug,
      description: data.description || '',
      descriptionEn: data.descriptionEn || '',
      imageUrl: data.imageUrl || '',
      iconUrl: data.iconUrl || '',
      order,
      isActive: data.isActive !== false,
    });
    await doc.save();
    invalidate();
    return doc.toObject();
  },

  async update(id, data) {
    const update = { ...data };
    if (update.name && !update.slug) {
      update.slug = slugify(update.name);
    }
    const doc = await MainTree.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });
    invalidate();
    return doc?.toObject() || null;
  },

  async remove(id) {
    await MainTree.findByIdAndDelete(id);
    invalidate();
  },

  async reorder(orderList) {
    const ops = orderList.map((item) => ({
      updateOne: {
        filter: { _id: item._id },
        update: { order: item.order },
      },
    }));
    await MainTree.bulkWrite(ops);
    invalidate();
  },

  async seedDefaults() {
    const count = await MainTree.countDocuments();
    if (count > 0) {
      return { skipped: true, total: count };
    }
    const seeded = [];
    for (let i = 0; i < DEFAULT_MAIN_TREES.length; i++) {
      const def = DEFAULT_MAIN_TREES[i];
      const doc = new MainTree({ ...def, order: def.order ?? i, isActive: true });
      await doc.save();
      seeded.push(doc.toObject());
    }
    return { skipped: false, total: seeded.length };
  },
};

export default mainTreeService;