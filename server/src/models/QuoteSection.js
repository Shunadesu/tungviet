import mongoose from 'mongoose';
import mongooseDelete from 'mongoose-delete';

const quoteSectionSchema = new mongoose.Schema(
  {
    title: {
      vi: { type: String, default: '', trim: true },
      en: { type: String, default: '', trim: true },
    },
    subtitle: {
      vi: { type: String, default: '' },
      en: { type: String, default: '' },
    },
    backgroundUrl: { type: String, default: '' },
    hotlines: [
      {
        label: { type: String, default: '' },
        number: { type: String, default: '' },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

quoteSectionSchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });
quoteSectionSchema.index({ isActive: 1 });

const QuoteSection = mongoose.model('QuoteSection', quoteSectionSchema);

export default QuoteSection;
