import mongoose from 'mongoose';
import mongooseDelete from 'mongoose-delete';

const locationSchema = new mongoose.Schema(
  {
    name: {
      vi: { type: String, required: true, trim: true },
      en: { type: String, default: '', trim: true },
    },
    address: {
      vi: { type: String, default: '', trim: true },
      en: { type: String, default: '', trim: true },
    },
    description: {
      vi: { type: String, default: '' },
      en: { type: String, default: '' },
    },
    mapEmbed: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

locationSchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });
locationSchema.index({ isActive: 1 });
locationSchema.index({ order: 1 });

const Location = mongoose.model('Location', locationSchema);

export default Location;
