const RAW_BASE = (
  process.env.PUBLIC_BASE_URL || 'https://tungviet.fun'
).replace(/\/+$/, '');

const toAbsoluteUploadUrl = (value) => {
  if (!value || typeof value !== 'string') return value;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('/uploads/')) return `${RAW_BASE}${value}`;
  return value;
};

const isImageField = (key) =>
  key === 'logoUrl' ||
  key === 'imageUrl' ||
  key === 'faviconUrl' ||
  key === 'ogImage';

/**
 * Convert a Mongoose document/subdocument to a plain JS object,
 * stopping recursion into Mongoose internal properties.
 */
const toPlainObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  // Mongoose document or subdocument — convert to plain object
  if (typeof obj.toObject === 'function') return obj.toObject();
  return obj;
};

/**
 * Guard: Mongoose DocumentArray overrides Symbol.iterator and Array methods.
 * If we pass a raw subdocument array, iterating it triggers the override which
 * calls back into our own toAbsoluteUploadUrls → infinite recursion.
 * We prevent this by checking for the Mongoose internal Symbol.
 */
const IS_MONGOOSE_COLLECTION =
  typeof Symbol !== 'undefined' && Symbol.for('mongoose#DocumentArray');

// Recursion-safe object walker — converts Mongoose internals to plain objects
const toAbsoluteUploadUrls = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  // Convert Mongoose document/subdocument to plain object first
  if (typeof obj.toObject === 'function') {
    obj = obj.toObject();
  }

  if (Array.isArray(obj)) {
    return obj.map(toAbsoluteUploadUrls);
  }

  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (isImageField(k)) {
      out[k] = toAbsoluteUploadUrl(v);
    } else if (v && typeof v === 'object') {
      // Guard: skip Mongoose DocumentArray instances (they recurse infinitely)
      if (v[IS_MONGOOSE_COLLECTION] !== undefined) continue;
      out[k] = toAbsoluteUploadUrls(v);
    } else {
      out[k] = v;
    }
  }
  return out;
};

export { toAbsoluteUploadUrl, toAbsoluteUploadUrls };
export default toAbsoluteUploadUrls;