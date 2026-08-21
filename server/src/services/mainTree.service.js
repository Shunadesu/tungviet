import mongoose from 'mongoose';
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

const sanitizeMainTreeSubDoc = (list = []) =>
  (Array.isArray(list) ? list : [])
    .filter((s) => s && s.title)
    .map((s) => {
      let linkToMainTree = null;
      if (s.linkToMainTree) {
        const raw = s.linkToMainTree?._id || s.linkToMainTree;
        try { linkToMainTree = raw ? String(raw) : null; }
        catch (_) { linkToMainTree = null; }
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

export const mainTreeService = {
  async getPublic({ mainTree } = {}) {
    const query = { isActive: true };
    if (mainTree) query._id = mainTree;
    const items = await MainTree.find(query)
      .sort({ order: 1, name: 1 })
      .populate({
        path: 'technologies.linkToMainTree',
        select: '_id name nameEn slug',
      })
      .populate({
        path: 'applications.linkToMainTree',
        select: '_id name nameEn slug',
      })
      .lean();
    return items.map((node) => sortSubDocs(node));
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
    return MainTree.findById(id)
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
      technologies: sanitizeMainTreeSubDoc(data.technologies),
      applications: sanitizeMainTreeSubDoc(data.applications),
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
    if (data.technologies !== undefined) {
      update.technologies = sanitizeMainTreeSubDoc(data.technologies);
    }
    if (data.applications !== undefined) {
      update.applications = sanitizeMainTreeSubDoc(data.applications);
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

  async bulk({ action, ids, isActive } = {}) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw AppError.badRequest('ids phai la mot mang khong rong');
    }
    const idList = ids.map(String).filter(Boolean);
    if (idList.length === 0) {
      throw AppError.badRequest('ids phai la mot mang khong rong');
    }

    if (action === 'delete') {
      const res = await MainTree.deleteMany({ _id: { $in: idList } });
      invalidate();
      return { deleted: res.deletedCount || 0 };
    }

    if (action === 'toggleActive') {
      const value = isActive === true;
      const res = await MainTree.updateMany(
        { _id: { $in: idList } },
        { $set: { isActive: value } }
      );
      invalidate();
      return { modified: res.modifiedCount || res.matchedCount || 0, isActive: value };
    }

    throw AppError.badRequest(`Unsupported bulk action: ${action}`);
  },
};

export default mainTreeService;