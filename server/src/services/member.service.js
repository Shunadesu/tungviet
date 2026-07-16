import Member from '../models/Member.js';
import { AppError } from '../utils/AppError.js';
import { invalidatePublicCache } from '../utils/cache.js';

export const memberService = {
  async getPublic(locale = 'vi') {
    const members = await Member.find({ isActive: true })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    return members.map((m) => ({
      _id: m._id,
      name: m.name?.[locale] || m.name?.vi || '',
      position: m.position?.[locale] || m.position?.vi || '',
      imageUrl: m.imageUrl || '',
      description: m.description?.[locale] || m.description?.vi || '',
      bio: m.bio?.[locale] || m.bio?.vi || '',
    }));
  },

  async getAdmin() {
    const members = await Member.find({})
      .sort({ order: 1, createdAt: 1 })
      .lean();
    return members;
  },

  async getById(id) {
    const member = await Member.findOne({ _id: id }).lean();
    if (!member) throw AppError.notFound('Không tìm thấy thành viên');
    return member;
  },

  async create(data) {
    const maxOrder = await Member.findOne({}, 'order')
      .sort({ order: -1 })
      .lean();
    const order = typeof data.order === 'number' ? data.order : (maxOrder?.order ?? -1) + 1;

    const member = new Member({
      name: { vi: data.name?.vi || '', en: data.name?.en || '' },
      position: { vi: data.position?.vi || '', en: data.position?.en || '' },
      imageUrl: data.imageUrl || '',
      description: { vi: data.description?.vi || '', en: data.description?.en || '' },
      bio: { vi: data.bio?.vi || '', en: data.bio?.en || '' },
      order,
      isActive: data.isActive !== false,
    });
    await member.save();
    invalidatePublicCache();
    return member;
  },

  async update(id, data) {
    const member = await Member.findById(id);
    if (!member) throw AppError.notFound('Không tìm thấy thành viên');

    if (data.name !== undefined) {
      member.name = { ...member.name.toObject(), ...data.name };
    }
    if (data.position !== undefined) {
      member.position = { ...member.position.toObject(), ...data.position };
    }
    if (data.imageUrl !== undefined) member.imageUrl = data.imageUrl;
    if (data.description !== undefined) {
      member.description = { ...member.description.toObject(), ...data.description };
    }
    if (data.bio !== undefined) {
      member.bio = { ...member.bio.toObject(), ...data.bio };
    }
    if (typeof data.order === 'number') member.order = data.order;
    if (typeof data.isActive === 'boolean') member.isActive = data.isActive;

    await member.save();
    invalidatePublicCache();
    return member;
  },

  async delete(id) {
    const member = await Member.findOne({ _id: id });
    if (!member) throw AppError.notFound('Không tìm thấy thành viên');
    await member.delete();
    invalidatePublicCache();
    return member;
  },

  async reorder(orderedIds) {
    const current = await Member.find({}).lean();
    const map = new Map(current.map((m) => [String(m._id), m]));
    const next = orderedIds
      .map((id) => map.get(String(id)))
      .filter(Boolean)
      .map((m, idx) => ({ ...m, order: idx }));

    await Promise.all(
      next.map((m) =>
        Member.findByIdAndUpdate(m._id, { order: m.order })
      )
    );
    invalidatePublicCache();
    return next;
  },
};
