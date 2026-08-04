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
  FiAward,
  FiUsers,
  FiMapPin,
} from 'react-icons/fi';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useQuoteBag } from '../context/QuoteBagContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { SUPPORTED_LOCALES } from '../i18n';
import publicApi from '../api/publicApi';
import { getMarketTitle } from '../utils/market';

const LOCALE_LABELS = { vi: 'VI', en: 'EN' };
const SCROLL_THRESHOLD = 16;
const DROPDOWN_LIMIT = 8;

// ─── Dropdown nav (Markets / Products) ─────────────────────────────────────────
const DropdownNav = ({ to, label, children, transparent }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const triggerClass = transparent
    ? 'text-sm text-white/95 hover:text-white transition-colors font-medium flex items-center gap-0.5 cursor-pointer'
    : 'text-sm text-gray-700 hover:text-primary transition-colors font-medium flex items-center gap-0.5 cursor-pointer';

  const panelClass =
    'absolute top-full left-0 mt-2 w-64 max-h-[70vh] overflow-y-auto bg-white shadow-lg rounded-lg border border-gray-100 z-50';

  const closeMenu = () => setOpen(false);

  const handleLabelClick = (e) => {
    // Middle-click / cmd-click / ctrl-click: let the browser handle navigation
    if (e.metaKey || e.ctrlKey || e.button === 1) return;
    e.preventDefault();
    setOpen((v) => !v);
  };

  const handleLabelKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen((v) => !v);
    }
  };

  const handleNavigate = () => {
    closeMenu();
    navigate(to);
  };

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center">
        <Link
          to={to}
          onClick={handleLabelClick}
          onKeyDown={handleLabelKeyDown}
          className={triggerClass}
        >
          {label}
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={label}
          aria-haspopup="true"
          aria-expanded={open}
          className={`${triggerClass} -ml-1 pl-1`}
        >
          <FiChevronDown
            size={12}
            className={`transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={closeMenu}
            />
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className={panelClass}
              role="menu"
            >
              {children({ close: closeMenu, navigateAll: handleNavigate })}
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
    ? 'text-sm text-white/95 hover:text-white transition-colors font-medium flex items-center gap-0.5 cursor-pointer'
    : 'text-sm text-gray-700 hover:text-primary transition-colors font-medium flex items-center gap-0.5 cursor-pointer';

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
    ? 'text-sm text-white/95 hover:text-white transition-colors font-medium flex items-center gap-0.5 cursor-pointer'
    : 'text-sm text-gray-700 hover:text-primary transition-colors font-medium flex items-center gap-0.5 cursor-pointer';

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
  const { logoUrl } = useSiteConfig();
  const navigate = useNavigate();
  const location = useLocation();
  const { lang: urlLang } = useParams();
  const currentLang = SUPPORTED_LOCALES.includes(urlLang) ? urlLang : i18n.language || 'vi';

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [markets, setMarkets] = useState([]);
  const [products, setProducts] = useState([]);
  const searchInputRef = useRef(null);
  const searchWrapperRef = useRef(null);

  useEffect(() => {
    publicApi
      .getMarkets({ lang: currentLang, limit: DROPDOWN_LIMIT })
      .then((r) => {
        setMarkets(r.data?.data ?? []);
      })
      .catch((err) => {
        console.warn('[Header] getMarkets failed:', err?.message || err);
      });
  }, [currentLang]);

  useEffect(() => {
    publicApi
      .getProducts({ lang: currentLang, limit: DROPDOWN_LIMIT })
      .then((r) => {
        setProducts(r.data?.data ?? []);
      })
      .catch((err) => {
        console.warn('[Header] getProducts failed:', err?.message || err);
      });
  }, [currentLang]);

  useEffect(() => {
    if ((searchOpen || desktopSearchOpen) && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen, desktopSearchOpen]);

  useEffect(() => {
    if (!desktopSearchOpen) return undefined;
    const onClick = (e) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) {
        setDesktopSearchOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setDesktopSearchOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [desktopSearchOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setScrolled(window.scrollY > SCROLL_THRESHOLD);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e?.preventDefault?.();
    const q = searchQuery.trim();
    if (q.length < 2) return;
    setDesktopSearchOpen(false);
    setSearchOpen(false);
    navigate(`/${currentLang}/products?q=${encodeURIComponent(q)}`);
  };

  const switchLocale = (next) => {
    if (!SUPPORTED_LOCALES.includes(next) || next === currentLang) return;
    const rest = location.pathname.replace(/^\/[^/]+/, '') || '';
    const search = location.search || '';
    navigate(`/${next}${rest}${search}`);
  };

  const isHome = location.pathname === `/${currentLang}` || location.pathname === `/${currentLang}/`;
  const transparent = isHome && !scrolled && !menuOpen && !searchOpen && !desktopSearchOpen;

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
                  className="h-10 w-auto max-w-[180px] object-contain"
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
          <nav className="hidden md:flex col-span-5 items-center justify-center gap-8">
            <MegaMenuAbout transparent={transparent} isHomeTop={isHome && !scrolled} />

            <DropdownNav
              to={`/${currentLang}/markets`}
              label={t('nav.markets')}
              transparent={transparent}
            >
              {({ close, navigateAll }) => (
                <>
                  {markets.length === 0 ? (
                    <div className="px-3 py-3 text-xs text-gray-500 italic">
                      {t('market.noMarkets')}
                    </div>
                  ) : (
                    markets.map((m) => (
                      <Link
                        key={m._id}
                        to={`/${currentLang}/markets/${m._id}`}
                        className={subLinkClass}
                        onClick={close}
                        role="menuitem"
                      >
                        {getMarketTitle(m, currentLang)}
                      </Link>
                    ))
                  )}
                  <div className="border-t border-gray-100">
                    <button
                      type="button"
                      onClick={navigateAll}
                      className={`${subLinkClass} w-full text-left text-primary font-medium`}
                      role="menuitem"
                    >
                      {t('common.viewAll')} {t('nav.markets')} →
                    </button>
                  </div>
                </>
              )}
            </DropdownNav>

            <DropdownNav
              to={`/${currentLang}/products`}
              label={t('nav.products')}
              transparent={transparent}
            >
              {({ close, navigateAll }) => (
                <>
                  {products.length === 0 ? (
                    <div className="px-3 py-3 text-xs text-gray-500 italic">
                      {t('product.noProducts')}
                    </div>
                  ) : (
                    products.map((p) => {
                      const label =
                        currentLang === 'en' && p.nameEn
                          ? p.nameEn
                          : p.name;
                      return (
                        <Link
                          key={p._id}
                          to={`/${currentLang}/products/${p._id}`}
                          className={subLinkClass}
                          onClick={close}
                          role="menuitem"
                        >
                          {label}
                        </Link>
                      );
                    })
                  )}
                  <div className="border-t border-gray-100">
                    <button
                      type="button"
                      onClick={navigateAll}
                      className={`${subLinkClass} w-full text-left text-primary font-medium`}
                      role="menuitem"
                    >
                      {t('common.viewAll')} {t('nav.products')} →
                    </button>
                  </div>
                </>
              )}
            </DropdownNav>

            <MegaMenuContact transparent={transparent} />
          </nav>

          {/* Right controls */}
          <div className="col-span-8 md:col-span-4 flex items-center justify-end gap-1">
            {/* Desktop search */}
            <div ref={searchWrapperRef} className="hidden md:flex items-center">
              <AnimatePresence initial={false}>
                {desktopSearchOpen && (
                  <motion.form
                    key="desktop-search"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 200, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    onSubmit={handleSearchSubmit}
                    className={searchFormClass.replace('hidden md:flex', '')}
                  >
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('common.search')}
                      className={searchInputClass}
                      maxLength={120}
                    />
                  </motion.form>
                )}
              </AnimatePresence>
              <button
                type="button"
                aria-label={t('common.search')}
                aria-expanded={desktopSearchOpen}
                onClick={() => {
                  setDesktopSearchOpen((v) => !v);
                  setTimeout(() => searchInputRef.current?.focus(), 60);
                }}
                className={searchButtonClass}
              >
                <FiSearch size={18} />
              </button>
            </div>

            {/* Mobile search trigger */}
            <button onClick={() => setSearchOpen(!searchOpen)} aria-label={t('common.search')} className={`md:hidden ${iconClass}`}>
              <FiSearch size={18} />
            </button>

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

        {/* Mobile search */}
        <AnimatePresence>
          {searchOpen && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleSearchSubmit}
              className={`md:hidden overflow-hidden ${transparent ? 'border-t border-white/20' : 'border-t border-gray-200'}`}
            >
              <div className="flex items-center gap-2 py-2">
                <FiSearch size={16} className={transparent ? 'text-white/70 ml-1' : 'text-gray-400 ml-1'} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('common.search')}
                  className={`flex-1 outline-none text-sm bg-transparent ${transparent ? 'text-white placeholder-white/70' : 'text-gray-800'}`}
                  autoFocus
                />
                <button type="button" onClick={() => setSearchOpen(false)} className={transparent ? 'p-1 text-white/70' : 'p-1 text-gray-400'}>
                  <FiX size={16} />
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

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

                {markets.length > 0 && (
                  <>
                    <span className={`px-1 text-[10px] uppercase font-semibold tracking-wide ${transparent ? 'text-white/60' : 'text-gray-400'}`}>
                      {t('nav.markets')}
                    </span>
                    {markets.slice(0, 5).map((m) => (
                      <Link
                        key={m._id}
                        to={`/${currentLang}/markets/${m._id}`}
                        onClick={() => setMenuOpen(false)}
                        className={mobileLinkClass}
                      >
                        <span className="ml-3">{getMarketTitle(m, currentLang)}</span>
                      </Link>
                    ))}
                    <Link
                      to={`/${currentLang}/markets`}
                      onClick={() => setMenuOpen(false)}
                      className={`${mobileLinkClass} text-primary font-medium ml-3`}
                    >
                      {t('common.viewAll')} {t('nav.markets')} →
                    </Link>
                    <div className={`my-1 ${transparent ? 'border-t border-white/20' : 'border-t border-gray-200'}`} />
                  </>
                )}

                {products.length > 0 && (
                  <>
                    <span className={`px-1 text-[10px] uppercase font-semibold tracking-wide ${transparent ? 'text-white/60' : 'text-gray-400'}`}>
                      {t('nav.products')}
                    </span>
                    {products.slice(0, 5).map((p) => (
                      <Link key={p._id} to={`/${currentLang}/products/${p._id}`} onClick={() => setMenuOpen(false)} className={mobileLinkClass}>
                        <span className="ml-3">{currentLang === 'en' && p.nameEn ? p.nameEn : p.name}</span>
                      </Link>
                    ))}
                    <Link to={`/${currentLang}/products`} onClick={() => setMenuOpen(false)} className={`${mobileLinkClass} text-primary font-medium ml-3`}>
                      {t('common.viewAll')} {t('nav.products')}
                    </Link>
                    <div className={`my-1 ${transparent ? 'border-t border-white/20' : 'border-t border-gray-200'}`} />
                  </>
                )}

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
