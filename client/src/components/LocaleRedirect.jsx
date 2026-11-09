import { Navigate, useLocation } from 'react-router-dom';
import { SUPPORTED_LOCALES } from '../i18n';
import { getPreferredLocale } from '../utils/preferredLocale';

/**
 * Xử lý các URL không có locale ở đầu (ví dụ "/").
 *
 * Locale được chèn vào trước, phần path còn lại được giữ nguyên nên
 * /abc/def → /vi/abc/def (sau đó route splat sẽ hiển thị trang 404 nếu
 * đường dẫn không tồn tại).
 */
const LocaleRedirect = () => {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];

  // If pathname already starts with a valid locale, do not redirect.
  if (SUPPORTED_LOCALES.includes(firstSegment)) {
    return null;
  }

  const preferred = getPreferredLocale();

  const rest = location.pathname === '/' ? '' : location.pathname;
  const search = location.search || '';
  return <Navigate to={`/${preferred}${rest}${search}`} replace />;
};

export default LocaleRedirect;
