import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch,
  FiFileText,
  FiUser,
  FiMenu,
  FiX,
  FiChevronDown,
  FiHome,
  FiInfo,
  FiMessageSquare,
  FiSettings,
  FiBox,
  FiGrid,
  FiHeart,
  FiBarChart2,
  FiAward,
  FiUsers,
  FiMapPin,
  FiGitBranch,
} from 'react-icons/fi';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useQuoteBag } from '../context/QuoteBagContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { SUPPORTED_LOCALES } from '../i18n';
import publicApi from '../api/publicApi';
import { getLocalizedField } from '../utils/i18nField';
import SearchModal from './SearchModal';

const LOCALE_LABELS = { vi: 'VI', en: 'EN' };
const SCROLL_THRESHOLD = 16;

// ─── Mega menu for Products (MainTree > Category) ───────────────────────────
const MegaMenuProducts = ({ transparent, mainTrees, categories }) => {
  const [open, setOpen] = useState(false);
  const [activeMainTreeId, setActiveMainTreeId] = useState(null);
  const ref = useRef(null);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.language === 'en' ? 'en' : 'vi';

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    setActiveMainTreeId((prev) => prev || mainTrees[0]?._id || null);
  }, [open, mainTrees]);

  const triggerClass = transparent
    ? 'text-sm text-white/95 hover:text-white transition-colors font-medium flex items-center gap-0.5 cursor-pointer whitespace-nowrap'
    : 'text-sm text-gray-700 hover:text-primary transition-colors font-medium flex items-center gap-0.5 cursor-pointer whitespace-nowrap';

  const activeMainTree =
    mainTrees.find((m) => String(m._id) === String(activeMainTreeId)) || mainTrees[0];
  const activeCategories = (categories || []).filter(
    (c) => String(c.mainTree) === String(activeMainTree?._id)
  );
  const close = () => setOpen(false);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className={triggerClass}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        {t('nav.products')}
        <FiChevronDown
          size={12}
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={close}
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="absolute top-full mt-2 w-[640px] bg-white shadow-xl rounded-xl border border-gray-100 overflow-hidden z-50"
              role="menu"
              onMouseLeave={close}
            >
              {mainTrees.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <p className="text-xs text-gray-500 italic">{t('product.filter.all')}</p>
                  <button
                    type="button"
                    onClick={() => {
                      close();
                      navigate(`/${lang}/products`);
                    }}
                    className="mt-3 text-xs font-semibold text-primary hover:underline"
                  >
                    {t('common.viewAll')} {t('nav.products')} →
                  </button>
                </div>
              ) : (
                <div className="flex">
                  {/* Left column: MainTree list */}
                  <div className="w-44 bg-slate-50 border-r border-gray-100 py-2 max-h-[420px] overflow-y-auto">
                    {mainTrees.map((m) => {
                      const isActive = String(activeMainTree?._id) === String(m._id);
                      return (
                        <button
                          key={m._id}
                          type="button"
                          onMouseEnter={() => setActiveMainTreeId(m._id)}
                          onFocus={() => setActiveMainTreeId(m._id)}
                          onClick={() => {
                            close();
                            navigate(`/${lang}/main-trees/${m._id}`);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-xs font-medium truncate transition-colors ${
                            isActive
                              ? 'bg-white text-primary'
                              : 'text-gray-600 hover:bg-white hover:text-primary'
                          }`}
                          title={getLocalizedField(m, lang, 'name', 'nameEn')}
                        >
                          {getLocalizedField(m, lang, 'name', 'nameEn')}
                        </button>
                      );
                    })}
                  </div>
                  {/* Right column: Category list */}
                  <div className="flex-1 p-4 max-h-[420px] overflow-y-auto">
                    {activeCategories.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">
                        {lang === 'en'
                          ? 'No product lines yet for this industry.'
                          : 'Chưa có ngành hàng nào trong cây ngành này.'}
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-1">
                        {activeCategories.map((c) => (
                          <Link
                            key={c._id}
                            to={`/${lang}/products?industries=${activeMainTree._id}&category=${c._id}`}
                            onClick={close}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors truncate"
                            title={getLocalizedField(c, lang, 'name', 'nameEn')}
                          >
                            <FiBox size={14} className="opacity-60 flex-shrink-0" />
                            <span className="truncate">
                              {getLocalizedField(c, lang, 'name', 'nameEn')}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {mainTrees.length > 0 && (
                <div className="border-t border-gray-100 px-4 py-2 bg-gray-50">
                  <button
                    type="button"
                    onClick={() => {
                      close();
                      navigate(`/${lang}/products`);
                    }}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    {t('common.viewAll')} {t('nav.products')} →
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Mega menu for Markets (MarketTree parent > child) ──────────────────────
const MegaMenuMarkets = ({ transparent, marketTrees }) => {
  const [open, setOpen] = useState(false);
  const [activeParentId, setActiveParentId] = useState(null);
  const ref = useRef(null);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.language === 'en' ? 'en' : 'vi';

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    setActiveParentId((prev) => prev || marketTrees[0]?._id || null);
  }, [open, marketTrees]);

  const triggerClass = transparent
    ? 'text-sm text-white/95 hover:text-white transition-colors font-medium flex items-center gap-0.5 cursor-pointer whitespace-nowrap'
    : 'text-sm text-gray-700 hover:text-primary transition-colors font-medium flex items-center gap-0.5 cursor-pointer whitespace-nowrap';

  const activeParent =
    marketTrees.find((p) => String(p._id) === String(activeParentId)) || marketTrees[0];
  const activeChildren = activeParent?.children || [];
  const close = () => setOpen(false);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className={triggerClass}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        {t('nav.marketTrees')}
        <FiChevronDown
          size={12}
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={close}
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="absolute top-full mt-2 w-[640px] bg-white shadow-xl rounded-xl border border-gray-100 overflow-hidden z-50"
              role="menu"
              onMouseLeave={close}
            >
              {marketTrees.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <p className="text-xs text-gray-500 italic">{t('market.noMarkets')}</p>
                  <button
                    type="button"
                    onClick={() => {
                      close();
                      navigate(`/${lang}/markets`);
                    }}
                    className="mt-3 text-xs font-semibold text-primary hover:underline"
                  >
                    {t('common.viewAll')} {t('nav.marketTrees')} →
                  </button>
                </div>
              ) : (
                <div className="flex">
                  {/* Left column: MarketTree parent list */}
                  <div className="w-44 bg-slate-50 border-r border-gray-100 py-2 max-h-[420px] overflow-y-auto">
                    {marketTrees.map((p) => {
                      const isActive = String(activeParent?._id) === String(p._id);
                      return (
                        <button
                          key={p._id}
                          type="button"
                          onMouseEnter={() => setActiveParentId(p._id)}
                          onFocus={() => setActiveParentId(p._id)}
                          onClick={() => {
                            close();
                            navigate(`/${lang}/markets/${p._id}`);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-xs font-medium truncate transition-colors ${
                            isActive
                              ? 'bg-white text-primary'
                              : 'text-gray-600 hover:bg-white hover:text-primary'
                          }`}
                          title={getLocalizedField(p, lang, 'title', 'titleEn')}
                        >
                          {getLocalizedField(p, lang, 'title', 'titleEn')}
                        </button>
                      );
                    })}
                  </div>
                  {/* Right column: MarketTree children */}
                  <div className="flex-1 p-4 max-h-[420px] overflow-y-auto">
                    {activeChildren.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">
                        {lang === 'en'
                          ? 'No sub-markets yet.'
                          : 'Chưa có cây ngành sản phẩm nào.'}
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-1">
                        {activeChildren.map((c) => (
                          <Link
                            key={c._id}
                            to={`/${lang}/markets/${c._id}`}
                            onClick={close}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors truncate"
                            title={getLocalizedField(c, lang, 'title', 'titleEn')}
                          >
                            <FiGitBranch size={14} className="opacity-60 flex-shrink-0" />
                            <span className="truncate">
                              {getLocalizedField(c, lang, 'title', 'titleEn')}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {marketTrees.length > 0 && (
                <div className="border-t border-gray-100 px-4 py-2 bg-gray-50">
                  <button
                    type="button"
                    onClick={() => {
                      close();
                      navigate(`/${lang}/markets`);
                    }}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    {t('common.viewAll')} {t('nav.marketTrees')} →
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Mega menu for About ──────────────────────────────────────────────────────
const ABOUT_MENU_ITEMS = {
  vi: [
    { icon: FiInfo, label: 'Về chúng tôi', to: '/about' },
    { icon: FiUsers, label: 'Ban lãnh đạo', to: '/about/board-of-directors' },
    { icon: FiAward, label: 'Tầm nhìn & Sứ mệnh', to: '/about/leadership' },
    { icon: FiGrid, label: 'Địa điểm', to: '/about/locations' },
  ],
  en: [
    { icon: FiInfo, label: 'About Us', to: '/about' },
    { icon: FiUsers, label: 'Board of Directors', to: '/about/board-of-directors' },
    { icon: FiAward, label: 'Leadership', to: '/about/leadership' },
    { icon: FiGrid, label: 'Locations', to: '/about/locations' },
  ],
};

const MegaMenuAbout = ({ transparent, isHomeTop }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'en' : 'vi';

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const menuItems = ABOUT_MENU_ITEMS[lang] || ABOUT_MENU_ITEMS.vi;

  const triggerClass = transparent
    ? 'text-sm text-white/95 hover:text-white transition-colors font-medium flex items-center gap-0.5 cursor-pointer whitespace-nowrap'
    : 'text-sm text-gray-700 hover:text-primary transition-colors font-medium flex items-center gap-0.5 cursor-pointer whitespace-nowrap';

  // Khi ở trang home đầu trang → luôn nền trắng cho mega menu
  const panelBorder = 'border-gray-100';
  const itemHover = 'hover:bg-gray-50 hover:text-primary';
  const labelClass = 'text-gray-600';
  const taglineClass = 'text-white';
  const taglineSubClass = 'text-gray-400';

  return (
    <div ref={ref} className="relative">
      <button className={triggerClass} onClick={() => setOpen((v) => !v)}>
        {t('nav.about')}
        <FiChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className={`absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[680px] bg-white shadow-xl rounded-xl border ${panelBorder} overflow-hidden z-50`}
            >
              <div className="flex">
                {/* Left: image + tagline */}
                <div
                  className="w-52 flex-shrink-0 relative overflow-hidden rounded-l-xl"
                  style={{ minHeight: 280 }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1519332978332-21b7d621d05e?w=400&q=80"
                    alt="About"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className={`text-sm font-semibold ${taglineClass}`}>
                      {lang === 'en' ? 'About  Tungviet' : 'Về Tùng Việt'}
                    </p>
                    <p className={`text-[11px] mt-1 ${taglineSubClass}`}>
                      {lang === 'en'
                        ? 'Industrial rosin supplier with international quality standards'
                        : 'Nhà cung cấp nhựa thông công nghiệp đạt tiêu chuẩn quốc tế'}
                    </p>
                  </div>
                </div>

                {/* Right: 2-col grid menu */}
                <div className="flex-1 p-4">
                  <div className="grid grid-cols-2 gap-1">
                    {menuItems.map((item) => (
                      <Link
                        key={item.label}
                        to={`/${lang}${item.to}`}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${itemHover} ${labelClass}`}
                        onClick={() => setOpen(false)}
                      >
                        <item.icon size={16} className="flex-shrink-0 opacity-70" />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Mega menu for Contact ───────────────────────────────────────────────────
const CONTACT_MENU_ITEMS = {
  vi: [
    { icon: FiMessageSquare, label: 'Liên hệ', to: '/contact' },
    { icon: FiMapPin, label: 'Địa điểm', to: '/about/locations' },
  ],
  en: [
    { icon: FiMessageSquare, label: 'Contact Us', to: '/contact' },
    { icon: FiMapPin, label: 'Location', to: '/about/locations' },
  ],
};

const MegaMenuContact = ({ transparent }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'en' : 'vi';

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const menuItems = CONTACT_MENU_ITEMS[lang] || CONTACT_MENU_ITEMS.vi;

  const triggerClass = transparent
    ? 'text-sm text-white/95 hover:text-white transition-colors font-medium flex items-center gap-0.5 cursor-pointer whitespace-nowrap'
    : 'text-sm text-gray-700 hover:text-primary transition-colors font-medium flex items-center gap-0.5 cursor-pointer whitespace-nowrap';

  const panelBorder = 'border-gray-100';
  const itemHover = 'hover:bg-gray-50 hover:text-primary';
  const labelClass = 'text-gray-600';

  return (
    <div ref={ref} className="relative">
      <button className={triggerClass} onClick={() => setOpen((v) => !v)}>
        {t('nav.contact')}
        <FiChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className={`absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[320px] bg-white shadow-xl rounded-xl border ${panelBorder} overflow-hidden z-50`}
            >
              <div className="p-3">
                {menuItems.map((item) => (
                  <Link
                    key={item.label}
                    to={`/${lang}${item.to}`}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${itemHover} ${labelClass}`}
                    onClick={() => setOpen(false)}
                  >
                    <item.icon size={16} className="flex-shrink-0 opacity-70" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main Header ──────────────────────────────────────────────────────────────
const Header = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { count } = useQuoteBag();
  const { count: wishlistCount } = useWishlist();
  const { count: compareCount } = useCompare();
  const { logoUrl } = useSiteConfig();
  const navigate = useNavigate();
  const location = useLocation();
  const { lang: urlLang } = useParams();
  const currentLang = SUPPORTED_LOCALES.includes(urlLang) ? urlLang : i18n.language || 'vi';

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mainTrees, setMainTrees] = useState([]);
  const [categories, setCategories] = useState([]);
  const [marketTrees, setMarketTrees] = useState([]);

  // Cmd+K / Ctrl+K to open search modal from anywhere
  useEffect(() => {
    const onKey = (e) => {
      const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
      if (cmdOrCtrl && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setSearchModalOpen(true);
      } else if (e.key === '/' && !searchModalOpen) {
        const tag = (e.target?.tagName || '').toLowerCase();
        if (tag !== 'input' && tag !== 'textarea' && !e.target?.isContentEditable) {
          e.preventDefault();
          setSearchModalOpen(true);
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([
      publicApi.getMainTrees(currentLang),
      publicApi.getCategories({ lang: currentLang, limit: 200 }),
      publicApi.getMarketTrees({ lang: currentLang }),
    ]).then(([mtRes, catRes, mktRes]) => {
      if (cancelled) return;
      if (mtRes.status === 'fulfilled') {
        const data = mtRes.value?.data?.data;
        setMainTrees(Array.isArray(data) ? data : []);
      }
      if (catRes.status === 'fulfilled') {
        const raw = catRes.value?.data?.data;
        setCategories(Array.isArray(raw) ? raw : raw?.items || []);
      }
      if (mktRes.status === 'fulfilled') {
        const data = mktRes.value?.data?.data;
        setMarketTrees(Array.isArray(data) ? data : []);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [currentLang]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setScrolled(window.scrollY > SCROLL_THRESHOLD);
  }, [location.pathname]);

  const switchLocale = (next) => {
    if (!SUPPORTED_LOCALES.includes(next) || next === currentLang) return;
    const rest = location.pathname.replace(/^\/[^/]+/, '') || '';
    const search = location.search || '';
    navigate(`/${next}${rest}${search}`);
  };

  const isHome = location.pathname === `/${currentLang}` || location.pathname === `/${currentLang}/`;
  const transparent = isHome && !scrolled && !menuOpen && !searchModalOpen;

  const headerBase = 'sticky top-0 z-50 transition-all duration-300';
  const headerTheme = transparent
    ? 'bg-transparent text-white'
    : 'bg-white/95 backdrop-blur shadow-sm text-gray-800 border-b border-gray-200/60';

  const iconClass = transparent
    ? 'p-2 text-white/85 hover:text-white transition-colors'
    : 'p-2 text-gray-500 hover:text-primary transition-colors';

  const searchFormClass = transparent
    ? 'hidden md:flex items-center bg-white/15 hover:bg-white/25 focus-within:bg-white/30 focus-within:ring-1 focus-within:ring-white/40 rounded-full transition-all overflow-hidden'
    : 'hidden md:flex items-center bg-gray-100 hover:bg-gray-200 focus-within:bg-white focus-within:ring-1 focus-within:ring-primary rounded-full transition-all overflow-hidden';

  const searchButtonClass = transparent
    ? 'p-2 text-white/85 hover:text-white'
    : 'p-2 text-gray-500 hover:text-primary';

  const searchInputClass = transparent
    ? 'bg-transparent outline-none text-sm w-40 pr-3 text-white placeholder-white/70 px-2'
    : 'bg-transparent outline-none text-sm w-40 pr-3 text-gray-800 px-2';

  const localePillClass = transparent
    ? 'hidden sm:flex items-center bg-white/15 rounded-full p-0.5 text-[10px] font-semibold text-white'
    : 'hidden sm:flex items-center bg-gray-100 rounded-full p-0.5 text-[10px] font-semibold';

  const localeBtnClass = (active) =>
    transparent
      ? `px-2 py-0.5 rounded-full transition-colors ${
          active ? 'bg-white text-primary' : 'text-white/85 hover:text-white'
        }`
      : `px-2 py-0.5 rounded-full transition-colors ${
          active ? 'bg-primary text-white' : 'text-gray-500 hover:text-primary'
        }`;

  const loginClass = transparent
    ? 'text-xs font-medium text-white hover:underline ml-1 hidden sm:inline'
    : 'text-xs font-medium text-primary hover:underline ml-1 hidden sm:inline';

  const logoFallbackTextClass = transparent
    ? 'text-base font-semibold text-white truncate'
    : 'text-base font-semibold text-primary truncate';

  const mobileLinkClass = transparent
    ? 'py-2 px-1 text-sm text-white/90 hover:text-white hover:bg-white/10'
    : 'py-2 px-1 text-sm text-gray-700 hover:text-primary hover:bg-gray-50';

  const subLinkClass = 'block px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 hover:text-primary';

  const linkClass = transparent
    ? 'text-sm text-white/95 hover:text-white transition-colors font-medium flex items-center gap-0.5 cursor-pointer whitespace-nowrap'
    : 'text-sm text-gray-700 hover:text-primary transition-colors font-medium flex items-center gap-0.5 cursor-pointer whitespace-nowrap';

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`${headerBase} ${headerTheme}`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-12 items-center gap-3 h-16">
          {/* Logo */}
          <div className="col-span-4 md:col-span-3 flex items-center">
            <Link to={`/${currentLang}`} className="flex items-center gap-2 min-w-0">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt=" Tungviet"
                  className="h-10 w-auto max-w-[140px] object-contain"
                />
              ) : (
                <>
                  <span className="text-xl shrink-0">🏭</span>
                  <span className={logoFallbackTextClass}> Tungviet</span>
                </>
              )}
            </Link>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex col-span-5 items-center justify-center gap-4 lg:gap-5">
            <MegaMenuAbout transparent={transparent} isHomeTop={isHome && !scrolled} />

            <MegaMenuProducts
              transparent={transparent}
              mainTrees={mainTrees}
              categories={categories}
            />

            <MegaMenuMarkets
              transparent={transparent}
              marketTrees={marketTrees}
            />

            <Link
              to={`/${currentLang}/news`}
              className={linkClass}
            >
              {t('nav.news')}
            </Link>

            <MegaMenuContact transparent={transparent} />
          </nav>

          {/* Right controls */}
          <div className="col-span-8 md:col-span-4 flex items-center justify-end gap-1">
            {/* Desktop search — opens SearchModal */}
            <button
              type="button"
              aria-label={t('common.search')}
              onClick={() => setSearchModalOpen(true)}
              className={searchButtonClass}
            >
              <FiSearch size={18} />
            </button>

            {/* Mobile search trigger — opens SearchModal */}
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              aria-label={t('common.search')}
              className={`md:hidden ${iconClass}`}
            >
              <FiSearch size={18} />
            </button>

            <Link
              to={`/${currentLang}/wishlist`}
              className={`${iconClass} relative hidden sm:inline-flex`}
              aria-label={t('nav.wishlist')}
              title={t('nav.wishlist')}
            >
              <FiHeart size={18} />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center font-medium">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              to={`/${currentLang}/products/compare`}
              className={`${iconClass} relative hidden sm:inline-flex`}
              aria-label={t('nav.compare')}
              title={t('nav.compare')}
            >
              <FiBarChart2 size={18} />
              {compareCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center font-medium">
                  {compareCount}
                </span>
              )}
            </Link>

            <Link to={`/${currentLang}/quote`} className={`${iconClass} relative`} aria-label={t('nav.quote')}>
              <FiFileText size={18} />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-[10px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center font-medium">
                  {count}
                </span>
              )}
            </Link>

            <div className={localePillClass}>
              {SUPPORTED_LOCALES.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => switchLocale(code)}
                  aria-pressed={currentLang === code}
                  aria-label={t('header.switchLanguage')}
                  className={localeBtnClass(currentLang === code)}
                >
                  {LOCALE_LABELS[code]}
                </button>
              ))}
            </div>

            {user ? (
              <div className="relative group">
                <button className={iconClass} aria-label={t('nav.account')}>
                  <FiUser size={18} />
                </button>
                <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 text-gray-800">
                  <div className="p-2 border-b">
                    <p className="text-xs font-medium truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <Link to={`/${currentLang}/orders`} className="block px-3 py-2 text-xs hover:bg-gray-50">
                    {t('header.orders')}
                  </Link>
                  <button onClick={logout} className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-gray-50">
                    {t('header.logout')}
                  </button>
                </div>
              </div>
            ) : (
              <Link to={`/${currentLang}/login`} className={loginClass}>
                {t('header.login')}
              </Link>
            )}

            <button onClick={() => setMenuOpen(!menuOpen)} className={`md:hidden ${iconClass}`} aria-label={t('header.openMenu')}>
              {menuOpen ? <FiX size={18} /> : <FiMenu size={18} />}
            </button>
          </div>
        </div>

        {/* Global SearchModal (Cmd+K / Ctrl+K + header icon) */}
        <SearchModal
          open={searchModalOpen}
          onClose={() => setSearchModalOpen(false)}
          lang={currentLang}
        />

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`md:hidden overflow-hidden ${transparent ? 'border-t border-white/20' : 'border-t border-gray-200'}`}
            >
              <div className="py-2 flex flex-col">
                <Link to={`/${currentLang}/about`} onClick={() => setMenuOpen(false)} className={mobileLinkClass}>
                  {t('nav.about')}
                </Link>

                <div className={`my-1 ${transparent ? 'border-t border-white/20' : 'border-t border-gray-200'}`} />

                {mainTrees.length > 0 && (
                  <>
                    <span className={`px-1 text-[10px] uppercase font-semibold tracking-wide ${transparent ? 'text-white/60' : 'text-gray-400'}`}>
                      {t('nav.mainTreeMenuTitle')}
                    </span>
                    {mainTrees.slice(0, 5).map((m) => (
                      <Link
                        key={m._id}
                        to={`/${currentLang}/main-trees/${m._id}`}
                        onClick={() => setMenuOpen(false)}
                        className={mobileLinkClass}
                      >
                        <span className="ml-3">{getLocalizedField(m, currentLang, 'name', 'nameEn')}</span>
                      </Link>
                    ))}
                    <Link
                      to={`/${currentLang}/main-trees`}
                      onClick={() => setMenuOpen(false)}
                      className={`${mobileLinkClass} text-primary font-medium ml-3`}
                    >
                      {t('common.viewAll')} →
                    </Link>
                    <div className={`my-1 ${transparent ? 'border-t border-white/20' : 'border-t border-gray-200'}`} />
                  </>
                )}

                {marketTrees.length > 0 && (
                  <>
                    <span className={`px-1 text-[10px] uppercase font-semibold tracking-wide ${transparent ? 'text-white/60' : 'text-gray-400'}`}>
                      {t('nav.marketTreeMenuTitle')}
                    </span>
                    {marketTrees.slice(0, 5).map((p) => (
                      <Link
                        key={p._id}
                        to={`/${currentLang}/markets/${p._id}`}
                        onClick={() => setMenuOpen(false)}
                        className={mobileLinkClass}
                      >
                        <span className="ml-3">{getLocalizedField(p, currentLang, 'title', 'titleEn')}</span>
                      </Link>
                    ))}
                    <Link
                      to={`/${currentLang}/markets`}
                      onClick={() => setMenuOpen(false)}
                      className={`${mobileLinkClass} text-primary font-medium ml-3`}
                    >
                      {t('common.viewAll')} →
                    </Link>
                    <div className={`my-1 ${transparent ? 'border-t border-white/20' : 'border-t border-gray-200'}`} />
                  </>
                )}

                <Link
                  to={`/${currentLang}/products`}
                  onClick={() => setMenuOpen(false)}
                  className={`${mobileLinkClass} text-primary font-medium`}
                >
                  {t('common.viewAll')} {t('nav.products')} →
                </Link>
                <div className={`my-1 ${transparent ? 'border-t border-white/20' : 'border-t border-gray-200'}`} />

                <Link to={`/${currentLang}/news`} onClick={() => setMenuOpen(false)} className={mobileLinkClass}>
                  {t('nav.news')}
                </Link>

                <Link to={`/${currentLang}/contact`} onClick={() => setMenuOpen(false)} className={mobileLinkClass}>
                  {t('nav.contact')}
                </Link>

                <div className="flex items-center gap-2 py-2">
                  <span className={`text-xs ${transparent ? 'text-white/70' : 'text-gray-500'}`}>
                    {t('header.switchLanguage')}:
                  </span>
                  {SUPPORTED_LOCALES.map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => { switchLocale(code); setMenuOpen(false); }}
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        transparent
                          ? currentLang === code ? 'bg-white text-primary' : 'bg-white/15 text-white'
                          : currentLang === code ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {LOCALE_LABELS[code]}
                    </button>
                  ))}
                </div>
                {!user && (
                  <Link to={`/${currentLang}/login`} onClick={() => setMenuOpen(false)} className={`py-2 px-1 text-sm font-medium ${transparent ? 'text-white' : 'text-primary'}`}>
                    {t('header.login')}
                  </Link>
                )}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header;
