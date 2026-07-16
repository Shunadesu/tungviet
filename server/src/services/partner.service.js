import Partner from '../models/Partner.js';
import { invalidatePublicCache } from '../utils/cache.js';

export const partnerService = {
  async getPublic(type) {
    const filter = { isActive: true };
    if (type) filter.type = type;
    const items = await Partner.find(filter).sort({ order: 1, createdAt: 1 }).lean();
    return items;
  },

  async getAdmin(type) {
    const filter = type ? { type } : {};
    const items = await Partner.find(filter).sort({ order: 1, createdAt: 1 }).lean();
    return items;
  },

  async create(data) {
    const maxOrder = await Partner.findOne({ type: data.type }).sort({ order: -1 }).lean();
    const order = maxOrder ? maxOrder.order + 1 : 0;
    const doc = new Partner({ ...data, order });
    await doc.save();
    return doc.toObject();
  },

  async update(id, data) {
    const doc = await Partner.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    return doc?.toObject() || null;
  },

  async remove(id) {
    await Partner.findByIdAndDelete(id);
  },

  async reorder(orderList) {
    const ops = orderList.map((item) => ({
      updateOne: { filter: { _id: item._id }, update: { order: item.order } },
    }));
    await Partner.bulkWrite(ops);
    invalidatePublicCache();
  },
};
