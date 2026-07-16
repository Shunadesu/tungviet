import mongoose from 'mongoose';
import mongooseDelete from 'mongoose-delete';

const memberSchema = new mongoose.Schema(
  {
    name: {
      vi: { type: String, required: true, trim: true },
      en: { type: String, default: '', trim: true },
    },
    position: {
      vi: { type: String, default: '', trim: true },
      en: { type: String, default: '', trim: true },
    },
    imageUrl: { type: String, default: '' },
    description: {
      vi: { type: String, default: '' },
      en: { type: String, default: '' },
    },
    bio: {
      vi: { type: String, default: '' },
      en: { type: String, default: '' },
    },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

memberSchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });
memberSchema.index({ isActive: 1 });
memberSchema.index({ order: 1 });
memberSchema.index({ 'name.vi': 1 });

const Member = mongoose.model('Member', memberSchema);

export default Member;
