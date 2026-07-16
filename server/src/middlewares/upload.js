import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { AppError } from '../utils/AppError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.resolve(__dirname, '../../public/uploads');

// Image upload config
const ALLOWED_IMAGE_MIME = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/gif',
  'image/x-icon',
  'image/vnd.microsoft.icon',
];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// PDF upload config
const ALLOWED_PDF_MIME = ['application/pdf'];
const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB

const imageStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif', '.ico'].includes(ext) ? ext : '.jpg';
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
    cb(null, unique);
  },
});

const pdfStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ext === '.pdf' ? ext : '.pdf';
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
    cb(null, unique);
  },
});

export const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter(req, file, cb) {
    if (!ALLOWED_IMAGE_MIME.includes(file.mimetype)) {
      return cb(AppError.badRequest('Chỉ chấp nhận file ảnh (jpg, png, webp, gif, svg, ico)', 'INVALID_IMAGE_TYPE'));
    }
    cb(null, true);
  },
});

export const uploadPDF = multer({
  storage: pdfStorage,
  limits: { fileSize: MAX_PDF_SIZE },
  fileFilter(req, file, cb) {
    if (!ALLOWED_PDF_MIME.includes(file.mimetype)) {
      return cb(AppError.badRequest('Chỉ chấp nhận file PDF', 'INVALID_PDF_TYPE'));
    }
    cb(null, true);
  },
});

// Backward compatibility - export as 'upload' for existing code
export const upload = multer({
  storage: imageStorage,
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter(req, file, cb) {
    if (!ALLOWED_IMAGE_MIME.includes(file.mimetype)) {
      return cb(AppError.badRequest('Chỉ chấp nhận file ảnh (jpg, png, webp, gif, svg, ico)', 'INVALID_FILE_TYPE'));
    }
    cb(null, true);
  },
});

export const uploadSingle = (fieldName = 'file') => (req, res, next) => {
  upload.single(fieldName)(req, res, (err) => {
    if (!err) return next();
    if (err instanceof AppError) return next(err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(AppError.badRequest('File quá lớn (tối đa 5MB)', 'FILE_TOO_LARGE'));
    }
    next(err);
  });
};

export const uploadSinglePDF = (fieldName = 'file') => (req, res, next) => {
  uploadPDF.single(fieldName)(req, res, (err) => {
    if (!err) return next();
    if (err instanceof AppError) return next(err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(AppError.badRequest('File PDF quá lớn (tối đa 10MB)', 'PDF_TOO_LARGE'));
    }
    next(err);
  });
};

export { UPLOAD_DIR };
