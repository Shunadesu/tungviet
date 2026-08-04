import mongoose from 'mongoose';

const visitLogSchema = new mongoose.Schema(
  {
    ip: { type: String, required: true, trim: true, index: true },
    userAgent: { type: String, default: '' },
    browser: { type: String, default: '' },
    os: { type: String, default: '' },
    device: { type: String, default: '' },
    deviceType: { type: String, enum: ['desktop', 'mobile', 'tablet', 'bot', 'unknown'], default: 'unknown' },
    country: { type: String, default: '' },
    countryCode: { type: String, default: '' },
    city: { type: String, default: '' },
    region: { type: String, default: '' },
    isp: { type: String, default: '' },
    path: { type: String, default: '', index: true },
    method: { type: String, default: 'GET' },
    referer: { type: String, default: '' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    statusCode: { type: Number, default: 200 },
    visitedAt: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false }
);

visitLogSchema.index({ visitedAt: -1 });
visitLogSchema.index({ ip: 1, visitedAt: -1 });
visitLogSchema.index({ path: 1, visitedAt: -1 });

const VisitLog = mongoose.model('VisitLog', visitLogSchema);

export default VisitLog;