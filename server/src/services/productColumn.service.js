import ProductColumn, { PRODUCT_COLUMN_KEY_PATTERN } from '../models/ProductColumn.js';
import Product from '../models/Product.js';
import { AppError } from '../utils/AppError.js';
import {
  invalidatePublicCache,
  invalidateProductColumnsCache,
} from '../utils/cache.js';

const LEGACY_KEYS = new Set(['softeningPoint', 'acidValue', 'color']);

const normalizeKey = (raw) => {
  if (raw === undefined || raw === null) return '';
  const value = String(raw).trim();
  return LEGACY_KEYS.has(value) ? value : value.toLowerCase();
};

const slugify = (input) => {
  const base = String(input || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return base.slice(0, 30);
};

const ensureValidKey = (raw) => {
  const key = normalizeKey(raw);
  if (!key) {
    throw AppError.badRequest('key không được để trống', 'INVALID_KEY');
  }
  if (!PRODUCT_COLUMN_KEY_PATTERN.test(key)) {
    throw AppError.badRequest(
      'key chỉ gồm chữ thường, số và dấu gạch dưới (2-30 ký tự)',
      'INVALID_KEY'
    );
  }
  return key;
};

export const productColumnService = {
  async list({ includeInactive = false } = {}) {
    const filter = includeInactive ? {} : { isActive: true };
    const items = await ProductColumn.find(filter)
      .sort({ order: 1, createdAt: 1 })
      .lean();
    return items;
  },

  async listAdmin() {
    const query = ProductColumn.findWithDeleted
      ? ProductColumn.findWithDeleted({})
      : ProductColumn.find({});
    const items = await query.sort({ order: 1, createdAt: 1 }).lean();
    return items;
  },

  async getById(id) {
    const item = await (ProductColumn.findWithDeleted
      ? ProductColumn.findWithDeleted({ _id: id })
      : ProductColumn.findOne({ _id: id }))
      .lean();
    if (!item) throw AppError.notFound('Cột thuộc tính không tồn tại');
    return item;
  },

  async create(payload) {
    const name = String(payload?.name || '').trim();
    if (!name) {
      throw AppError.badRequest('Tên cột (VI) là bắt buộc', 'INVALID_NAME');
    }
    let key = normalizeKey(payload?.key);
    if (!key) key = slugify(name);
    ensureValidKey(key);

    const existing = await (ProductColumn.findWithDeleted
      ? ProductColumn.findWithDeleted({ key })
      : ProductColumn.findOne({ key })).lean();
    if (existing) {
      throw AppError.conflict(`Key "${key}" đã tồn tại`, 'DUPLICATE_KEY');
    }

    const orderRaw = payload?.order;
    const order =
      orderRaw === undefined || orderRaw === null || orderRaw === ''
        ? await ProductColumn.countDocuments({})
        : Number(orderRaw);

    const col = new ProductColumn({
      key,
      name,
      nameEn: String(payload?.nameEn || '').trim(),
      type: 'text',
      order,
      isActive: payload?.isActive !== false,
    });
    await col.save();
    invalidateProductColumnsCache();
    invalidatePublicCache();
    return col.toObject();
  },

  async update(id, payload) {
    const col = await ProductColumn.findOne({ _id: id });
    if (!col) throw AppError.notFound('Cột thuộc tính không tồn tại');

    if (payload?.name !== undefined) {
      const name = String(payload.name || '').trim();
      if (!name) {
        throw AppError.badRequest('Tên cột (VI) là bắt buộc', 'INVALID_NAME');
      }
      col.name = name;
    }
    if (payload?.nameEn !== undefined) {
      col.nameEn = String(payload.nameEn || '').trim();
    }
    if (payload?.order !== undefined && payload?.order !== null) {
      col.order = Number(payload.order);
    }
    if (payload?.isActive !== undefined) {
      col.isActive = Boolean(payload.isActive);
    }

    let oldKey = col.key;
    let keyChanged = false;
    if (payload?.key !== undefined && payload?.key !== null && payload?.key !== '') {
      const newKey = ensureValidKey(payload.key);
      if (newKey !== col.key) {
        const existing = await (ProductColumn.findWithDeleted
          ? ProductColumn.findWithDeleted({ key: newKey })
          : ProductColumn.findOne({ key: newKey })).lean();
        if (existing && String(existing._id) !== String(col._id)) {
          throw AppError.conflict(`Key "${newKey}" đã tồn tại`, 'DUPLICATE_KEY');
        }
        oldKey = col.key;
        col.key = newKey;
        keyChanged = true;
      }
    }

    await col.save();

    if (keyChanged) {
      await Product.updateMany(
        { [`attributes.${oldKey}`]: { $exists: true } },
        [
          {
            $set: {
              attributes: {
                $arrayToObject: {
                  $map: {
                    input: { $objectToArray: { $ifNull: ['$attributes', {}] } },
                    as: 'kv',
                    in: {
                      k: {
                        $cond: [{ $eq: ['$$kv.k', oldKey] }, newKey, '$$kv.k'],
                      },
                      v: '$$kv.v',
                    },
                  },
                },
              },
            },
          },
        ]
      );
    }

    invalidateProductColumnsCache();
    invalidatePublicCache();
    return col.toObject();
  },

  async delete(id) {
    const col = await ProductColumn.findOne({ _id: id });
    if (!col) throw AppError.notFound('Cột thuộc tính không tồn tại');
    const removedKey = col.key;
    await col.delete();

    await Product.updateMany(
      {},
      [
        {
          $set: {
            attributes: {
              $arrayToObject: {
                $filter: {
                  input: { $objectToArray: { $ifNull: ['$attributes', {}] } },
                  as: 'kv',
                  cond: { $ne: ['$$kv.k', removedKey] },
                },
              },
            },
          },
        },
      ]
    );

    invalidateProductColumnsCache();
    invalidatePublicCache();
    return { removedKey };
  },

  async restore(id) {
    const col = await ProductColumn.findOneDeleted({ _id: id });
    if (!col) {
      throw AppError.notFound('Cột thuộc tính không tồn tại trong thùng rác');
    }
    await col.restore();
    invalidateProductColumnsCache();
    invalidatePublicCache();
    return col.toObject();
  },

  async reorder(orderArray) {
    if (!Array.isArray(orderArray)) {
      throw AppError.badRequest('order phải là một mảng id', 'INVALID_ORDER');
    }
    await Promise.all(
      orderArray.map((id, idx) =>
        ProductColumn.findByIdAndUpdate(id, { order: idx }, { new: true })
      )
    );
    invalidateProductColumnsCache();
    invalidatePublicCache();
    return this.listAdmin();
  },

  async listActivePublic() {
    const items = await ProductColumn.find({ isActive: true })
      .select('_id key name nameEn order type')
      .sort({ order: 1, createdAt: 1 })
      .lean();
    return items;
  },

  async seedDefaults() {
    const existing = await (ProductColumn.findWithDeleted
      ? ProductColumn.findWithDeleted({}).select('_id').lean()
      : ProductColumn.find({}).select('_id').lean());
    const count = existing.length;
    if (count > 0) return { skipped: true, total: count };

    const defaults = [
      {
        key: 'softeningPoint',
        name: 'Điểm làm mềm',
        nameEn: 'Softening Point',
        order: 1,
        isActive: true,
      },
      {
        key: 'acidValue',
        name: 'Chỉ số axit',
        nameEn: 'Acid Value',
        order: 2,
        isActive: true,
      },
      {
        key: 'color',
        name: 'Màu sắc',
        nameEn: 'Color',
        order: 3,
        isActive: true,
      },
    ];

    await ProductColumn.insertMany(defaults);
    invalidateProductColumnsCache();
    return { skipped: false, total: defaults.length };
  },
};

export default productColumnService;