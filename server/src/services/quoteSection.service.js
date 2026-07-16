import QuoteSection from '../models/QuoteSection.js';
import { AppError } from '../utils/AppError.js';
import { invalidatePublicCache } from '../utils/cache.js';

export const quoteSectionService = {
  async getPublic(locale = 'vi') {
    const section = await QuoteSection.findOne({ isActive: true }).lean();
    if (!section) return null;
    return {
      _id: section._id,
      title: section.title?.[locale] || section.title?.vi || '',
      subtitle: section.subtitle?.[locale] || section.subtitle?.vi || '',
      backgroundUrl: section.backgroundUrl || '',
      hotlines: section.hotlines || [],
    };
  },

  async getAdmin() {
    const sections = await QuoteSection.find({}).sort({ createdAt: -1 }).lean();
    return sections;
  },

  async getOrCreate() {
    let section = await QuoteSection.findOne({}).lean();
    if (!section) {
      const created = new QuoteSection({});
      await created.save();
      section = created.toObject();
    }
    return section;
  },

  async upsert(data) {
    let section = await QuoteSection.findOne({}).lean();
    if (section) {
      section = await QuoteSection.findByIdAndUpdate(section._id, {
        title: data.title,
        subtitle: data.subtitle,
        backgroundUrl: data.backgroundUrl || '',
        hotlines: data.hotlines || [],
        isActive: data.isActive !== false,
      }, { new: true, runValidators: true });
    } else {
      const created = new QuoteSection({
        title: data.title,
        subtitle: data.subtitle,
        backgroundUrl: data.backgroundUrl || '',
        hotlines: data.hotlines || [],
        isActive: data.isActive !== false,
      });
      await created.save();
      section = created.toObject();
    }
    invalidatePublicCache();
    return section;
  },
};
