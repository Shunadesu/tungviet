import mongoose from 'mongoose';

const quoteSubmissionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    productType: { type: String, default: '' },
    market: { type: String, default: '' },
    status: { type: String, enum: ['new', 'contacted', 'closed'], default: 'new' },
  },
  { timestamps: true }
);

quoteSubmissionSchema.index({ status: 1 });
quoteSubmissionSchema.index({ createdAt: -1 });

const QuoteSubmission = mongoose.model('QuoteSubmission', quoteSubmissionSchema);

export default QuoteSubmission;
