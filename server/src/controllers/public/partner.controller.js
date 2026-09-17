import { partnerService } from '../../services/partner.service.js';
import { apiResponse } from '../../utils/apiResponse.js';
import { cacheKeys, cacheStore, TTL } from '../../utils/cache.js';

export const getPublicPartners = async (req, res, next) => {
  try {
    const { type } = req.query;
    const cacheKey = cacheKeys.publicPartners({ type: type || null });
    let items = cacheStore.get(cacheKey);
    if (!items) {
      items = await partnerService.getPublic(type);
      cacheStore.set(cacheKey, items, TTL.PUBLIC_PARTNERS);
    }
    return apiResponse.ok(res, items);
  } catch (err) {
    next(err);
  }
};
