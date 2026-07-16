import mongoose from 'mongoose';
import mongooseDelete from 'mongoose-delete';

const marketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  titleEn: {
    type: String,
    default: '',
    trim: true
  },
  imageUrl: {
    type: String,
    default: ''
  },
  iconUrl: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  descriptionEn: {
    type: String,
    default: ''
  },
  tdsUrl: {
    type: String,
    default: ''
  },
  technologies: [{
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    title: { type: String, required: true, trim: true },
    titleEn: { type: String, default: '', trim: true },
    imageUrl: { type: String, default: '' },
    description: { type: String, default: '' },
    descriptionEn: { type: String, default: '' },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    isActive: { type: Boolean, default: true }
  }],
  applications: [{
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    title: { type: String, required: true, trim: true },
    titleEn: { type: String, default: '', trim: true },
    imageUrl: { type: String, default: '' },
    benefits: { type: String, default: '' },
    benefitsEn: { type: String, default: '' },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    isActive: { type: Boolean, default: true }
  }],
  selectedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

marketSchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });
marketSchema.index({ isActive: 1 });
marketSchema.index({ title: 'text', titleEn: 'text' });
marketSchema.index({ createdAt: -1 });

const Market = mongoose.model('Market', marketSchema);

export default Market;
