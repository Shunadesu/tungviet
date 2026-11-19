import mongoose from 'mongoose';

const tdsDownloadSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    tdsUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

tdsDownloadSchema.index({ userId: 1, createdAt: -1 });

const TdsDownload = mongoose.model('TdsDownload', tdsDownloadSchema);

export default TdsDownload;
