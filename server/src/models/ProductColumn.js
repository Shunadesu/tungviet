import mongoose from 'mongoose';
import mongooseDelete from 'mongoose-delete';

const KEY_PATTERN = /^(?:[a-z0-9_]{2,30}|softeningPoint|acidValue|color)$/;
const LEGACY_KEYS = new Set(['softeningPoint', 'acidValue', 'color']);
const isValidKey = (value) => KEY_PATTERN.test(value) || LEGACY_KEYS.has(value);

const productColumnSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      set: (value) => {
        const key = String(value || '').trim();
        return LEGACY_KEYS.has(key) ? key : key.toLowerCase();
      },
      validate: {
        validator: isValidKey,
        message: 'key chỉ gồm chữ thường, số và dấu gạch dưới (2-30 ký tự)',
      },
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    nameEn: {
      type: String,
      default: '',
      trim: true,
    },
    type: {
      type: String,
      default: 'text',
      enum: ['text'],
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

productColumnSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: 'all',
});

productColumnSchema.index({ isActive: 1, order: 1 });

productColumnSchema.statics.KEY_PATTERN = KEY_PATTERN;

const ProductColumn = mongoose.model('ProductColumn', productColumnSchema);
export const PRODUCT_COLUMN_KEY_PATTERN = KEY_PATTERN;
export default ProductColumn;