import mongoose from 'mongoose';
import mongooseDelete from 'mongoose-delete';

const marketTreeSchema = new mongoose.Schema(
  {
    mainTree: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MainTree',
      default: null,
      index: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MarketTree',
      default: null,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    titleEn: { type: String, default: '', trim: true },
    description: { type: String, default: '' },
    descriptionEn: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

marketTreeSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: 'all',
});
marketTreeSchema.index({ mainTree: 1, parent: 1, order: 1 });

const MarketTree = mongoose.model('MarketTree', marketTreeSchema);

export default MarketTree;