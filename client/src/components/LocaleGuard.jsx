import { Navigate, useParams, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { SUPPORTED_LOCALES, changeLocale } from '../i18n';
import { getPreferredLocale } from '../utils/preferredLocale';

/**
 * Bảo đảm URL luôn bắt đầu bằng một locale hợp lệ.
 *
 * - Khi `:lang` hợp lệ → chuyển đổi ngôn ngữ và render con.
 * - Khi `:lang` không hợp lệ (ví dụ /xyz) → chuyển hướng tới
 *   `/{locale ưu tiên}{đường dẫn cũ}` (giữ nguyên toàn bộ path).
 *   Nhờ vậy /xyz → /vi/xyz, và route con dạng splat sẽ hiển thị trang 404
 *   thay vì đưa người dùng về trang chủ.
 */
const LocaleGuard = ({ children }) => {
  const { lang } = useParams();
  const location = useLocation();

  useEffect(() => {
    if (SUPPORTED_LOCALES.includes(lang)) {
      changeLocale(lang);
    }
  }, [lang]);

  if (!SUPPORTED_LOCALES.includes(lang)) {
    const segments = location.pathname.split('/').filter(Boolean);
    if (segments.length > 0 && SUPPORTED_LOCALES.includes(segments[0])) {
      // Path already has a valid locale at segment 0 — render children.
      return children;
    }

    // Giữ nguyên toàn bộ đường dẫn, chỉ thay segment locale ở đầu.
    // /xyz → /vi/xyz, /xyz/a/b → /vi/xyz/a/b (sau đó route splat hiển thị 404).
    const search = location.search || '';
    const target = `/${getPreferredLocale()}${location.pathname}${search}`;
    return <Navigate to={target} replace />;
  }

  return children;
};

export default LocaleGuard;
