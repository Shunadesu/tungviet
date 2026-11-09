import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FiArrowLeft,
  FiBox,
  FiArrowRight,
  FiChevronDown,
  FiZap,
  FiSend,
  FiFilter,
  FiX,
} from 'react-icons/fi';
import publicApi from '../api/publicApi';
import { getLocalizedField } from '../utils/i18nField';
import { SUPPORTED_LOCALES } from '../i18n';
import PageHero from '../components/PageHero';
import MarketDetailTabs from '../components/MarketDetailTabs';
import MarketSubDocTable from '../components/MarketSubDocTable';
import MarketSubDocModal from '../components/MarketSubDocModal';
import MarketProductRow from '../components/MarketProductRow';
import EmptyState from '../components/EmptyState';
import SEO from '../components/SEO';
import { htmlToText } from '../utils/html';
import { useSiteConfig } from '../context/SiteConfigContext';
import { buildMarketJsonLd } from '../utils/jsonLd';
import Skeleton from '../components/Skeleton';
import ErrorState from '../components/ErrorState';

const PAGE_SIZE = 20;

const SORT_OPTIONS = [
  { id: 'newest', labelKey: 'product.sort.newest' },
  { id: 'popularity', labelKey: 'product.sort.popular' },
  { id: 'name_asc', labelKey: 'product.sort.nameAsc' },
];

/** Header gọn dùng chung cho các panel (Công nghệ / Ứng dụng). */
const PanelHeader = ({ title, count, countLabel, icon: Icon }) => (
  <div className="flex items-center gap-2.5 mb-4">
    {Icon && (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary-50 text-primary flex-shrink-0">
        <Icon size={15} />
      </span>
    )}
    <div className="min-w-0">
      <h2 className="text-base md:text-lg font-bold text-slate-900 tracking-tight leading-tight">
        {title}
      </h2>
      {Number.isFinite(count) && count > 0 && (
        <p className="text-xs text-slate-500 mt-0.5">
          {count} {countLabel}
        </p>
      )}
    </div>
  </div>
);

