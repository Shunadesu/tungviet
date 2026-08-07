import QuoteSubmission from '../../models/QuoteSubmission.js';
import { apiResponse } from '../../utils/apiResponse.js';

const sanitizeItems = (raw) => {
  if (!Array.isArray(raw)) return [];
  return raw
    .slice(0, 100)
    .map((it) => ({
      productId: typeof it?.productId === 'string' ? it.productId.slice(0, 64) : '',
      name: typeof it?.name === 'string' ? it.name.slice(0, 300) : '',
      softeningPoint: typeof it?.softeningPoint === 'string' ? it.softeningPoint.slice(0, 100) : '',
      imageUrl: typeof it?.imageUrl === 'string' ? it.imageUrl.slice(0, 500) : '',
      quantity: Number.isFinite(Number(it?.quantity)) && Number(it.quantity) > 0
        ? Math.min(Math.floor(Number(it.quantity)), 9999)
        : 1,
    }))
    .filter((it) => it.name);
};

export const submitQuote = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      message,
      preferredContact,
      items,
      productType,
      market,
    } = req.body || {};

    if (!name?.trim()) return apiResponse.badRequest(res, 'Tên là bắt buộc');
    if (!email?.trim()) return apiResponse.badRequest(res, 'Email là bắt buộc');
    if (!phone?.trim()) return apiResponse.badRequest(res, 'Số điện thoại là bắt buộc');

    const sanitizedItems = sanitizeItems(items);
    // items[] là optional — chỉ bắt buộc với QuoteBag flow (QuoteRequest).
    // Form CTA trên Home (QuoteSection.jsx) và form sidebar (QuoteForm) chỉ
    // gửi productType/market hoặc product text, không có items[].

    const submission = new QuoteSubmission({
      name: String(name).trim().slice(0, 120),
      email: String(email).trim().toLowerCase().slice(0, 160),
      phone: String(phone).trim().slice(0, 30),
      company: typeof company === 'string' ? company.trim().slice(0, 160) : '',
      message: typeof message === 'string' ? message.trim().slice(0, 2000) : '',
      preferredContact: preferredContact === 'phone' ? 'phone' : 'email',
      items: sanitizedItems,
      productType: typeof productType === 'string' ? productType.slice(0, 200) : '',
      market: typeof market === 'string' ? market.slice(0, 200) : '',
    });
    await submission.save();
    return apiResponse.created(res, submission, 'Yêu cầu báo giá của bạn đã được gửi');
  } catch (err) { next(err); }
};
