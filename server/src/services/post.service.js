import mongoose from 'mongoose';
import Post from '../models/Post.js';
import PostCategory from '../models/PostCategory.js';
import { invalidatePublicCache } from '../utils/cache.js';

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');

const POST_CATEGORY_FIELDS = 'name nameEn slug';

const resolveCategoryFilter = async (categoryParam) => {
  if (!categoryParam) return null;
  if (mongoose.Types.ObjectId.isValid(categoryParam)) {
    return { _id: categoryParam };
  }
  const slug = String(categoryParam).toLowerCase().trim();
  const cat = await PostCategory.findOne({ slug }).select('_id').lean();
  return cat ? { _id: cat._id } : { _id: null };
};

const normalizeCategoryInput = async (categoryInput) => {
  if (!categoryInput) return null;
  if (categoryInput instanceof mongoose.Types.ObjectId) return categoryInput;
  if (typeof categoryInput === 'string') {
    if (mongoose.Types.ObjectId.isValid(categoryInput)) {
      return new mongoose.Types.ObjectId(categoryInput);
    }
    const slug = categoryInput.toLowerCase().trim();
    const cat = await PostCategory.findOne({ slug }).select('_id').lean();
    if (!cat) return null;
    return cat._id;
  }
  return null;
};

export const postService = {
  async getPublic({ page = 1, limit = 9, category } = {}) {
    const filter = { isActive: true };
    const catFilter = await resolveCategoryFilter(category);
    if (catFilter) Object.assign(filter, catFilter);

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Post.find(filter)
        .sort({ order: 1, publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('category', POST_CATEGORY_FIELDS)
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
    )
      .populate('category', POST_CATEGORY_FIELDS)
      .lean();
    return doc;
  },

  async getAdmin({ page = 1, limit = 20, category, isActive } = {}) {
    const filter = {};
    const catFilter = await resolveCategoryFilter(category);
    if (catFilter) Object.assign(filter, catFilter);
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Post.find(filter)
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('category', POST_CATEGORY_FIELDS)
        .lean(),
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

    const categoryId = await normalizeCategoryInput(data.category);

    const doc = new Post({
      ...data,
      slug: finalSlug,
      order,
      category: categoryId,
    });
    await doc.save();
    return doc.toObject();
  },

  async update(id, data) {
    if (data.title && !data.slug) {
      data.slug = slugify(data.title);
    }
    if (data.category !== undefined) {
      data.category = await normalizeCategoryInput(data.category);
    }
    const doc = await Post.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
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
    if (category) {
      const catId = mongoose.Types.ObjectId.isValid(category)
        ? new mongoose.Types.ObjectId(category)
        : null;
      if (catId) filter.category = catId;
    }
    return Post.find(filter)
      .sort({ order: 1, publishedAt: -1 })
      .limit(limit)
      .populate('category', POST_CATEGORY_FIELDS)
      .lean();
  },
};
