import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch,
  FiFileText,
  FiUser,
  FiMenu,
  FiX,
  FiInfo,
  FiMapPin,
  FiHeart,
  FiBarChart2,
  FiBox,
  FiGlobe,
  FiFile,
  FiArrowRight,
} from 'react-icons/fi';
import { useState, useEffect, useRef } from 'react';
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

// ─── Mega Menu Triggers ──────────────────────────────────────────────────────
const MegaMenuTriggers = ({
  activeKey,
  onSectionEnter,
  transparent,
  lang,
  containerRef,
}) => {
  const triggerClass = (key) => {
    const isActive = activeKey === key;
    if (transparent) {
      return `text-sm font-medium flex items-center gap-0.5 cursor-pointer whitespace-nowrap transition-colors ${
        isActive ? 'text-white' : 'text-white/85 hover:text-white'
      }`;
    }
    return `text-sm font-medium flex items-center gap-0.5 cursor-pointer whitespace-nowrap transition-colors ${
      isActive ? 'text-primary' : 'text-gray-700 hover:text-primary'
    }`;
  };

  const underlineClass = (key) =>
    activeKey === key
      ? 'absolute left-0 right-0 -bottom-[18px] h-0.5 bg-primary rounded-full'
      : 'absolute left-0 right-0 -bottom-[18px] h-0.5 bg-transparent';

  return (
    <div ref={containerRef} className="hidden md:flex col-span-5 items-center justify-center gap-5 lg:gap-6">
      {/* ─── Trigger: Giới thiệu ─── */}
      <div
        className="relative"
        onMouseEnter={() => onSectionEnter('about')}
      >
        <button type="button" className={triggerClass('about')}>
          {lang === 'en' ? 'About' : 'Giới thiệu'}
        </button>
        <span className={underlineClass('about')} />
      </div>

      {/* ─── Trigger: Sản phẩm ─── */}
      <div
        className="relative"
        onMouseEnter={() => onSectionEnter('products')}
      >
        <button type="button" className={triggerClass('products')}>
          {lang === 'en' ? 'Products' : 'Sản phẩm'}
        </button>
        <span className={underlineClass('products')} />
      </div>

      {/* ─── Trigger: Thị trường ─── */}
      <div
        className="relative"
        onMouseEnter={() => onSectionEnter('markets')}
      >
        <button type="button" className={triggerClass('markets')}>
          {lang === 'en' ? 'Markets' : 'Thị trường'}
        </button>
        <span className={underlineClass('markets')} />
      </div>

      {/* ─── Trigger: Tin tức ─── */}
      <div
        className="relative"
        onMouseEnter={() => onSectionEnter('news')}
      >
        <button type="button" className={triggerClass('news')}>
          {lang === 'en' ? 'News' : 'Tin tức'}
        </button>
        <span className={underlineClass('news')} />
      </div>
    </div>
  );
};

