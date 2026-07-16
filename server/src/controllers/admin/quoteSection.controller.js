import { quoteSectionService } from '../../services/quoteSection.service.js';
import QuoteSubmission from '../../models/QuoteSubmission.js';
import { apiResponse } from '../../utils/apiResponse.js';
import { invalidatePublicCache } from '../../utils/cache.js';

export const getAllQuoteSections = async (req, res, next) => {
  try {
    const sections = await quoteSectionService.getAdmin();
    return apiResponse.ok(res, sections);
  } catch (err) { next(err); }
};

export const getOrCreateQuoteSection = async (req, res, next) => {
  try {
    const section = await quoteSectionService.getOrCreate();
    return apiResponse.ok(res, section);
  } catch (err) { next(err); }
};

export const updateQuoteSection = async (req, res, next) => {
  try {
    const section = await quoteSectionService.upsert(req.body);
    return apiResponse.ok(res, section, 'Cap nhat thanh cong');
  } catch (err) { next(err); }
};

export const getAllSubmissions = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const submissions = await QuoteSubmission.find(filter)
      .sort({ createdAt: -1 })
      .lean();
    return apiResponse.ok(res, submissions);
  } catch (err) { next(err); }
};

export const updateSubmission = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['new', 'contacted', 'closed'].includes(status)) {
      return apiResponse.badRequest(res, 'Trang thai khong hop le');
    }
    const doc = await QuoteSubmission.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!doc) return apiResponse.notFound(res, 'Khong tim thay');
    return apiResponse.ok(res, doc, 'Cap nhat thanh cong');
  } catch (err) { next(err); }
};
