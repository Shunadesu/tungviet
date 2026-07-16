import mongoose from 'mongoose';

const partnerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    logo: { type: String, default: '' },
    website: { type: String, default: '' },
    type: { type: String, enum: ['partner', 'customer'], default: 'partner' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

partnerSchema.index({ type: 1, order: 1 });
partnerSchema.index({ isActive: 1 });

const Partner = mongoose.model('Partner', partnerSchema);

export default Partner;
