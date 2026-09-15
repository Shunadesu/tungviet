import mongoose from 'mongoose';
import mongooseDelete from 'mongoose-delete';

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

const applicationSubSchema = new mongoose.Schema(
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
    specifications: { type: [specificationSubSchema], default: [] },
    productLines: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    }],
    applications: { type: [applicationSubSchema], default: [] },
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