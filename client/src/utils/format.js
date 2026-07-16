const LOCALE_MAP = {
  vi: 'vi-VN',
  en: 'en-US',
};

export const formatDate = (date, locale = 'vi') => {
  const intlLocale = LOCALE_MAP[locale] || 'vi-VN';
  try {
    return new Date(date).toLocaleDateString(intlLocale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return new Date(date).toISOString();
  }
};

export const getIntlLocale = (locale = 'vi') => LOCALE_MAP[locale] || 'vi-VN';

export default { formatDate, getIntlLocale };