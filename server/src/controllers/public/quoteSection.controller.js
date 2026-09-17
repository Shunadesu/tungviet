import { quoteSectionService } from '../../services/quoteSection.service.js';
import { apiResponse } from '../../utils/apiResponse.js';
import { cacheKeys, cacheStore, TTL } from '../../utils/cache.js';
import { resolveLocale } from '../../utils/i18n.js';

export const getPublicQuoteSection = async (req, res, next) => {
  try {
    const locale = resolveLocale(req);
    const cacheKey = cacheKeys.publicQuoteSection(locale);
    let section = cacheStore.get(cacheKey);
    if (!section) {
      section = await quoteSectionService.getPublic(locale);
      cacheStore.set(cacheKey, section, TTL.PUBLIC_QUOTE_SECTION);
    }
    return apiResponse.ok(res, section || {});
  } catch (err) { next(err); }
};
