import { partnerService } from '../../services/partner.service.js';
import { apiResponse } from '../../utils/apiResponse.js';

export const getPublicPartners = async (req, res, next) => {
  try {
    const { type } = req.query;
    const items = await partnerService.getPublic(type);
    return apiResponse.ok(res, items);
  } catch (err) { next(err); }
};
