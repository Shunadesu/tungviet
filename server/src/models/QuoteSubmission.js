import mongoose from 'mongoose';

const quoteItemSchema = new mongoose.Schema(
  {
    productId: { type: String, default: '' },
    name: { type: String, default: '' },
    softeningPoint: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    quantity: { type: Number, default: 1, min: 1 },
  },
  { _id: false }
);

const quoteSubmissionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    company: { type: String, default: '', trim: true },
    message: { type: String, default: '', trim: true, maxlength: 2000 },
    preferredContact: { type: String, enum: ['email', 'phone'], default: 'email' },
    items: { type: [quoteItemSchema], default: [] },
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