const MarketDetail = () => {
  const { t, i18n } = useTranslation();
  const { id, lang: urlLang } = useParams();
  const lang = SUPPORTED_LOCALES.includes(urlLang) ? urlLang : 'vi';
  const isEN = i18n.language === 'en';
  const { footer: siteFooter } = useSiteConfig();
  const siteConfigLite = { footer: siteFooter };
  const [market, setMarket] = useState(null);
  const [products, setProducts] = useState([]);
  const [productsTotal, setProductsTotal] = useState(0);
  const [productsPage, setProductsPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [sortBy, setSortBy] = useState('newest');
  const [sortOpen, setSortOpen] = useState(false);
  const [techFilter, setTechFilter] = useState('');
  const [appFilter, setAppFilter] = useState('');
  const [selectedSubDoc, setSelectedSubDoc] = useState(null);
  const [selectedKind, setSelectedKind] = useState('technology');

  /* ── Market detail ───────────────────────────────────────────────────── */
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setNotFound(false);
    document.title = `${t('common.loading')} | Tungviet`;

    publicApi
      .getMarketTree(id, lang)
      .then((r) => {
        if (!mounted) return;
        const data = r.data?.data;
        if (!data) {
          setNotFound(true);
          return;
        }
        setMarket(data);
        const name = getLocalizedField(data, lang, 'title', 'titleEn');
        document.title = `${name} | ${t('market.title')}`;
      })
      .catch((err) => {
        if (!mounted) return;
        if (err?.response?.status === 404) setNotFound(true);
        console.warn('[MarketDetail] getMarketTree failed:', err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
      document.title = t('seo.defaultTitle');
    };
  }, [id, lang, t]);

  /* ── Products (server-side filter + pagination) ─────────────────────── */
  useEffect(() => {
    let mounted = true;
    setLoadingProducts(true);

    const params = {
      lang,
      market: id,
      limit: PAGE_SIZE,
      page: productsPage,
      sort: sortBy,
    };
    if (techFilter) params.technology = techFilter;
    if (appFilter) params.application = appFilter;

    publicApi
      .getProducts(params)
      .then((r) => {
        if (!mounted) return;
        const payload = r.data?.data;
        const items = Array.isArray(payload) ? payload : payload?.items || [];
        // `apiResponse.paginated` đặt pagination ở cấp gốc response.
        const pg = r.data?.pagination || r.data?.data?.pagination;
        const total = pg?.total;
        setProducts((prev) =>
          productsPage === 1 ? items : [...prev, ...items]
        );
        setProductsTotal(Number.isFinite(total) ? total : items.length);
      })
      .catch((err) => {
        console.warn('[MarketDetail] getProducts failed:', err);
      })
      .finally(() => {
        if (mounted) setLoadingProducts(false);
      });

    return () => {
      mounted = false;
    };
  }, [id, lang, sortBy, techFilter, appFilter, productsPage]);

  const tabs = useMemo(
    () => [
      { id: 'overview', label: t('market.tabs.overview') },
      { id: 'technologies', label: t('market.tabs.technologies') },
      { id: 'applications', label: t('market.tabs.applications') },
      { id: 'products', label: t('market.tabs.products') },
    ],
    [t]
  );

  const technologies = useMemo(
    () => (Array.isArray(market?.technologies) ? market.technologies : []),
    [market]
  );
  const applications = useMemo(
    () => (Array.isArray(market?.applications) ? market.applications : []),
    [market]
  );

  const counts = useMemo(() => {
    if (!market) return {};
    return {
      overview: undefined,
      technologies: technologies.length,
      applications: applications.length,
      products: productsTotal,
    };
  }, [market, technologies, applications, productsTotal]);

  const handleLoadMore = useCallback(() => {
    setProductsPage((p) => p + 1);
  }, []);

  /** Chuyển sang tab Sản phẩm và áp dụng bộ lọc tương ứng. */
  const showProductsFor = useCallback((type, subDoc) => {
    if (type === 'technology') {
      setTechFilter(String(subDoc._id));
      setAppFilter('');
    } else {
      setAppFilter(String(subDoc._id));
      setTechFilter('');
    }
    setProductsPage(1);
    setActiveTab('products');
  }, []);

  const clearFilters = useCallback(() => {
    setTechFilter('');
    setAppFilter('');
    setProductsPage(1);
  }, []);

  const activeSort = SORT_OPTIONS.find((s) => s.id === sortBy) || SORT_OPTIONS[0];

  const activeTech = useMemo(
    () => technologies.find((tech) => String(tech._id) === techFilter) || null,
    [technologies, techFilter]
  );
  const activeApp = useMemo(
    () => applications.find((app) => String(app._id) === appFilter) || null,
    [applications, appFilter]
  );

  if (loading) {
    return <Skeleton.MarketDetail />;
  }

  if (notFound || !market) {
    return (
      <ErrorState
        variant="notFound"
        icon={FiBox}
        title={t('market.notFound')}
        description={
          isEN
            ? 'This market may have been removed or the link is incorrect.'
            : 'Thị trường này có thể đã được gỡ hoặc liên kết không chính xác.'
        }
        action={
          <Link
            to={`/${lang}/markets`}
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
          >
            ← {t('market.backToList')}
          </Link>
        }
      />
    );
  }

  const name = getLocalizedField(market, lang, 'title', 'titleEn');
  const description = getLocalizedField(market, lang, 'description', 'descriptionEn');

  const breadcrumb = [
    { label: t('market.breadcrumbHome'), to: `/${lang}` },
    { label: t('market.breadcrumbMarkets'), to: `/${lang}/markets` },
    { label: name },
  ];

  const seoDescription = htmlToText(description || `${name} - Tungviet`).slice(0, 200);

  return (
    <div className="pb-20 md:pb-24">
      <SEO
        title={name}
        description={seoDescription}
        keywords={`${name}, rosin, resin, industrial, Tungviet`}
        url={`/${lang}/markets/${market._id}`}
        type="website"
        image={market.imageUrl}
        breadcrumb={breadcrumb}
        jsonLd={buildMarketJsonLd(market, {
          lang,
          url: `/${lang}/markets/${market._id}`,
          siteConfig: siteConfigLite,
        })}
      />

      <PageHero
        title={name}
        subtitle={description}
        breadcrumb={breadcrumb}
      />

      {market.imageUrl && (
        <section className="container-page -mt-4 mb-6">
          <div className="max-w-3xl mx-auto rounded-xl overflow-hidden shadow-card aspect-banner bg-gray-100">
            <img
              src={market.imageUrl}
              alt={name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </section>
      )}

      <MarketDetailTabs
        tabs={tabs}
        activeId={activeTab}
        onChange={setActiveTab}
        counts={counts}
      />

      <AnimatePresence mode="wait">
        {/* Overview panel */}
        {activeTab === 'overview' && (
          <motion.section
            key="overview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="container-page py-8 md:py-10"
          >
            <Link
              to={`/${lang}/markets`}
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
            >
              <FiArrowLeft size={14} />
              {t('market.backToList')}
            </Link>

            {description && (
              <div className="prose prose-base max-w-none text-slate-700 leading-relaxed mb-5">
                <p>{description}</p>
              </div>
            )}

            {market.introductions?.vi || market.introductions?.en ? (
              <div className="prose prose-base max-w-none text-slate-700 leading-relaxed mb-6 border-l-4 border-primary-200 pl-4 bg-primary-50/30 rounded-r-lg py-3">
                <div
                  className="font-medium"
                  dangerouslySetInnerHTML={{
                    __html: getLocalizedField(
                      market.introductions,
                      lang,
                      'vi',
                      'en'
                    ),
                  }}
                />
              </div>
            ) : null}

            {/* Quote callout — drives the lead-gen journey */}
            <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-700 text-white rounded-xl p-5 md:p-6 mb-5 shadow-card">
              <div
                aria-hidden="true"
                className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none"
              />
              <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-3 md:gap-4">
                  <span className="hidden md:inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex-shrink-0">
                    <FiZap size={22} aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold mb-1">
                      {t('market.quoteCallout.title')}
                    </h3>
                    <p className="text-sm text-white/85 leading-relaxed max-w-xl">
                      {t('market.quoteCallout.subtitle', { market: name })}
                    </p>
                  </div>
                </div>
                <Link
                  to={`/${lang}/quote?market=${market._id}`}
                  className="inline-flex items-center gap-2 bg-white text-primary font-semibold px-5 py-2.5 rounded-lg hover:bg-white/90 transition-colors flex-shrink-0 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
                >
                  <FiSend size={14} aria-hidden="true" />
                  {t('market.quoteCallout.cta')}
                </Link>
              </div>
            </div>

            {/* Featured products CTA — drives traffic to the products tab */}
            <div className="bg-gradient-to-r from-primary-50 to-primary-100/60 rounded-xl p-5 md:p-6 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-slate-900 mb-1">
                  {t('market.productsInMarket')}
                </h3>
                <p className="text-sm text-slate-600">
                  {t('market.featuredProducts')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('products')}
                className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                {t('common.viewAll')}
                <FiArrowRight size={14} aria-hidden="true" />
              </button>
            </div>
          </motion.section>
        )}

        {/* Technologies panel */}
        {activeTab === 'technologies' && (
          <motion.section
            key="technologies"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="container-page py-8 md:py-10"
          >
            <PanelHeader
              title={t('market.tabs.technologies')}
              count={technologies.length}
              countLabel={t('market.techCountLabel')}
              icon={FiZap}
            />
            {technologies.length === 0 ? (
              <EmptyState icon={FiBox} title={t('market.noTechnologies')} />
            ) : (
              <MarketSubDocTable
                items={technologies}
                variant="technology"
                lang={lang}
                onSelect={(item) => {
                  setSelectedKind('technology');
                  setSelectedSubDoc(item);
                }}
              />
            )}
          </motion.section>
        )}

        {/* Applications panel — each card links to the filtered product list. */}
        {activeTab === 'applications' && (
          <motion.section
            key="applications"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="container-page py-8 md:py-10"
          >
            <PanelHeader
              title={t('market.tabs.applications')}
              count={applications.length}
              countLabel={t('market.appCountLabel')}
              icon={FiBox}
            />
            {applications.length === 0 ? (
              <EmptyState icon={FiBox} title={t('market.noApplications')} />
            ) : (
              <MarketSubDocTable
                items={applications}
                variant="application"
                lang={lang}
                onSelect={(item) => {
                  setSelectedKind('application');
                  setSelectedSubDoc(item);
                }}
              />
            )}
          </motion.section>
        )}

        {/* Products panel — filter by technology / application + sort */}
        {activeTab === 'products' && (
          <motion.section
            key="products"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="container-page py-8 md:py-10"
          >
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base md:text-lg font-bold text-slate-900 tracking-tight">
                  {t('market.tabs.products')}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('market.productCount', { count: productsTotal })}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Technology filter */}
                {technologies.length > 0 && (
                  <div className="relative">
                    <select
                      value={techFilter}
                      onChange={(e) => {
                        setTechFilter(e.target.value);
                        setAppFilter('');
                        setProductsPage(1);
                      }}
                      aria-label={t('market.filters.technology')}
                      className="appearance-none pl-3 pr-8 py-2 text-xs font-medium text-slate-700 bg-white border border-gray-200 rounded-lg cursor-pointer transition-colors hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                      <option value="">{t('market.filters.technologyAll')}</option>
                      {technologies.map((tech) => (
                        <option key={tech._id} value={tech._id}>
                          {getLocalizedField(tech, lang, 'title', 'titleEn')}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown
                      size={12}
                      aria-hidden="true"
                      className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </div>
                )}

                {/* Application filter */}
                {applications.length > 0 && (
                  <div className="relative">
                    <select
                      value={appFilter}
                      onChange={(e) => {
                        setAppFilter(e.target.value);
                        setTechFilter('');
                        setProductsPage(1);
                      }}
                      aria-label={t('market.filters.application')}
                      className="appearance-none pl-3 pr-8 py-2 text-xs font-medium text-slate-700 bg-white border border-gray-200 rounded-lg cursor-pointer transition-colors hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                      <option value="">{t('market.filters.applicationAll')}</option>
                      {applications.map((app) => (
                        <option key={app._id} value={app._id}>
                          {getLocalizedField(app, lang, 'title', 'titleEn')}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown
                      size={12}
                      aria-hidden="true"
                      className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </div>
                )}

                {/* Sort */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setSortOpen((o) => !o)}
                    aria-haspopup="listbox"
                    aria-expanded={sortOpen}
                    className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:border-primary-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    <span className="text-slate-500">{t('product.sort.label')}:</span>
                    <span>{t(activeSort.labelKey)}</span>
                    <FiChevronDown
                      size={14}
                      aria-hidden="true"
                      className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {sortOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setSortOpen(false)}
                      />
                      <div
                        role="listbox"
                        className="absolute right-0 mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden min-w-[180px]"
                      >
                        {SORT_OPTIONS.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            role="option"
                            aria-selected={sortBy === opt.id}
                            onClick={() => {
                              setSortBy(opt.id);
                              setSortOpen(false);
                              setProductsPage(1);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs hover:bg-primary-50 transition-colors focus:outline-none focus:bg-primary-50 ${
                              sortBy === opt.id
                                ? 'bg-primary-50 text-primary font-semibold'
                                : 'text-slate-700'
                            }`}
                          >
                            {t(opt.labelKey)}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Active filter chip */}
            {(activeTech || activeApp) && (
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                  <FiFilter size={11} />
                  {t('market.filters.active')}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium">
                  {getLocalizedField(
                    activeTech || activeApp,
                    lang,
                    'title',
                    'titleEn'
                  )}
                  <button
                    type="button"
                    onClick={clearFilters}
                    aria-label={t('market.filters.clear')}
                    className="inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-primary-100 transition-colors"
                  >
                    <FiX size={11} />
                  </button>
                </span>
              </div>
            )}

            {products.length === 0 && !loadingProducts ? (
              <EmptyState icon={FiBox} title={t('market.noProducts')} />
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  {products.map((product, idx) => (
                    <MarketProductRow key={product._id} product={product} index={idx} />
                  ))}
                </div>

                {loadingProducts && products.length === 0 && (
                  <div className="flex justify-center py-8">
                    <span className="inline-block w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}

                {products.length < productsTotal && (
                  <div className="mt-6 text-center">
                    <button
                      type="button"
                      onClick={handleLoadMore}
                      disabled={loadingProducts}
                      aria-busy={loadingProducts}
                      className="inline-flex items-center gap-2 bg-white border border-primary-200 text-primary px-6 py-2.5 rounded-lg font-semibold hover:bg-primary hover:text-white transition-colors disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    >
                      {loadingProducts ? (
                        <>
                          <span className="inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          {t('common.loading')}
                        </>
                      ) : (
                        <>
                          {t('common.loadMore')}
                          <FiArrowRight size={14} aria-hidden="true" />
                        </>
                      )}
                    </button>
                  </div>
                )}

                {products.length >= productsTotal && productsTotal > PAGE_SIZE && (
                  <p className="mt-6 text-center text-xs text-slate-400">
                    {isEN
                      ? `You've viewed all ${products.length} products`
                      : `Bạn đã xem hết ${products.length} sản phẩm`}
                  </p>
                )}
              </>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      {/* Sticky bottom CTA — persists across tabs */}
      <div className="fixed bottom-0 inset-x-0 z-30 pointer-events-none">
        <div className="container-page pb-3 md:pb-4">
          <div
            role="region"
            aria-label={isEN ? 'Quick actions for this market' : 'Hành động nhanh cho thị trường này'}
            className="pointer-events-auto bg-white/90 backdrop-blur border border-primary-100 rounded-xl shadow-card px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap"
          >
            <div className="min-w-0">
              <p className="text-xs text-slate-500">
                {isEN ? 'Interested in this market?' : 'Quan tâm tới thị trường này?'}
              </p>
              <p className="text-sm font-semibold text-slate-900 truncate">
                {name}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                to={`/${lang}/products?market=${id}`}
                className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                {t('market.viewAllProducts')}
              </Link>
              <Link
                to={`/${lang}/quote?market=${market._id}`}
                className="inline-flex items-center gap-2 bg-primary text-white text-xs font-semibold px-4 py-2.5 rounded-lg hover:bg-primary-700 transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <FiSend size={12} aria-hidden="true" />
                {isEN ? 'Request quote' : 'Yêu cầu báo giá'}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modal chi tiết cho công nghệ / ứng dụng */}
      <MarketSubDocModal
        item={selectedSubDoc}
        variant={selectedKind}
        lang={lang}
        onClose={() => setSelectedSubDoc(null)}
        onShowProducts={(item) =>
          showProductsFor(
            selectedKind === 'technology' ? 'technology' : 'application',
            item
          )
        }
      />
    </div>
  );
};

export default MarketDetail;
