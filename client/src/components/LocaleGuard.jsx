import { Navigate, useParams, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { SUPPORTED_LOCALES, changeLocale } from '../i18n';

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
    const fallback = SUPPORTED_LOCALES[0];
    return <Navigate to={`/${fallback}`} replace />;
  }

  return children;
};

export default LocaleGuard;