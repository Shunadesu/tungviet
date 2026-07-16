export const SUPPORTED_LOCALES = ['vi', 'en'];
export const DEFAULT_LOCALE = 'vi';

export const isSupportedLocale = (value) =>
  SUPPORTED_LOCALES.includes(String(value || '').toLowerCase());

export const normalizeLocale = (value) => {
  if (!value) return DEFAULT_LOCALE;
  const lower = String(value).toLowerCase();
  if (lower.startsWith('en')) return 'en';
  if (lower.startsWith('vi')) return 'vi';
  return DEFAULT_LOCALE;
};

export const resolveLocale = (req) => {
  const fromQuery = normalizeLocale(req.query?.lang);
  if (isSupportedLocale(fromQuery)) return fromQuery;
  const header = req.headers?.['accept-language'];
  return normalizeLocale(header);
};

export const localizeText = (value, locale, fallback) => {
  if (locale === 'en') {
    if (value && String(value).trim()) return value;
    return fallback ?? '';
  }
  return value ?? fallback ?? '';
};

export const localizeFields = (doc, locale, fields) => {
  if (!doc) return doc;
  const out = { ...doc };
  for (const field of fields) {
    const viValue = doc[field];
    const enValue = doc[`${field}En`];
    if (locale === 'en') {
      out[field] = enValue && String(enValue).trim() ? enValue : viValue ?? '';
    } else {
      out[field] = viValue ?? '';
    }
    delete out[`${field}En`];
  }
  return out;
};