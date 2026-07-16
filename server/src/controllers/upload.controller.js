import fs from 'fs/promises';
import path from 'path';
import { UPLOAD_DIR } from '../middlewares/upload.js';
import { apiResponse } from '../utils/apiResponse.js';
import { AppError } from '../utils/AppError.js';
import { toAbsoluteUploadUrl } from '../utils/imageUrl.js';

export const uploadService = {
  async save(file) {
    if (!file) throw AppError.badRequest('Không có file được upload', 'NO_FILE');
    const url = toAbsoluteUploadUrl(`/uploads/${file.filename}`);
    return { url, filename: file.filename, size: file.size, mimetype: file.mimetype };
  },

  async remove(filename) {
    if (!filename) return;
    const safeName = path.basename(filename);
    const filePath = path.join(UPLOAD_DIR, safeName);
    try {
      await fs.unlink(filePath);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
  },
};

import { logger } from '../utils/logger.js';

export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      logger.warn({
        ct: req.headers['content-type'],
        cl: req.headers['content-length'],
        bodyKeys: req.body ? Object.keys(req.body) : null,
        bodyFileType: req.body?.file ? typeof req.body.file : null,
        hasFile: !!req.file,
        hasFiles: !!req.files,
      }, '[upload-debug] NO_FILE');
    }
    const saved = await uploadService.save(req.file);
    return apiResponse.created(res, saved, 'Upload thành công');
  } catch (err) {
    next(err);
  }
};