import express from 'express';
import { memberService } from '../../services/member.service.js';
import { apiResponse } from '../../utils/apiResponse.js';
import { resolveLocale } from '../../utils/i18n.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const locale = resolveLocale(req);
    const members = await memberService.getPublic(locale);
    return apiResponse.ok(res, { members });
  } catch (err) {
    next(err);
  }
});

export default router;
