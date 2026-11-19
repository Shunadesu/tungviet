import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

const toPublicUser = (user) => ({
  _id: user._id,
  name: user.name,
  company: user.company || '',
  phone: user.phone || '',
  email: user.email,
  role: user.role,
});

export const authService = {
  async register({ name, company, phone, email, password }) {
    const cleanName = typeof name === 'string' ? name.trim() : '';
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const cleanPhone = typeof phone === 'string' ? phone.trim() : '';
    const cleanCompany = typeof company === 'string' ? company.trim() : '';

    if (!cleanName) throw AppError.badRequest('Họ tên là bắt buộc');
    if (!cleanPhone) throw AppError.badRequest('Số điện thoại là bắt buộc');
    if (!/^[0-9+\s().-]{8,20}$/.test(cleanPhone)) throw AppError.badRequest('Số điện thoại không hợp lệ');
    if (!cleanEmail) throw AppError.badRequest('Email là bắt buộc');
    if (typeof password !== 'string' || password.length < 6) {
      throw AppError.badRequest('Mật khẩu phải có ít nhất 6 ký tự');
    }

    const existing = await User.findOne({ email: cleanEmail });
    if (existing) throw AppError.badRequest('Email đã được sử dụng');

    const user = new User({
      name: cleanName.slice(0, 120),
      company: cleanCompany.slice(0, 160),
      phone: cleanPhone.slice(0, 30),
      email: cleanEmail,
      password,
      role: 'user',
    });
    await user.save();

    const token = signToken(user._id);
    return { user: toPublicUser(user), token };
  },

  async login({ email, password }) {
    const user = await User.findOne({ email });
    if (!user) {
      throw AppError.unauthorized('Email hoặc mật khẩu không đúng', 'INVALID_CREDENTIALS');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw AppError.unauthorized('Email hoặc mật khẩu không đúng', 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      throw AppError.unauthorized('Tài khoản đã bị vô hiệu hóa', 'ACCOUNT_DISABLED');
    }

    if (user.role !== 'admin') {
      throw AppError.forbidden('Bạn không có quyền truy cập Admin', 'NOT_ADMIN');
    }

    const token = signToken(user._id);
    return { user: toPublicUser(user), token };
  },

  async getProfile(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) throw AppError.notFound('Người dùng không tồn tại');
    return user;
  },
};