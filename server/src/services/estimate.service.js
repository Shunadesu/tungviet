import Estimate from '../models/Estimate.js';
import { AppError } from '../utils/AppError.js';

const ALLOWED_COMPLEXITY = ['Low', 'Medium', 'High'];

const toDoc = (item) => ({
  stt: Number(item.stt) || 0,
  feature: item.feature,
  requirement: item.requirement || '',
  description: item.description || '',
  complexity: ALLOWED_COMPLEXITY.includes(item.complexity) ? item.complexity : 'Medium',
  estimatedHours: Number(item.estimatedHours) || 0,
  estimatedDays: Number(item.estimatedDays) || 0,
  hourlyRate: Number(item.hourlyRate) || 0,
  totalCost: Number(item.totalCost) || 0,
  notes: item.notes || '',
  product: item.product || '',
});

export const estimateService = {
  async listAll() {
    return Estimate.find().sort({ stt: 1 });
  },

  async saveBatch(items) {
    if (!Array.isArray(items)) {
      throw AppError.badRequest('Invalid estimate payload');
    }
    const documents = items.map(toDoc);
    await Estimate.deleteMany({});
    return Estimate.insertMany(documents);
  },

  async create(item) {
    return Estimate.create(toDoc(item));
  },

  async update(id, item) {
    const doc = await Estimate.findByIdAndUpdate(id, toDoc(item), {
      new: true,
      runValidators: true,
    });
    if (!doc) throw AppError.notFound('Estimate not found');
    return doc;
  },

  async delete(id) {
    const doc = await Estimate.findByIdAndDelete(id);
    if (!doc) throw AppError.notFound('Estimate not found');
    return doc;
  },
};