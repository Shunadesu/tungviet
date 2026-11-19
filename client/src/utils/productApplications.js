import { getLocalizedField } from './i18nField';

/**
 * `Product.applications` từ server có thể mang hai shape khác nhau:
 *  - sub-document (shape hiện tại): { title, titleEn, description, descriptionEn, imageUrl, order, isActive, _id }
 *  - chuỗi thuần (dữ liệu cũ): "Ứng dụng"
 *
 * Render trực tiếp object như một React child sẽ ném lỗi
 * "Objects are not valid as a React child" và làm sập cả trang.
 * Helper này chuẩn hóa mọi shape về danh sách chuỗi hiển thị đã bản địa hoá.
 */

/** Lấy nhãn hiển thị của một ứng dụng (object hoặc chuỗi). */
export const getApplicationLabel = (app, lang) => {
  if (!app) return '';
  if (typeof app === 'string') return app.trim();
  if (typeof app !== 'object') return '';
  return (getLocalizedField(app, lang, 'title', 'titleEn') || '').trim();
};

/**
 * Chuẩn hóa `applications` thành mảng chuỗi đã bản địa hoá.
 * Bỏ qua ứng dụng bị ẩn (isActive === false) và ứng dụng không có nhãn.
 */
export const getApplicationLabels = (applications, lang) => {
  if (!Array.isArray(applications)) return [];
  return applications
    .filter((app) => app && app.isActive !== false)
    .map((app) => ({ app, label: getApplicationLabel(app, lang) }))
    .filter(({ label }) => label)
    .sort((a, b) => (a.app?.order ?? 0) - (b.app?.order ?? 0))
    .map(({ label }) => label);
};
