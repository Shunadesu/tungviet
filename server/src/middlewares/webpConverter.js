import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { randomUUID } from 'crypto';

const SKIP_FORMATS = new Set(['svg', 'ico', 'gif']);

/**
 * Re-encode an uploaded raster image to WebP for smaller payload.
 *
 * - No-op for SVG / ICO / GIF (kept as-is to preserve vector / frames / favicons).
 * - No resizing — only container + codec re-encoding.
 * - On conversion failure, leaves the original file untouched and logs a warning
 *   so the upload still succeeds (better than a 500 on a malformed image).
 *
 * @param {import('multer').MulterFile|undefined} file - `req.file` populated by multer
 * @returns {Promise<{converted: boolean, fromSize?: number, toSize?: number, format?: string}>}
 */
export const convertToWebP = async (file) => {
  if (!file || !file.path) return { converted: false };
  if (!file.mimetype || !file.mimetype.startsWith('image/')) return { converted: false };

  const ext = path.extname(file.filename || '').toLowerCase();
  if (ext === '.svg' || ext === '.ico' || ext === '.gif') return { converted: false };

  const inputPath = file.path;
  let metadata;
  try {
    metadata = await sharp(inputPath, { failOn: 'none' }).metadata();
  } catch (err) {
    console.warn('[webpConverter] metadata read failed, skipping:', err.message);
    return { converted: false };
  }
  if (!metadata.format || SKIP_FORMATS.has(metadata.format)) {
    return { converted: false };
  }
  if (metadata.format === 'webp') {
    return { converted: false, format: 'webp' };
  }

  const dir = path.dirname(inputPath);
  const newFilename = `${randomUUID()}.webp`;
  const outputPath = path.join(dir, newFilename);

  try {
    const info = await sharp(inputPath, { failOn: 'none' })
      .webp({ quality: 80, effort: 4 })
      .toFile(outputPath);

    const fromSize = file.size;
    fs.unlinkSync(inputPath);

    file.filename = newFilename;
    file.path = outputPath;
    file.size = info.size;
    file.mimetype = 'image/webp';

    return {
      converted: true,
      fromSize,
      toSize: info.size,
      format: 'webp',
    };
  } catch (err) {
    console.warn('[webpConverter] conversion failed, keeping original:', err.message);
    if (fs.existsSync(outputPath)) {
      try { fs.unlinkSync(outputPath); } catch (_) { /* ignore */ }
    }
    return { converted: false };
  }
};

/**
 * Express middleware wrapper: converts `req.file` to WebP in-place after multer.
 * Never throws — failures are logged and the request continues with the original file.
 */
export const webpConverterMiddleware = async (req, res, next) => {
  if (!req.file || (Array.isArray(req.file) && req.file.length === 0)) {
    return next();
  }
  const files = Array.isArray(req.file) ? req.file : [req.file];
  try {
    for (const f of files) {
      await convertToWebP(f);
    }
  } catch (err) {
    console.warn('[webpConverter] unexpected error:', err.message);
  }
  next();
};
