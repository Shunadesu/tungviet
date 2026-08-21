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
    linkToMainTree: { type: mongoose.Schema.Types.ObjectId, ref: 'MainTree', default: null },
    linkCustomUrl: { type: String, default: '' },
    productEntries: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        applicationIndex: { type: Number, required: true },
      },
    ],
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
    linkCustomUrl: { type: String, default: '' },
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
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false, index: true },
    applications: { type: [applicationSubSchema], default: [] },
    technologies: { type: [technologySubSchema], default: [] },
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
  { timestamps: true }
);

marketTreeSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: 'all',
});
marketTreeSchema.index({ order: 1, title: 1 });

const MarketTree = mongoose.model('MarketTree', marketTreeSchema);

export default MarketTree;
