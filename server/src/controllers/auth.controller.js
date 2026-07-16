import { authService } from '../services/auth.service.js';
import { apiResponse } from '../utils/apiResponse.js';

export const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    return apiResponse.created(res, result, 'Đăng ký thành công');
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    return apiResponse.ok(res, result, 'Đăng nhập thành công');
  } catch (err) {
    next(err);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user._id);
    return apiResponse.ok(res, user);
  } catch (err) {
    next(err);
  }
};