import express from 'express';
import { locationService } from '../../services/location.service.js';
import { apiResponse } from '../../utils/apiResponse.js';
import { cacheKeys, cacheStore, TTL } from '../../utils/cache.js';
import { resolveLocale } from '../../utils/i18n.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const locale = resolveLocale(req);
    const cacheKey = cacheKeys.publicLocations(locale);
    let locations = cacheStore.get(cacheKey);
    if (!locations) {
      locations = await locationService.getPublic(locale);
      cacheStore.set(cacheKey, locations, TTL.PUBLIC_LOCATIONS);
    }
    return apiResponse.ok(res, { locations });
  } catch (err) {
    next(err);
  }
});

export default router;
