import mongoose from 'mongoose';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    logger.warn({ code: err.code, statusCode: err.statusCode, message: err.message, url: req.originalUrl }, 'AppError');
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
    });
  }

  if (err && (err.type === 'entity.too.large' || err.status === 413)) {
    return res.status(413).json({
      success: false,
      message: 'Payload quá lớn (tối đa 5MB)',
      code: 'PAYLOAD_TOO_LARGE',
    });
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((e) => e.message).join(', ');
    return res.status(400).json({
      success: false,
      message: messages || 'Dữ liệu không hợp lệ',
      code: 'VALIDATION_ERROR',
    });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      success: false,
      message: 'ID không hợp lệ',
      code: 'CAST_ERROR',
    });
  }

  if (err && err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      message: `${field} đã tồn tại`,
      code: 'DUPLICATE_KEY',
    });
  }

  // MongoServerError (driver errors): trả lại message MongoDB thay vì chìm xuống 500 chung
  if (err && (err.name === 'MongoServerError' || err.constructor?.name === 'MongoServerError')) {
    const code = err.code;
    const msg = err.message || 'Lỗi MongoDB';
    logger.error({ err: { message: msg, code }, url: req.originalUrl, method: req.method }, 'MongoServerError');
    let status = 500;
    let userMessage = `Lỗi cơ sở dữ liệu: ${msg}`;
    if (code === 11000) {
      status = 409;
      userMessage = `Giá trị đã tồn tại (duplicate key)`;
    } else if (code === 121) {
      status = 400;
      userMessage = 'Dữ liệu vi phạm document validation';
    } else if (code === 2 || code === 14) {
      status = 400;
      userMessage = `Schema/index không hợp lệ: ${msg}`;
    } else if (code === 16755) {
      status = 400;
      userMessage = `Định nghĩa index không hợp lệ: ${msg}`;
    } else if (code === 171) {
      status = 400;
      userMessage = `Cấu hình index không hợp lệ (parallel arrays?): ${msg}`;
    } else if (msg.includes('parallel arrays')) {
      status = 400;
      userMessage = 'Schema có nhiều mảng cùng được index, không thể tạo/sửa bản ghi';
    } else if (msg.includes('E11000')) {
      status = 409;
    }
    return res.status(status).json({
      success: false,
      message: userMessage,
      code: code ? `MONGO_${code}` : 'MONGO_ERROR',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  logger.error({ err, url: req.originalUrl, method: req.method }, 'Unhandled error');
  return res.status(500).json({
    success: false,
    message: err?.message || 'Lỗi máy chủ nội bộ',
    code: 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const notFoundHandler = (req, res) => {
  return res.status(404).json({
    success: false,
    message: `Không tìm thấy route: ${req.originalUrl}`,
    code: 'ROUTE_NOT_FOUND',
  });
};