import mongoose from 'mongoose';
import mongooseDelete from 'mongoose-delete';

const leadershipSchema = new mongoose.Schema(
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

leadershipSchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });
leadershipSchema.index({ isActive: 1 });
leadershipSchema.index({ order: 1 });

const Leadership = mongoose.model('Leadership', leadershipSchema);

export default Leadership;
