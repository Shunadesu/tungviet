import mongoose from 'mongoose';
import mongooseDelete from 'mongoose-delete';

const mainTreeSchema = new mongoose.Schema(
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
    iconUrl: { type: String, default: '' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

mainTreeSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: 'all',
});

const MainTree = mongoose.model('MainTree', mainTreeSchema);

export default MainTree;