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
    // Defensive: ensure resolved path is still inside UPLOAD_DIR
    const resolved = path.resolve(filePath);
    if (!resolved.startsWith(path.resolve(UPLOAD_DIR) + path.sep)) {
      return;
    }
    try {
      await fs.unlink(filePath);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
  },
};

export const uploadFile = async (req, res, next) => {
  try {
    const saved = await uploadService.save(req.file);
    return apiResponse.created(res, saved, 'Upload thành công');
  } catch (err) {
    next(err);
  }
};