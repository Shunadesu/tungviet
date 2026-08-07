/**
 * Lấy giá trị theo ngôn ngữ với fallback.
 * Ưu tiên field tiếng Anh khi lang === 'en', ngược lại lấy field tiếng Việt.
 */
export const getLocalizedField = (obj, lang, viField, enField) => {
  if (!obj) return '';
  if (lang === 'en') {
    return obj[enField] || obj[viField] || '';
  }
  return obj[viField] || obj[enField] || '';
};