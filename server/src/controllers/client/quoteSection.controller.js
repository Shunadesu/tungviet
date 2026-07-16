import QuoteSubmission from '../../models/QuoteSubmission.js';
import { apiResponse } from '../../utils/apiResponse.js';

export const submitQuote = async (req, res, next) => {
  try {
    const { name, email, phone, productType, market } = req.body;
    if (!name?.trim()) return apiResponse.badRequest(res, 'Ten la bat buoc');
    if (!email?.trim()) return apiResponse.badRequest(res, 'Email la bat buoc');
    if (!phone?.trim()) return apiResponse.badRequest(res, 'So dien thoai la bat buoc');

    const submission = new QuoteSubmission({ name, email, phone, productType, market });
    await submission.save();
    return apiResponse.created(res, submission, 'Yeu cau cua ban da duoc gui');
  } catch (err) { next(err); }
};
