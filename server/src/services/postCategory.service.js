import PostCategory from '../models/PostCategory.js';
import Post from '../models/Post.js';
import { invalidatePublicCache } from '../utils/cache.js';

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');

const DEFAULT_CATEGORIES = [
  { name: 'Tin công nghệ', nameEn: 'Technology', slug: 'tin-cong-nghe' },
  { name: 'Hướng dẫn sử dụng', nameEn: 'Usage guides', slug: 'huong-dan-su-dung' },
  { name: 'Tin khuyến mãi', nameEn: 'Promotions', slug: 'tin-khuyen-mai' },
  { name: 'Tin tư vấn', nameEn: 'Consultations', slug: 'tin-tu-van' },
  { name: 'Chia sẻ', nameEn: 'Insights', slug: 'chia-se' },
];

export const postCategoryService = {
  async getPublic() {
    const items = await PostCategory.find({ isActive: true })
      .sort({ order: 1, name: 1 })
      .lean();
    return items;
  },

  async getAdmin({ isActive } = {}) {
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === true || isActive === 'true';
    const items = await PostCategory.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .lean();
    return items;
  },

  async getById(id) {
    return PostCategory.findById(id).lean();
  },

  async create(data) {
    let slug = data.slug || slugify(data.name || '');
    const exists = await PostCategory.findOne({ slug }).lean();
    if (exists) slug = `${slug}-${Date.now()}`;

    const maxOrder = await PostCategory.findOne().sort({ order: -1 }).lean();
    const order = maxOrder ? maxOrder.order + 1 : 0;

    const doc = new PostCategory({
      name: data.name,
      nameEn: data.nameEn || '',
      slug,
      description: data.description || '',
      descriptionEn: data.descriptionEn || '',
      imageUrl: data.imageUrl || '',
      order: data.order ?? order,
      isActive: data.isActive !== false,
    });
    await doc.save();
    invalidatePublicCache();
    return doc.toObject();
  },

  async update(id, data) {
    const update = { ...data };
    if (update.name && !update.slug) {
      update.slug = slugify(update.name);
    }
    const doc = await PostCategory.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });
    invalidatePublicCache();
    return doc?.toObject() || null;
  },

  async remove(id) {
    await PostCategory.findByIdAndDelete(id);
    invalidatePublicCache();
  },

  async reorder(orderList) {
    const ops = orderList.map((item) => ({
      updateOne: {
        filter: { _id: item._id },
        update: { order: item.order },
      },
    }));
    await PostCategory.bulkWrite(ops);
    invalidatePublicCache();
  },

  async seedDefaults() {
    const count = await PostCategory.countDocuments();
    if (count > 0) {
      return { skipped: true, total: count };
    }
    const seeded = [];
    for (let i = 0; i < DEFAULT_CATEGORIES.length; i++) {
      const def = DEFAULT_CATEGORIES[i];
      const doc = new PostCategory({ ...def, order: i, isActive: true });
      await doc.save();
      seeded.push(doc.toObject());
    }
    await migrateExistingPosts(seeded);
    return { skipped: false, total: seeded.length };
  },
};

const migrateExistingPosts = async (categories) => {
  // Map Post.category (string cũ) sang ObjectId của PostCategory mới tạo.
  // Match theo name (lowercase, có/không dấu) hoặc slug.
  const removeDiacritics = (s) =>
    s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  const byNormName = new Map();
  for (const cat of categories) {
    byNormName.set(removeDiacritics(cat.name), cat._id);
    if (cat.nameEn) byNormName.set(removeDiacritics(cat.nameEn), cat._id);
  }

  const oldPosts = await Post.find({ category: { $type: 'string' } }).lean();
  for (const p of oldPosts) {
    if (typeof p.category !== 'string') continue;
    const matchedId = byNormName.get(removeDiacritics(p.category));
    if (matchedId) {
      await Post.updateOne({ _id: p._id }, { $set: { category: matchedId } });
    } else {
      await Post.updateOne({ _id: p._id }, { $set: { category: null } });
    }
  }
};

export default postCategoryService;
