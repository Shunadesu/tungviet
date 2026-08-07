import mongoose from 'mongoose';
import mongooseDelete from 'mongoose-delete';

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
  mainTree: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MainTree',
    default: null,
    index: true,
  },
  productLine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
    index: true,
  },
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
  benefits: {
    type: [String],
    default: []
  },
  applications: {
    type: [String],
    default: []
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
productSchema.index({ mainTree: 1, productLine: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;