import { SUPPORTED_LOCALES } from '../i18n';

const DEFAULT_LOCALE = SUPPORTED_LOCALES[0];

/**
 * Đọc locale đã lưu trong localStorage (do người dùng chọn trước đó).
 */
export const detectStoredLocale = () => {
  try {
    const stored = localStorage.getItem('locale');
    return SUPPORTED_LOCALES.includes(stored) ? stored : null;
  } catch {
    return null;
  }
};

/**
 * Suy ra locale từ ngôn ngữ trình duyệt.
 */
export const detectBrowserLocale = () => {
  try {
    const navLang = (navigator.language || '').toLowerCase();
    if (navLang.startsWith('en')) return 'en';
    if (navLang.startsWith('vi')) return 'vi';
  } catch {
    /* ignore */
  }
  return null;
};

/**
 * Locale ưu tiên: lựa chọn gần nhất > ngôn ngữ trình duyệt > mặc định.
 */
export const getPreferredLocale = () =>
  detectStoredLocale() || detectBrowserLocale() || DEFAULT_LOCALE;

export default getPreferredLocale;
