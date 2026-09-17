import { useEffect, useState } from 'react';
import publicApi from '../api/publicApi';

const resolveLocale = (lang) => {
  if (lang && (lang === 'vi' || lang === 'en')) return lang;
  if (typeof window === 'undefined') return 'vi';
  try {
    const stored = localStorage.getItem('locale');
    if (stored === 'vi' || stored === 'en') return stored;
  } catch (_) {}
  const seg = window.location?.pathname?.split('/').filter(Boolean)[0];
  if (seg === 'vi' || seg === 'en') return seg;
  return 'vi';
};

/**
 * Fetches the aggregated /public/home payload for the given locale.
 * Caches per-locale during the component lifetime.
 */
const cache = new Map();

export const useHomeData = (lang) => {
  const locale = resolveLocale(lang);
  const cached = cache.get(locale);

  const [data, setData] = useState(cached || null);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    publicApi
      .getHome(locale)
      .then((res) => {
        if (cancelled) return;
        const payload = res?.data?.data || null;
        cache.set(locale, payload);
        setData(payload);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [locale]);

  return { data, loading, error };
};

export const clearHomeCache = (locale) => {
  if (locale) cache.delete(locale);
  else cache.clear();
};

export default useHomeData;
