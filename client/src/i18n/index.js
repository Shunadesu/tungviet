import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import vi from './locales/vi.json';
import en from './locales/en.json';

export const SUPPORTED_LOCALES = ['vi', 'en'];
export const DEFAULT_LOCALE = 'vi';

const stored = (() => {
  try {
    const raw = localStorage.getItem('locale');
    if (raw && SUPPORTED_LOCALES.includes(raw)) return raw;
  } catch (_) {}
  return null;
})();

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      vi: { translation: vi },
      en: { translation: en },
    },
    lng: stored || DEFAULT_LOCALE,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: SUPPORTED_LOCALES,
    interpolation: { escapeValue: false },
    detection: {
      order: ['path', 'localStorage', 'navigator'],
      lookupFromPathIndex: 0,
      caches: ['localStorage'],
      lookupLocalStorage: 'locale',
    },
    react: { useSuspense: false },
  });

export const changeLocale = (locale) => {
  if (!SUPPORTED_LOCALES.includes(locale)) return;
  try {
    localStorage.setItem('locale', locale);
  } catch (_) {}
  i18n.changeLanguage(locale);
};

export default i18n;