import { Navigate, useLocation } from 'react-router-dom';
import { SUPPORTED_LOCALES } from '../i18n';

const DEFAULT_LOCALE = SUPPORTED_LOCALES[0];

const detectStoredLocale = () => {
  try {
    const stored = localStorage.getItem('locale');
    return SUPPORTED_LOCALES.includes(stored) ? stored : null;
  } catch {
    return null;
  }
};

const detectBrowserLocale = () => {
  try {
    const navLang = (navigator.language || '').toLowerCase();
    if (navLang.startsWith('en')) return 'en';
    if (navLang.startsWith('vi')) return 'vi';
  } catch {
    /* ignore */
  }
  return null;
};

const LocaleRedirect = () => {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];

  // If pathname already starts with a valid locale, do not redirect.
  if (SUPPORTED_LOCALES.includes(firstSegment)) {
    return null;
  }

  const preferred =
    detectStoredLocale() || detectBrowserLocale() || DEFAULT_LOCALE;

  const rest = location.pathname === '/' ? '' : location.pathname;
  const search = location.search || '';
  return <Navigate to={`/${preferred}${rest}${search}`} replace />;
};

export default LocaleRedirect;