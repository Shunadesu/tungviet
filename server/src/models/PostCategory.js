import mongoose from 'mongoose';
import mongooseDelete from 'mongoose-delete';

const postCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    nameEn: { type: String, default: '', trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: { type: String, default: '' },
    descriptionEn: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

postCategorySchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: 'all',
});
postCategorySchema.index({ isActive: 1, order: 1 });

const PostCategory = mongoose.model('PostCategory', postCategorySchema);

export default PostCategory;
