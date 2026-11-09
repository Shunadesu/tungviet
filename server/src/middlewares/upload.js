import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';
import { AppError } from '../utils/AppError.js';
import { convertToWebP } from './webpConverter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.resolve(__dirname, '../../public/uploads');

// Ensure upload directory exists at startup
fs.mkdir(UPLOAD_DIR, { recursive: true }).catch((err) => {
  console.error('[upload] Failed to create upload directory:', err.message);
});

// Image upload config
// NOTE: `image/svg+xml` bị loại có chủ đích — SVG là file văn bản có thể chứa
// <script>, và file được serve lại từ /uploads cùng origin với API ⇒ stored XSS.
const ALLOWED_IMAGE_MIME = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/x-icon',
  'image/vnd.microsoft.icon',
];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// PDF upload config
const ALLOWED_PDF_MIME = ['application/pdf'];
const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.ico']);
const ALLOWED_PDF_EXT = new Set(['.pdf']);

/**
 * Generate a safe unique filename using UUID v4 + sanitized extension.
 * Returns: "<uuid>.<ext>" — guaranteed no path traversal, no dupe-risk timestamp.
 */
const buildFilename = (originalName, allowedExts) => {
  const ext = path.extname(originalName || '').toLowerCase();
  const safeExt = allowedExts.has(ext) ? ext : '';
  // Default to .jpg when ext unknown.
  const finalExt = safeExt || '.jpg';
  return `${randomUUID()}${finalExt}`;
};

const imageStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename(req, file, cb) {
    cb(null, buildFilename(file.originalname, ALLOWED_IMAGE_EXT));
  },
});

const pdfStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename(req, file, cb) {
    cb(null, buildFilename(file.originalname, ALLOWED_PDF_EXT));
  },
});

export const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: MAX_IMAGE_SIZE, files: 10, fields: 20 },
  fileFilter(req, file, cb) {
    if (!ALLOWED_IMAGE_MIME.includes(file.mimetype)) {
      return cb(AppError.badRequest('Chỉ chấp nhận file ảnh (jpg, png, webp, gif, ico)', 'INVALID_IMAGE_TYPE'));
    }
    cb(null, true);
  },
});

export const uploadPDF = multer({
  storage: pdfStorage,
  limits: { fileSize: MAX_PDF_SIZE, files: 5, fields: 20 },
  fileFilter(req, file, cb) {
    if (!ALLOWED_PDF_MIME.includes(file.mimetype)) {
      return cb(AppError.badRequest('Chỉ chấp nhận file PDF', 'INVALID_PDF_TYPE'));
    }
    cb(null, true);
  },
});

// Backward compatibility - export as 'upload' for existing code
export const upload = uploadImage;

/**
 * Chuyển lỗi của multer 2.x thành AppError gọn gàng.
 * Multer 2.x dùng busyboy 1.x và báo lỗi với `err.code` dạng chuỗi.
 */
const normalizeUploadError = (err, maxSizeMb) => {
  if (err instanceof AppError) return err;
  switch (err?.code) {
    case 'LIMIT_FILE_SIZE':
      return AppError.badRequest(`File quá lớn (tối đa ${maxSizeMb}MB)`, 'FILE_TOO_LARGE');
    case 'LIMIT_UNEXPECTED_FILE':
      return AppError.badRequest('Trường file không mong đợi hoặc upload quá số lượng cho phép.', 'UNEXPECTED_FILE');
    case 'LIMIT_FILE_COUNT':
      return AppError.badRequest('Số lượng file vượt quá giới hạn.', 'TOO_MANY_FILES');
    case 'LIMIT_FIELD_COUNT':
      return AppError.badRequest('Số lượng field vượt quá giới hạn.', 'TOO_MANY_FIELDS');
    case 'LIMIT_FIELD_VALUE':
      return AppError.badRequest('Giá trị field quá lớn.', 'FIELD_TOO_LARGE');
    case 'LIMIT_PART_COUNT':
      return AppError.badRequest('Dữ liệu multipart không hợp lệ.', 'INVALID_MULTIPART');
    default:
      return null;
  }
};

export const uploadSingle = (fieldName = 'file') => (req, res, next) => {
  uploadImage.single(fieldName)(req, res, async (err) => {
    if (!err) {
      if (req.file) {
        try {
          await convertToWebP(req.file);
        } catch (e) {
          console.warn('WebP convert failed:', e.message);
        }
      }
      return next();
    }
    const normalized = normalizeUploadError(err, 5);
    if (normalized) return next(normalized);
    next(err);
  });
};

export const uploadSinglePDF = (fieldName = 'file') => (req, res, next) => {
  uploadPDF.single(fieldName)(req, res, (err) => {
    if (!err) return next();
    const normalized = normalizeUploadError(err, 10);
    if (normalized) return next(normalized);
    next(err);
  });
};

export { UPLOAD_DIR };
