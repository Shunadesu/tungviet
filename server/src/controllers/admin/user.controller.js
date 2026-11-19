import { adminUserService } from '../../services/adminUser.service.js';
import { apiResponse } from '../../utils/apiResponse.js';

export const listUsers = async (req, res, next) => {
  try {
    const result = await adminUserService.list(req.query);
    return apiResponse.ok(res, result);
  } catch (err) {
    next(err);
  }
};

export const getUserDetail = async (req, res, next) => {
  try {
    const result = await adminUserService.getDetail(req.params.id);
    return apiResponse.ok(res, result);
  } catch (err) {
    next(err);
  }
};
