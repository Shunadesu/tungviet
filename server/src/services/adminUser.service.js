import mongoose from 'mongoose';
import User from '../models/User.js';
import QuoteSubmission from '../models/QuoteSubmission.js';
import TdsDownload from '../models/TdsDownload.js';
import { AppError } from '../utils/AppError.js';

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Đếm báo giá và lượt TDS theo lô cho danh sách user (2 aggregation, không N+1).
const countByUser = async (Model, userIds) => {
  if (userIds.length === 0) return new Map();
  const rows = await Model.aggregate([
    { $match: { userId: { $in: userIds } } },
    { $group: { _id: '$userId', count: { $sum: 1 } } },
  ]);
  return new Map(rows.map((r) => [String(r._id), r.count]));
};

export const adminUserService = {
  async list({ page = 1, limit = 20, search = '', isActive } = {}) {
    const filter = { role: 'user' };
    if (isActive === 'true' || isActive === 'false') filter.isActive = isActive === 'true';
    const q = String(search || '').trim();
    if (q) {
      const rx = new RegExp(escapeRegex(q.slice(0, 100)), 'i');
      filter.$or = [{ name: rx }, { email: rx }, { phone: rx }, { company: rx }];
    }

    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const safePage = Math.max(Number(page) || 1, 1);

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((safePage - 1) * safeLimit)
        .limit(safeLimit)
        .lean(),
      User.countDocuments(filter),
    ]);

    const ids = users.map((u) => u._id);
    const [quoteMap, tdsMap] = await Promise.all([
      countByUser(QuoteSubmission, ids),
      countByUser(TdsDownload, ids),
    ]);

    const items = users.map((u) => ({
      ...u,
      quoteCount: quoteMap.get(String(u._id)) || 0,
      tdsCount: tdsMap.get(String(u._id)) || 0,
    }));

    return { items, total, page: safePage, limit: safeLimit };
  },

  async getDetail(id) {
    if (!mongoose.isValidObjectId(id)) throw AppError.badRequest('ID không hợp lệ', 'INVALID_ID');
    const user = await User.findById(id).select('-password').lean();
    if (!user) throw AppError.notFound('Người dùng không tồn tại');

    const [quotes, downloads, quoteCount, tdsCount] = await Promise.all([
      QuoteSubmission.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .limit(100)
        .select('name email phone company message status productType market items createdAt')
        .lean(),
      TdsDownload.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .limit(200)
        .populate('productId', 'name productCode')
        .lean(),
      QuoteSubmission.countDocuments({ userId: user._id }),
      TdsDownload.countDocuments({ userId: user._id }),
    ]);

    return {
      user,
      quoteCount,
      tdsCount,
      quotes,
      tdsDownloads: downloads.map((d) => ({
        _id: d._id,
        createdAt: d.createdAt,
        product: d.productId
          ? { _id: d.productId._id, name: d.productId.name, productCode: d.productId.productCode }
          : null,
      })),
    };
  },
};
