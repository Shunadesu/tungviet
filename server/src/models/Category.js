import mongoose from 'mongoose';
import mongooseDelete from 'mongoose-delete';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
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
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

categorySchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });
categorySchema.index({ isActive: 1, name: 1 });

const Category = mongoose.model('Category', categorySchema);

export default Category;