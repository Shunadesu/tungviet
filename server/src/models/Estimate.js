import mongoose from 'mongoose';

const estimateSchema = new mongoose.Schema({
  stt: {
    type: Number,
    default: 0,
  },
  feature: {
    type: String,
    required: true,
    trim: true,
  },
  requirement: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  complexity: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  },
  estimatedHours: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  hourlyRate: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  totalCost: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  estimatedDays: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  notes: {
    type: String,
    default: '',
  },
  product: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

const Estimate = mongoose.model('Estimate', estimateSchema);

export default Estimate;
