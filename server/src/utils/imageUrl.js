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

const toAbsoluteUploadUrls = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toAbsoluteUploadUrls);
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (isImageField(k)) {
      out[k] = toAbsoluteUploadUrl(v);
    } else if (v && typeof v === 'object') {
      out[k] = toAbsoluteUploadUrls(v);
    } else {
      out[k] = v;
    }
  }
  return out;
};

export { toAbsoluteUploadUrl, toAbsoluteUploadUrls };
export default toAbsoluteUploadUrls;