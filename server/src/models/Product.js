import mongoose from 'mongoose';
import mongooseDelete from 'mongoose-delete';

const productApplicationSubSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    titleEn: { type: String, default: '', trim: true },
    description: { type: String, default: '' },
    descriptionEn: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { _id: true }
);

const productImageSubSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    alt: { type: String, default: '' },
    altEn: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema({
  productCode: {
    type: String,
    default: '',
    trim: true,
    uppercase: true,
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  nameEn: {
    type: String,
    default: '',
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  descriptionEn: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: ''
  },
  industries: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MainTree',
  }],
  productLines: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  }],
  marketIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MarketTree',
  }],
  // For each chosen market, which of that market's technologies and applications
  // this product is associated with. `technologyIds` reference MarketTree.technologies._id,
  // `applicationIds` reference MarketTree.applications._id.
  marketEntries: [
    {
      marketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MarketTree',
        required: true,
      },
      technologyIds: [{
        type: mongoose.Schema.Types.ObjectId,
      }],
      applicationIds: [{
        type: mongoose.Schema.Types.ObjectId,
      }],
    },
  ],
  price: {
    type: Number,
    default: 0,
  },
  priceVisible: {
    type: Boolean,
    default: true,
  },
  webStatus: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
    index: true,
  },
  targetAudience: {
    type: String,
    default: '',
  },
  softeningPoint: {
    type: String,
    default: ''
  },
  acidValue: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: ''
  },
  applications: {
    type: [productApplicationSubSchema],
    default: [],
  },
  gallery: {
    type: [productImageSubSchema],
    default: [],
  },
  tdsUrl: {
    type: String,
    default: ''
  },
  attributes: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true,
  },
  isNew: {
    type: Boolean,
    default: false,
    index: true,
  },
  displayOrder: {
    type: Number,
    default: 0,
  },
  viewCount: {
    type: Number,
    default: 0,
  },
}, {
    timestamps: true
});

productSchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ isActive: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ productCode: 1 }, { unique: true, partialFilterExpression: { productCode: { $type: 'string', $gt: '' } } });
productSchema.index({ webStatus: 1, isActive: 1 });
productSchema.index({ marketIds: 1 });
productSchema.index({ isFeatured: 1, isActive: 1, webStatus: 1, displayOrder: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
