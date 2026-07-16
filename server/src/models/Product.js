import mongoose from 'mongoose';
import mongooseDelete from 'mongoose-delete';

const productSchema = new mongoose.Schema({
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
  }
}, {
  timestamps: true
});

productSchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ isActive: 1 });
productSchema.index({ createdAt: -1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
