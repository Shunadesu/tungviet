import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch,
  FiFileText,
  FiUser,
  FiMenu,
  FiX,
  FiMapPin,
  FiHeart,
  FiBarChart2,
  FiBox,
  FiArrowRight,
  FiChevronDown,
  FiTrendingUp,
} from 'react-icons/fi';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useQuoteBag } from '../context/QuoteBagContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import useHomeSection from '../hooks/useHomeSection';
import { SUPPORTED_LOCALES } from '../i18n';
import publicApi from '../api/publicApi';
import { getLocalizedField } from '../utils/i18nField';
import SearchModal from './SearchModal';

const LOCALE_LABELS = { vi: 'VI', en: 'EN' };
const SCROLL_THRESHOLD = 16;

// ─── Products Dropdown ───────────────────────────────────────────────────────
/**
 * Dropdown "Sản phẩm" hiển thị theo IA mới: mỗi mục là một **product line**
 * (danh mục sản phẩm), kèm số lượng SKU bên trong. Bấm vào sẽ điều hướng
 * tới trang chi tiết của product line, nơi có bảng SKU đầy đủ.
 */
const ProductsDropdown = ({ onClose, lang, mainTrees, categories, loading }) => {
  // Group product lines (categories) by mainTree
  const getCategoriesForTree = (treeId) =>
    (categories || []).filter((c) => String(c.mainTree) === String(treeId));

  // Take first 4 main trees for 2-column layout
  const visibleTrees = (mainTrees || []).slice(0, 4);

  return (
    <>
      <div className="p-5">
        {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary mx-auto" />
        </div>
      ) : visibleTrees.length === 0 ? (
        <div className="text-center py-10">
          <FiBox size={32} className="mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-gray-500">
            {lang === 'en' ? 'No products available yet.' : 'Chưa có sản phẩm nào.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5">
          {visibleTrees.map((tree) => {
            const treeCategories = getCategoriesForTree(tree._id);

            return (
              <div key={tree._id} className="flex flex-col min-w-0">
                {/* Tree title */}
                <Link
                  to={`/${lang}/main-trees/${tree._id}`}
                  onClick={onClose.immediate}
                  className="mb-3 pb-2 border-b border-gray-200 group flex items-center justify-between"
                >
                  <h3 className="text-[11px] font-bold text-gray-800 uppercase tracking-wide group-hover:text-primary transition-colors truncate">
                    {getLocalizedField(tree, lang, 'name', 'nameEn')}
                  </h3>
                  <FiArrowRight size={12} className="opacity-0 group-hover:opacity-60 transition-opacity shrink-0 ml-2" />
                </Link>

                {/* Product lines */}
                {treeCategories.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {treeCategories.slice(0, 6).map((cat) => {
                      const skuCount = cat.skuCount || 0;
                      return (
                        <Link
                          key={cat._id}
                          to={`/${lang}/categories/${cat._id}`}
                          onClick={onClose.immediate}
                          className="group flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          {cat.imageUrl ? (
                            <img
                              src={cat.imageUrl}
                              alt={getLocalizedField(cat, lang, 'name', 'nameEn')}
                              className="w-9 h-9 rounded-md object-cover flex-shrink-0 bg-gray-100"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <FiBox size={14} className="text-gray-300" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-800 group-hover:text-primary transition-colors truncate leading-tight">
                              {getLocalizedField(cat, lang, 'name', 'nameEn')}
                            </p>
                            {skuCount > 0 && (
                              <p className="text-[10px] text-gray-400 truncate">
                                {lang === 'en' ? `${skuCount} SKUs` : `${skuCount} SKU`}
                              </p>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">
                    {lang === 'en' ? 'No products yet.' : 'Chưa có sản phẩm.'}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
      </div>

      {/* Footer */}
      <div className="px-5 pb-4 flex items-center justify-between border-t border-gray-100 pt-3">
        <Link
          to={`/${lang}/products`}
          onClick={onClose.immediate}
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          {lang === 'en' ? 'View all products' : 'Xem tất cả sản phẩm'}
          <FiArrowRight size={12} />
        </Link>
        <span className="text-[10px] text-gray-400">
          {mainTrees?.length || 0} {lang === 'en' ? 'industries' : 'ngành'}
        </span>
      </div>
    </>
  );
};

// ─── Markets Dropdown ─────────────────────────────────────────────────────────
const MarketsDropdown = ({ onClose, lang, markets, marketsLoading }) => {
  const visibleMarkets = (markets || []).slice(0, 6);

  return (
    <>
      <div className="p-5">
        {marketsLoading ? (
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary mx-auto" />
        </div>
      ) : visibleMarkets.length === 0 ? (
        <div className="text-center py-10">
          <FiTrendingUp size={32} className="mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-gray-500">
            {lang === 'en' ? 'No markets available yet.' : 'Chưa có thị trường nào.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {visibleMarkets.map((market) => (
            <Link
              key={market._id}
              to={`/${lang}/markets/${market._id}`}
              onClick={onClose.immediate}
              className="group flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100 hover:border-primary/20"
            >
              {market.imageUrl ? (
                <img
                  src={market.imageUrl}
                  alt={getLocalizedField(market, lang, 'title', 'titleEn')}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-gray-100"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <FiTrendingUp size={18} className="text-gray-300" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-semibold text-gray-800 group-hover:text-primary transition-colors leading-tight mb-0.5">
                  {getLocalizedField(market, lang, 'title', 'titleEn')}
                </h3>
                {(market.description || market.descriptionEn) && (
                  <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">
                    {getLocalizedField(market, lang, 'description', 'descriptionEn')}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
      </div>

      {/* Footer */}
      <div className="px-5 pb-4 flex items-center justify-between border-t border-gray-100 pt-3">
        <Link
          to={`/${lang}/markets`}
          onClick={onClose.immediate}
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          {lang === 'en' ? 'View all markets' : 'Xem tất cả thị trường'}
          <FiArrowRight size={12} />
        </Link>
        <span className="text-[10px] text-gray-400">
          {markets?.length || 0} {lang === 'en' ? 'markets' : 'thị trường'}
        </span>
      </div>
    </>
  );
};

// ─── Main Header ──────────────────────────────────────────────────────────────
const Header = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { count } = useQuoteBag();
  const { count: wishlistCount } = useWishlist();
  const { count: compareCount } = useCompare();
  const { logoUrl, loading: configLoading, heroSlides } = useSiteConfig();
  const heroSection = useHomeSection('hero');
  const hasHeroSlides =
    heroSection.enabled &&
    Array.isArray(heroSlides) &&
    heroSlides.some((s) => s && s.active !== false);
  const navigate = useNavigate();
  const location = useLocation();
  const { lang: urlLang } = useParams();
  const currentLang = SUPPORTED_LOCALES.includes(urlLang) ? urlLang : i18n.language || 'vi';

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mainTrees, setMainTrees] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [markets, setMarkets] = useState([]);
  const [marketsLoading, setMarketsLoading] = useState(false);

  // Products dropdown state
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);
  const [marketsDropdownOpen, setMarketsDropdownOpen] = useState(false);
  const closeTimer = useRef(null);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => {
      setProductsDropdownOpen(false);
      setMarketsDropdownOpen(false);
    }, 250);
  };

  const closeDropdown = () => {
    cancelClose();
    setProductsDropdownOpen(false);
    setMarketsDropdownOpen(false);
  };

  // Cmd+K / Ctrl+K to open search modal
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
      } else if (e.key === 'Escape' && (productsDropdownOpen || marketsDropdownOpen)) {
        setProductsDropdownOpen(false);
        setMarketsDropdownOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [searchModalOpen, productsDropdownOpen]);

  // Load main trees + categories (kèm số SKU của mỗi product line)
  useEffect(() => {
    let cancelled = false;
    setCategoriesLoading(true);
    Promise.allSettled([
      publicApi.getMainTrees(currentLang),
      publicApi.getCategories({ lang: currentLang, limit: 200, withSkuCount: true }),
    ]).then(([mtRes, catRes]) => {
      if (cancelled) return;
      if (mtRes.status === 'fulfilled') {
        const data = mtRes.value?.data?.data;
        setMainTrees(Array.isArray(data) ? data : []);
      }
      if (catRes.status === 'fulfilled') {
        const raw = catRes.value?.data?.data;
        setCategories(Array.isArray(raw) ? raw : raw?.items || []);
      }
      setCategoriesLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [currentLang]);

  const marketsFetchedRef = useRef(false);
  useEffect(() => {
    if (!marketsDropdownOpen) return;
    if (marketsFetchedRef.current) return;
    marketsFetchedRef.current = true;
    setMarketsLoading(true);
    publicApi
      .getMarketTrees({ lang: currentLang })
      .then((res) => {
        const data = res?.data?.data;
        setMarkets(Array.isArray(data) ? data : []);
        setMarketsLoading(false);
      })
      .catch(() => {
        marketsFetchedRef.current = false;
        setMarketsLoading(false);
      });
  }, [marketsDropdownOpen, currentLang]);

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
  const transparent = isHome && hasHeroSlides && !scrolled && !menuOpen && !searchModalOpen && !productsDropdownOpen && !marketsDropdownOpen;

  const headerBase = 'sticky top-0 z-50 transition-all duration-300';
  const headerTheme = transparent
    ? 'bg-transparent text-white'
    : 'bg-white/95 backdrop-blur shadow-sm text-gray-800 border-b border-gray-200/60';

  const iconClass = transparent
    ? 'p-2 text-white/85 hover:text-white transition-colors'
    : 'p-2 text-gray-500 hover:text-primary transition-colors';

  const searchButtonClass = transparent
    ? 'p-2 text-white/85 hover:text-white'
    : 'p-2 text-gray-500 hover:text-primary';

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

  const mobileLinkClass = transparent
    ? 'py-2 px-1 text-sm text-white/90 hover:text-white hover:bg-white/10'
    : 'py-2 px-1 text-sm text-gray-700 hover:text-primary hover:bg-gray-50';

  const navLinkClass = transparent
    ? 'text-sm font-medium flex items-center gap-0.5 cursor-pointer whitespace-nowrap transition-colors text-white/85 hover:text-white'
    : 'text-sm font-medium flex items-center gap-0.5 cursor-pointer whitespace-nowrap transition-colors text-gray-700 hover:text-primary';

  const dropdownCloseHandlers = {
    cancel: cancelClose,
    schedule: scheduleClose,
    immediate: closeDropdown,
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`${headerBase} ${headerTheme} relative`}
    >
      <div className="max-w-7xl mx-auto px-4 relative">
        <div className="grid grid-cols-12 items-center gap-3 h-16">
          {/* Logo */}
          <div className="col-span-4 md:col-span-3 flex items-center">
            <Link to={`/${currentLang}`} className="flex items-center gap-2 min-w-0">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Tungviet"
                  className="h-16 w-auto w-full object-contain"
                />
              ) : configLoading ? (
                <span className="block h-10 w-24 rounded-md bg-gray-200/60 animate-pulse" aria-hidden="true" />
              ) : null}
            </Link>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex col-span-5 items-center justify-center gap-5 lg:gap-6">
            {/* Giới thiệu */}
            <Link to={`/${currentLang}/about`} className={navLinkClass}>
              {currentLang === 'en' ? 'About' : 'Giới thiệu'}
            </Link>

            {/* Sản phẩm (dropdown trigger) */}
            <div
              onMouseEnter={() => {
                cancelClose();
                setMarketsDropdownOpen(false);
                setProductsDropdownOpen(true);
              }}
              onMouseLeave={scheduleClose}
            >
              <Link
                to={`/${currentLang}/products`}
                onClick={closeDropdown}
                className={navLinkClass}
              >
                {currentLang === 'en' ? 'Products' : 'Sản phẩm'}
                <FiChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${productsDropdownOpen ? 'rotate-180' : ''}`}
                />
              </Link>
            </div>

            {/* Thị trường (dropdown trigger) */}
            <div
              onMouseEnter={() => {
                cancelClose();
                setProductsDropdownOpen(false);
                setMarketsDropdownOpen(true);
              }}
              onMouseLeave={scheduleClose}
            >
              <Link
                to={`/${currentLang}/markets`}
                onClick={closeDropdown}
                className={navLinkClass}
              >
                {currentLang === 'en' ? 'Markets' : 'Thị trường'}
                <FiChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${marketsDropdownOpen ? 'rotate-180' : ''}`}
                />
              </Link>
            </div>

            {/* Tin tức */}
            <Link to={`/${currentLang}/news`} className={navLinkClass}>
              {currentLang === 'en' ? 'News' : 'Tin tức'}
            </Link>
          </div>

          {/* Right controls */}
          <div className="col-span-8 md:col-span-4 flex items-center justify-end gap-1">
            <button
              type="button"
              aria-label={t('common.search')}
              onClick={() => setSearchModalOpen(true)}
              className={searchButtonClass}
            >
              <FiSearch size={18} />
            </button>

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

        {/* Dropdown - single container so products/markets panels never overlap */}
        <div className="absolute left-0 right-0 top-full flex justify-center pt-2 pointer-events-none">
          <AnimatePresence>
            {(productsDropdownOpen || marketsDropdownOpen) && (
              <motion.div
                key="header-dropdown"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="relative pointer-events-auto"
              >
                {/* Hover bridge: keeps dropdown open while moving from nav trigger down to panel */}
                <div
                  className="absolute -top-3 inset-x-0 h-3"
                  onMouseEnter={cancelClose}
                  onMouseLeave={scheduleClose}
                />
                <div
                  className={`relative bg-white shadow-2xl rounded-2xl border border-gray-100 overflow-hidden z-50 ${
                    productsDropdownOpen
                      ? 'w-[700px] max-w-[calc(100vw-2rem)]'
                      : 'w-[640px] max-w-[calc(100vw-2rem)]'
                  }`}
                  onMouseEnter={cancelClose}
                  onMouseLeave={scheduleClose}
                >
                  {productsDropdownOpen ? (
                    <ProductsDropdown
                      onClose={dropdownCloseHandlers}
                      lang={currentLang}
                      mainTrees={mainTrees}
                      categories={categories}
                      loading={categoriesLoading}
                    />
                  ) : (
                    <MarketsDropdown
                      onClose={dropdownCloseHandlers}
                      lang={currentLang}
                      markets={markets}
                      marketsLoading={marketsLoading}
                    />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SearchModal */}
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
                <Link to={`/${currentLang}/products`} onClick={() => setMenuOpen(false)} className={mobileLinkClass}>
                  {t('nav.products')}
                </Link>
                <Link to={`/${currentLang}/markets`} onClick={() => setMenuOpen(false)} className={mobileLinkClass}>
                  {t('nav.markets')}
                </Link>
                <Link to={`/${currentLang}/news`} onClick={() => setMenuOpen(false)} className={mobileLinkClass}>
                  {t('nav.news')}
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
