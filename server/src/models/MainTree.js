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
    applications: { type: [applicationSubSchema], default: [] },
    technologies: { type: [technologySubSchema], default: [] },
  },
  { timestamps: true }
);

mainTreeSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: 'all',
});

const MainTree = mongoose.model('MainTree', mainTreeSchema);

export default MainTree;