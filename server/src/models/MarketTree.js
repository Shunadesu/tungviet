import mongoose from 'mongoose';
import mongooseDelete from 'mongoose-delete';

const applicationSubSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    titleEn: { type: String, default: '', trim: true },
    description: { type: String, default: '' },
    descriptionEn: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    linkToMainTree: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MainTree' }],
      default: [],
    },
    productLineEntries: [
      {
        productLineId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Category',
          required: true,
        },
      },
    ],
    productEntries: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
      },
    ],
  },
  { _id: true }
);

const specificationSubSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true },
    value: { type: String, default: '' },
    valueEn: { type: String, default: '' },
    unit: { type: String, default: '', trim: true },
    order: { type: Number, default: 0 },
  },
  { _id: true }
);

const technologySubSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    titleEn: { type: String, default: '', trim: true },
    description: { type: String, default: '' },
    descriptionEn: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    linkToMainTree: { type: mongoose.Schema.Types.ObjectId, ref: 'MainTree', default: null },
    specifications: { type: [specificationSubSchema], default: [] },
    applications: { type: [applicationSubSchema], default: [] },
  },
  { _id: true }
);

const marketTreeSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    titleEn: { type: String, default: '', trim: true },
    description: { type: String, default: '' },
    descriptionEn: { type: String, default: '' },
    introductions: {
      vi: { type: String, default: '' },
      en: { type: String, default: '' },
    },
    imageUrl: { type: String, default: '' },
    order: { type: Number, default: 0 },
    industry: {
      type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MainTree',
      }],
      default: [],
      index: true,
    },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false, index: true },
    technologies: { type: [technologySubSchema], default: [] },
    applications: { type: [applicationSubSchema], default: [] },
    productLineEntries: [
      {
        productLineId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Category',
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

marketTreeSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: 'all',
});
marketTreeSchema.index({ order: 1, title: 1 });

const MarketTree = mongoose.model('MarketTree', marketTreeSchema);

export default MarketTree;
