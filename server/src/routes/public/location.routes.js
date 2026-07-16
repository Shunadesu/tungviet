import express from 'express';
import { locationService } from '../../services/location.service.js';
import { apiResponse } from '../../utils/apiResponse.js';
import { resolveLocale } from '../../utils/i18n.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const locale = resolveLocale(req);
    const locations = await locationService.getPublic(locale);
    return apiResponse.ok(res, { locations });
  } catch (err) {
    next(err);
  }
});

export default router;
