import Location from '../models/Location.js';
import { AppError } from '../utils/AppError.js';
import { invalidatePublicCache } from '../utils/cache.js';

export const locationService = {
  async getPublic(locale = 'vi') {
    const locations = await Location.find({ isActive: true })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    return locations.map((l) => ({
      _id: l._id,
      name: l.name?.[locale] || l.name?.vi || '',
      address: l.address?.[locale] || l.address?.vi || '',
      description: l.description?.[locale] || l.description?.vi || '',
      mapEmbed: l.mapEmbed || '',
      phone: l.phone || '',
      email: l.email || '',
    }));
  },

  async getAdmin() {
    const locations = await Location.find({})
      .sort({ order: 1, createdAt: 1 })
      .lean();
    return locations;
  },

  async getById(id) {
    const location = await Location.findOne({ _id: id }).lean();
    if (!location) throw AppError.notFound('Khong tim thay dia diem');
    return location;
  },

  async create(data) {
    const maxOrder = await Location.findOne({}, 'order').sort({ order: -1 }).lean();
    const order = typeof data.order === 'number' ? data.order : (maxOrder?.order ?? -1) + 1;

    const location = new Location({
      name: { vi: data.name?.vi || '', en: data.name?.en || '' },
      address: { vi: data.address?.vi || '', en: data.address?.en || '' },
      description: { vi: data.description?.vi || '', en: data.description?.en || '' },
      mapEmbed: data.mapEmbed || '',
      phone: data.phone || '',
      email: data.email || '',
      order,
      isActive: data.isActive !== false,
    });
    await location.save();
    invalidatePublicCache();
    return location;
  },

  async update(id, data) {
    const location = await Location.findById(id);
    if (!location) throw AppError.notFound('Khong tim thay dia diem');

    if (data.name !== undefined) {
      location.name = { ...location.name.toObject(), ...data.name };
    }
    if (data.address !== undefined) {
      location.address = { ...location.address.toObject(), ...data.address };
    }
    if (data.description !== undefined) {
      location.description = { ...location.description.toObject(), ...data.description };
    }
    if (data.mapEmbed !== undefined) location.mapEmbed = data.mapEmbed;
    if (data.phone !== undefined) location.phone = data.phone;
    if (data.email !== undefined) location.email = data.email;
    if (typeof data.order === 'number') location.order = data.order;
    if (typeof data.isActive === 'boolean') location.isActive = data.isActive;

    await location.save();
    invalidatePublicCache();
    return location;
  },

  async delete(id) {
    const location = await Location.findOne({ _id: id });
    if (!location) throw AppError.notFound('Khong tim thay dia diem');
    await location.delete();
    invalidatePublicCache();
    return location;
  },

  async reorder(orderedIds) {
    const current = await Location.find({}).lean();
    const map = new Map(current.map((l) => [String(l._id), l]));
    const next = orderedIds
      .map((id) => map.get(String(id)))
      .filter(Boolean)
      .map((l, idx) => ({ ...l, order: idx }));

    await Promise.all(
      next.map((l) => Location.findByIdAndUpdate(l._id, { order: l.order }))
    );
    invalidatePublicCache();
    return next;
  },
};
