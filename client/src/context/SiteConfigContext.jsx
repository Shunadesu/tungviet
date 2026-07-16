import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import publicApi from '../api/publicApi';
import { SUPPORTED_LOCALES } from '../i18n';

const buildDefaults = () => ({
  footer: {
    about: '',
    phone: '0123 456 789',
    email: 'contact@.vn',
    address: 'KCN Tân Bình, TP.HCM',
    copyright: '© 2024  Tungviet. All rights reserved.',
    logoUrl: '',
    mapEmbed: '',
  },
});

const SiteConfigContext = createContext({
  logoUrl: null,
  heroSlides: [],
  aboutSlides: [],
  about: null,
  fastFacts: [],
  coreValues: [],
  footer: null,
  seo: null,
  faviconUrl: null,
  floatingContacts: [],
  loading: true,
  refresh: () => {},
});

const getStoredLocale = () => {
  try {
    const stored = localStorage.getItem('locale');
    return SUPPORTED_LOCALES.includes(stored) ? stored : 'vi';
  } catch {
    return 'vi';
  }
};

export const SiteConfigProvider = ({ children }) => {
  const { i18n } = useTranslation();

  const [lang, setLang] = useState(() => {
    const stored = getStoredLocale();
    return SUPPORTED_LOCALES.includes(i18n.language) ? i18n.language : stored;
  });

  const defaults = buildDefaults();
  const [logoUrl, setLogoUrl] = useState(null);
  const [heroSlides, setHeroSlides] = useState([]);
  const [aboutSlides, setAboutSlides] = useState([]);
  const [about, setAbout] = useState(null);
  const [fastFacts, setFastFacts] = useState([]);
  const [coreValues, setCoreValues] = useState([]);
  const [footer, setFooter] = useState(defaults.footer);
  const [seo, setSeo] = useState(null);
  const [faviconUrl, setFaviconUrl] = useState(null);
  const [floatingContacts, setFloatingContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const onLangChange = () => {
      const current = SUPPORTED_LOCALES.includes(i18n.language) ? i18n.language : getStoredLocale();
      setLang(current);
    };
    i18n.on('languageChanged', onLangChange);
    return () => i18n.off('languageChanged', onLangChange);
  }, [i18n]);

const normalizeContactId = (contact, index) => {
  if (!contact) return contact;
  const raw = contact._id;
  let idStr = null;
  if (raw == null || raw === '') idStr = null;
  else if (typeof raw === 'string') idStr = raw;
  else if (typeof raw === 'object' && typeof raw.toHexString === 'function') idStr = raw.toHexString();
  else if (typeof raw === 'object' && raw._id) idStr = String(raw._id);
  else idStr = String(raw);
  return idStr ? { ...contact, _id: idStr } : { ...contact, _id: `floating-contact-${index}` };
};

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const res = await publicApi.getSiteConfig(lang);
      const data = res.data?.data || {};
      setLogoUrl(data.logoUrl || null);
      setHeroSlides(Array.isArray(data.heroSlides) ? data.heroSlides : []);
      setAboutSlides(Array.isArray(data.aboutSlides) ? data.aboutSlides : []);
      setAbout(data.about || null);
      setFastFacts(Array.isArray(data.fastFacts) ? data.fastFacts : []);
      setCoreValues(Array.isArray(data.coreValues) ? data.coreValues : []);
      setFooter(data.footer ? { ...defaults.footer, ...data.footer } : defaults.footer);
      setSeo(data.seo || null);
      setFaviconUrl(data.faviconUrl || null);
      setFloatingContacts(
        Array.isArray(data.floatingContacts)
          ? data.floatingContacts.map((contact, index) => normalizeContactId(contact, index))
          : []
      );
    } catch (err) {
      console.warn('[SiteConfig] fetch failed, using defaults:', err?.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  useEffect(() => {
    setFooter(defaults.footer);
    fetchConfig();
  }, [lang, fetchConfig]);

  return (
    <SiteConfigContext.Provider
      value={{ logoUrl, heroSlides, aboutSlides, about, fastFacts, coreValues, footer, seo, faviconUrl, floatingContacts, loading, refresh: fetchConfig }}
    >
      {children}
    </SiteConfigContext.Provider>
  );
};

export const useSiteConfig = () => useContext(SiteConfigContext);