import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSiteConfig } from '../../../context/SiteConfigContext';
import { SUPPORTED_LOCALES } from '../../../i18n';

/**
 * useHeroSlides - hook that returns active, sorted slides + current locale.
 *
 * Reads from SiteConfigContext (which already fetches /api/public/site-config).
 * Falls back gracefully when no slides exist (caller decides what to render).
 */
const useHeroSlides = () => {
  const { heroSlides = [], loading = false } = useSiteConfig();
  const { i18n } = useTranslation();

  const lang = useMemo(() => {
    const current = SUPPORTED_LOCALES.includes(i18n.language) ? i18n.language : 'vi';
    return current;
  }, [i18n.language]);

  const slides = useMemo(() => {
    if (!Array.isArray(heroSlides)) return [];
    return heroSlides
      .filter((s) => s && s.active !== false)
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [heroSlides]);

  return { slides, loading, lang };
};

export default useHeroSlides;