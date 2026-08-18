import imageCompression from 'browser-image-compression';

const SKIP_MIME_TYPES = new Set([
  'image/svg+xml',
  'image/x-icon',
  'image/vnd.microsoft.icon',
  'image/gif',
]);

const SMALL_FILE_SKIP_BYTES = 200 * 1024;

const ensureFileLike = (input) => {
  if (!input) throw new TypeError('Vui lòng chọn file hợp lệ');
  if (input instanceof File) return input;
  if (input instanceof Blob) return new File([input], input.name || 'upload', {
    type: input.type || 'application/octet-stream',
    lastModified: Date.now(),
  });
  throw new TypeError('Vui lòng chọn file hợp lệ');
};

/**
 * Compress an image to WebP before upload. Skips SVG / ICO / GIF.
 *
 * @param {File|Blob} file
 * @param {{quality?: number, maxSizeMB?: number}} [opts]
 *   quality  - 0..1, default 0.8
 *   maxSizeMB - soft target size, default 1.5
 * @returns {Promise<File>} - WebP File (or original if skipped)
 */
export const compressImage = async (file, opts = {}) => {
  const safe = ensureFileLike(file);

  if (SKIP_MIME_TYPES.has(safe.type)) return safe;
  if (!safe.type.startsWith('image/')) return safe;
  if (safe.size > 0 && safe.size < SMALL_FILE_SKIP_BYTES) return safe;

  const quality = typeof opts.quality === 'number' ? opts.quality : 0.8;
  const maxSizeMB = typeof opts.maxSizeMB === 'number' ? opts.maxSizeMB : 1.5;

  try {
    const compressed = await imageCompression(safe, {
      fileType: 'image/webp',
      initialQuality: quality,
      maxSizeMB,
      useWebWorker: true,
      alwaysKeepResolution: true,
    });

    const originalName = (safe.name || 'upload').replace(/\.[^/.]+$/, '');
    const newName = `${originalName}.webp`;
    return new File([compressed], newName, {
      type: 'image/webp',
      lastModified: safe.lastModified || Date.now(),
    });
  } catch (err) {
    console.warn('[compressImage] compression failed, sending original:', err.message);
    return safe;
  }
};

export default compressImage;
