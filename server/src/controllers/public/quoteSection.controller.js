import { quoteSectionService } from '../../services/quoteSection.service.js';
import { apiResponse } from '../../utils/apiResponse.js';
import { resolveLocale } from '../../utils/i18n.js';

export const getPublicQuoteSection = async (req, res, next) => {
  try {
    const locale = resolveLocale(req);
    const section = await quoteSectionService.getPublic(locale);
    return apiResponse.ok(res, section || {});
  } catch (err) { next(err); }
};
