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

export const postService = {
  async getPublic({ page = 1, limit = 9, category } = {}) {
    const filter = { isActive: true };
    if (category) filter.category = category;

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Post.find(filter)
        .sort({ order: 1, publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments(filter),
    ]);

    return { items, total, page, pages: Math.ceil(total / limit) };
  },

  async getPublicBySlug(slug) {
    const doc = await Post.findOneAndUpdate(
      { slug, isActive: true },
      { $inc: { viewCount: 1 } },
      { new: true }
    ).lean();
    return doc;
  },

  async getAdmin({ page = 1, limit = 20, category, isActive } = {}) {
    const filter = {};
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Post.find(filter).sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      Post.countDocuments(filter),
    ]);

    return { items, total, page, pages: Math.ceil(total / limit) };
  },

  async create(data) {
    const slug = data.slug || slugify(data.title);
    const count = await Post.countDocuments({ slug });
    const finalSlug = count > 0 ? `${slug}-${Date.now()}` : slug;
    const maxOrder = await Post.findOne().sort({ order: -1 }).lean();
    const order = maxOrder ? maxOrder.order + 1 : 0;

    const doc = new Post({ ...data, slug: finalSlug, order });
    await doc.save();
    return doc.toObject();
  },

  async update(id, data) {
    if (data.title && !data.slug) {
      data.slug = slugify(data.title);
    }
    const doc = await Post.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    invalidatePublicCache();
    return doc?.toObject() || null;
  },

  async remove(id) {
    await Post.findByIdAndDelete(id);
    invalidatePublicCache();
  },

  async reorder(orderList) {
    const ops = orderList.map((item) => ({
      updateOne: { filter: { _id: item._id }, update: { order: item.order } },
    }));
    await Post.bulkWrite(ops);
    invalidatePublicCache();
  },

  async getRelated(postId, category, limit = 3) {
    const filter = { _id: { $ne: postId }, isActive: true };
    if (category) filter.category = category;
    return Post.find(filter).sort({ order: 1, publishedAt: -1 }).limit(limit).lean();
  },
};
