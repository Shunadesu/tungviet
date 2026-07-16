import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

const toPublicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

export const authService = {
  async register({ name, email, password }) {
    const existing = await User.findOne({ email });
    if (existing) throw AppError.badRequest('Email đã được sử dụng');

    const user = new User({ name, email, password, role: 'user' });
    await user.save();

    const token = signToken(user._id);
    return { user: toPublicUser(user), token };
  },

  async login({ email, password }) {
    const user = await User.findOne({ email });
    if (!user) throw AppError.unauthorized('Email hoặc mật khẩu không đúng');

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw AppError.unauthorized('Email hoặc mật khẩu không đúng');

    if (!user.isActive) throw AppError.unauthorized('Tài khoản đã bị vô hiệu hóa');

    const token = signToken(user._id);
    return { user: toPublicUser(user), token };
  },

  async getProfile(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) throw AppError.notFound('Người dùng không tồn tại');
    return user;
  },
};