// ─── Mega Menu Panel (renders outside grid, relative to header container) ───
const MegaMenuPanel = ({
  open,
  activeKey,
  onClose,
  onSectionEnter,
  lang,
  aboutItems,
  mainTrees,
  categories,
  markets,
  marketsLoading,
  posts,
  postsLoading,
  containerRect,
}) => {
  const PANEL_WIDTH = 800;

  // Calculate left to center panel under the nav triggers container
  const panelStyle = containerRect
    ? {
        left: containerRect.left + containerRect.width / 2,
        transform: 'translateX(-50%)',
      }
    : {};

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          onMouseEnter={onClose.cancel}
          onMouseLeave={onClose.schedule}
          style={{ ...panelStyle, top: '100%', marginTop: '12px', width: `${PANEL_WIDTH}px`, maxWidth: 'calc(100vw - 2rem)' }}
          className="bg-white shadow-2xl rounded-2xl border border-gray-100 overflow-hidden z-50 absolute"
          role="menu"
        >
          {/* Section Tabs Header */}
          <div className="flex border-b border-gray-100 bg-gray-50/60">
            {[
              { key: 'about', label: lang === 'en' ? 'About' : 'Giới thiệu', icon: FiInfo },
              { key: 'products', label: lang === 'en' ? 'Products' : 'Sản phẩm', icon: FiBox },
              { key: 'markets', label: lang === 'en' ? 'Markets' : 'Thị trường', icon: FiGlobe },
              { key: 'news', label: lang === 'en' ? 'News' : 'Tin tức', icon: FiFile },
            ].map((tab) => {
              const isActive = activeKey === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onMouseEnter={() => onSectionEnter(tab.key)}
                  onClick={() => onSectionEnter(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                    isActive
                      ? 'text-primary bg-white border-b-2 border-primary'
                      : 'text-gray-500 hover:text-gray-800 border-b-2 border-transparent'
                  }`}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Section Content */}
          <div className="p-5">
            {/* ─── Section: Giới thiệu ─── */}
            {activeKey === 'about' && (
              <div className="grid grid-cols-2 gap-2">
                {aboutItems.map((item) => (
                  <Link
                    key={item.to}
                    to={`/${lang}${item.to}`}
                    onClick={onClose.immediate}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-100 hover:border-primary/30 hover:bg-gray-50 transition-all"
                  >
                    <div>
                      <h4 className="text-xs font-semibold text-gray-800 group-hover:text-primary transition-colors leading-tight">
                        {item.label}
                      </h4>
                      <p className="text-[11px] text-gray-400 leading-tight mt-0.5">{item.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* ─── Section: Sản phẩm ─── */}
            {activeKey === 'products' && (
              <ProductsSection
                lang={lang}
                mainTrees={mainTrees}
                categories={categories}
                onClose={onClose.immediate}
              />
            )}

            {/* ─── Section: Thị trường ─── */}
            {activeKey === 'markets' && (
              <MarketsSection
                lang={lang}
                markets={markets}
                loading={marketsLoading}
                onClose={onClose.immediate}
              />
            )}

            {/* ─── Section: Tin tức ─── */}
            {activeKey === 'news' && (
              <NewsSection
                lang={lang}
                posts={posts}
                loading={postsLoading}
                onClose={onClose.immediate}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─── Section con: Sản phẩm ───────────────────────────────────────────────────
const ProductsSection = ({ lang, mainTrees, categories, onClose }) => {
  // Always show all industries as separate columns; no toggle
  const gridCols =
    mainTrees.length >= 3
      ? 'grid-cols-3'
      : mainTrees.length === 2
        ? 'grid-cols-2'
        : 'grid-cols-1';

  if (mainTrees.length === 0) {
    return (
      <div className="text-center py-8">
        <FiBox size={32} className="mx-auto text-gray-300 mb-2" />
        <p className="text-sm text-gray-500">
          {lang === 'en' ? 'No products available yet.' : 'Chưa có sản phẩm nào.'}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Industries Grid - each MainTree is its own column */}
      <div className={`grid gap-x-5 gap-y-3 ${gridCols}`}>
        {mainTrees.map((m) => {
          const treeCategories = (categories || []).filter(
            (c) => String(c.mainTree) === String(m._id)
          );
          return (
            <div key={m._id} className="flex flex-col min-w-0">
              {/* Industry Header */}
              <Link
                to={`/${lang}/main-trees/${m._id}`}
                onClick={onClose}
                className="mb-2 pb-1.5 border-b border-gray-200 group"
              >
                <h4 className="text-[11px] font-bold text-gray-800 uppercase tracking-wide group-hover:text-primary transition-colors truncate">
                  {getLocalizedField(m, lang, 'name', 'nameEn')}
                </h4>
              </Link>

              {/* Categories List */}
              {treeCategories.length === 0 ? (
                <p className="text-xs text-gray-400 italic">
                  {lang === 'en'
                    ? 'No categories yet.'
                    : 'Chưa có danh mục.'}
                </p>
              ) : (
                <ul className="space-y-0.5 max-h-[200px] overflow-y-auto">
                  {treeCategories.map((c) => (
                    <li key={c._id}>
                      <Link
                        to={`/${lang}/categories/${c._id}`}
                        onClick={onClose}
                        className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-primary hover:bg-primary/5 -mx-1.5 px-1.5 py-1 rounded transition-colors"
                      >
                        <FiBox size={10} className="opacity-60 flex-shrink-0" />
                        <span className="truncate">{getLocalizedField(c, lang, 'name', 'nameEn')}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
        <Link
          to={`/${lang}/products`}
          onClick={onClose}
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          {lang === 'en' ? 'View all products' : 'Xem tất cả sản phẩm'}
          <FiArrowRight size={12} />
        </Link>
        <span className="text-[10px] text-gray-400">
          {mainTrees.length} {lang === 'en' ? 'industries' : 'ngành'}
        </span>
      </div>
    </div>
  );
};

// ─── Section con: Thị trường ─────────────────────────────────────────────────
const MarketsSection = ({ lang, markets, loading, onClose }) => {
  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
      </div>
    );
  }
  if (markets.length === 0) {
    return (
      <div className="text-center py-10">
        <FiGlobe size={40} className="mx-auto text-gray-300 mb-3" />
        <p className="text-sm text-gray-500">
          {lang === 'en' ? 'No markets available yet.' : 'Chưa có thị trường nào.'}
        </p>
      </div>
    );
  }
  return (
    <div>
      <div className="grid grid-cols-4 gap-3 max-h-[280px] overflow-y-auto">
        {markets.map((m) => (
          <Link
            key={m._id}
            to={`/${lang}/markets/${m._id}`}
            onClick={onClose}
            className="group p-4 rounded-xl border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all text-center"
          >
            <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2 group-hover:bg-primary group-hover:text-white transition-colors">
              <FiGlobe size={20} />
            </div>
            <h4 className="text-xs font-semibold text-gray-900 group-hover:text-primary line-clamp-1">
              {m.title}
            </h4>
            {m.industry?.name && (
              <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">{m.industry.name}</p>
            )}
          </Link>
        ))}
      </div>
      <div className="mt-5 pt-4 border-t border-gray-100 text-center">
        <Link
          to={`/${lang}/markets`}
          onClick={onClose}
          className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
        >
          {lang === 'en' ? 'View all markets' : 'Xem tất cả thị trường'}
          <FiArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
};

// ─── Section con: Tin tức ────────────────────────────────────────────────────
const NewsSection = ({ lang, posts, loading, onClose }) => {
  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
      </div>
    );
  }
  if (posts.length === 0) {
    return (
      <div className="text-center py-10">
        <FiFile size={40} className="mx-auto text-gray-300 mb-3" />
        <p className="text-sm text-gray-500">
          {lang === 'en' ? 'No news available yet.' : 'Chưa có tin tức nào.'}
        </p>
      </div>
    );
  }
  return (
    <div>
      <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
        {posts.map((post) => (
          <Link
            key={post._id}
            to={`/${lang}/news/${post.slug}`}
            onClick={onClose}
            className="group flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {post.thumbnail ? (
              <img
                src={post.thumbnail}
                alt={post.title}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <FiFile size={22} className="text-gray-300" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-medium text-gray-900 group-hover:text-primary line-clamp-2">
                {post.title}
              </h4>
              {post.excerpt && (
                <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">{post.excerpt}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-5 pt-4 border-t border-gray-100 text-center">
        <Link
          to={`/${lang}/news`}
          onClick={onClose}
          className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
        >
          {lang === 'en' ? 'View all news' : 'Xem tất cả tin tức'}
          <FiArrowRight size={12} />
        </Link>
      </div>
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
  const [markets, setMarkets] = useState([]);
  const [marketsLoading, setMarketsLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);

  // Mega menu state
  const [megaOpen, setMegaOpen] = useState(false);
  const [activeKey, setActiveKey] = useState('about');
  const closeTimer = useRef(null);
  const navContainerRef = useRef(null);
  const headerRef = useRef(null);
  const [navRect, setNavRect] = useState(null);

  // Update nav container rect when mega menu opens or on resize
  useEffect(() => {
    const updateRect = () => {
      if (navContainerRef.current && headerRef.current) {
        const navDomRect = navContainerRef.current.getBoundingClientRect();
        const headerDomRect = headerRef.current.getBoundingClientRect();
        setNavRect({
          left: navDomRect.left - headerDomRect.left,
          width: navDomRect.width,
          top: navDomRect.top - headerDomRect.top,
          height: navDomRect.height,
        });
      }
    };

    if (megaOpen) {
      updateRect();
    }

    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, { passive: true });
    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
    };
  }, [megaOpen]);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => {
      setMegaOpen(false);
    }, 150);
  };

  const handleSectionEnter = (key) => {
    setMegaOpen(true);
    setActiveKey(key);
  };

  const handleMegaClose = () => {
    cancelClose();
    setMegaOpen(false);
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
      } else if (e.key === 'Escape' && megaOpen) {
        setMegaOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [searchModalOpen, megaOpen]);

  // Load main trees + categories
  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([
      publicApi.getMainTrees(currentLang),
      publicApi.getCategories({ lang: currentLang, limit: 200 }),
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
    });
    return () => {
      cancelled = true;
    };
  }, [currentLang]);

  // Lazy-load markets + posts when mega menu opens
  useEffect(() => {
    if (!megaOpen) return;
    if (markets.length === 0 && !marketsLoading) {
      setMarketsLoading(true);
      publicApi.getFeaturedMarkets({ lang: currentLang, limit: 8 }).then((res) => {
        setMarkets(res?.data?.data || []);
        setMarketsLoading(false);
      }).catch(() => setMarketsLoading(false));
    }
    if (posts.length === 0 && !postsLoading) {
      setPostsLoading(true);
      publicApi.getPosts({ lang: currentLang, limit: 6 }).then((res) => {
        const data = res?.data?.data;
        setPosts(Array.isArray(data) ? data : data?.items || []);
        setPostsLoading(false);
      }).catch(() => setPostsLoading(false));
    }
  }, [megaOpen, currentLang, markets.length, posts.length, marketsLoading, postsLoading]);

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
  const transparent = isHome && !scrolled && !menuOpen && !searchModalOpen && !megaOpen;

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

  const logoFallbackTextClass = transparent
    ? 'text-base font-semibold text-white truncate'
    : 'text-base font-semibold text-primary truncate';

  const mobileLinkClass = transparent
    ? 'py-2 px-1 text-sm text-white/90 hover:text-white hover:bg-white/10'
    : 'py-2 px-1 text-sm text-gray-700 hover:text-primary hover:bg-gray-50';

  const aboutItems = currentLang === 'en'
    ? [
        { icon: FiInfo, label: 'About Us', desc: 'History, mission and vision', to: '/about' },
        { icon: FiMapPin, label: 'Locations', desc: 'Offices and branches', to: '/about/locations' },
      ]
    : [
        { icon: FiInfo, label: 'Về chúng tôi', desc: 'Lịch sử, sứ mệnh và tầm nhìn', to: '/about' },
        { icon: FiMapPin, label: 'Địa điểm', desc: 'Văn phòng và chi nhánh', to: '/about/locations' },
      ];

  // onClose object for MegaMenuPanel
  const megaCloseHandlers = {
    cancel: cancelClose,
    schedule: scheduleClose,
    immediate: handleMegaClose,
  };

  return (
    <motion.header
      ref={headerRef}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`${headerBase} ${headerTheme} relative`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div
          className="grid grid-cols-12 items-center gap-3 h-16"
        >
          {/* Logo */}
          <div className="col-span-4 md:col-span-3 flex items-center">
            <Link to={`/${currentLang}`} className="flex items-center gap-2 min-w-0">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Tungviet"
                  className="h-10 w-auto max-w-[140px] object-contain"
                />
              ) : (
                <>
                  <span className="text-xl shrink-0">🏭</span>
                  <span className={logoFallbackTextClass}>Tungviet</span>
                </>
              )}
            </Link>
          </div>

          {/* Nav Triggers */}
          <MegaMenuTriggers
            activeKey={activeKey}
            onSectionEnter={handleSectionEnter}
            transparent={transparent}
            lang={currentLang}
            containerRef={navContainerRef}
          />

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

        {/* ─── Mega Menu Dropdown (positioned relative to header) ─── */}
        <MegaMenuPanel
          open={megaOpen}
          activeKey={activeKey}
          onClose={megaCloseHandlers}
          onSectionEnter={handleSectionEnter}
          lang={currentLang}
          aboutItems={aboutItems}
          mainTrees={mainTrees}
          categories={categories}
          markets={markets}
          marketsLoading={marketsLoading}
          posts={posts}
          postsLoading={postsLoading}
          containerRect={navRect}
        />

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
