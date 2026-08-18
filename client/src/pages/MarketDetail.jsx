import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiArrowLeft, FiBox, FiArrowRight, FiChevronDown, FiZap, FiSend } from 'react-icons/fi';
import publicApi from '../api/publicApi';
import { getLocalizedField } from '../utils/i18nField';
import { SUPPORTED_LOCALES } from '../i18n';
import PageHero from '../components/PageHero';
import MarketDetailTabs from '../components/MarketDetailTabs';
import MarketAppCard from '../components/MarketAppCard';
import MarketTechCard from '../components/MarketTechCard';
import ProductCard from '../components/ProductCard';
import SectionHeader from '../components/SectionHeader';
import EmptyState from '../components/EmptyState';

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { id: 'newest', labelKey: 'product.sort.newest' },
  { id: 'popularity', labelKey: 'product.sort.popular' },
  { id: 'name_asc', labelKey: 'product.sort.nameAsc' },
];

const MarketDetail = () => {
  const { t, i18n } = useTranslation();
  const { id, lang: urlLang } = useParams();
  const lang = SUPPORTED_LOCALES.includes(urlLang) ? urlLang : 'vi';
  const isEN = i18n.language === 'en';
  const [market, setMarket] = useState(null);
  const [products, setProducts] = useState([]);
  const [productsTotal, setProductsTotal] = useState(0);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [sortBy, setSortBy] = useState('newest');
  const [sortOpen, setSortOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setNotFound(false);
    setProducts([]);
    setVisibleCount(PAGE_SIZE);
    document.title = `${t('common.loading')} | Tungviet`;

    const fetchMarket = publicApi
      .getMarketTree(id, lang)
      .then((r) => {
        if (!mounted) return null;
        const data = r.data?.data;
        if (!data) {
          setNotFound(true);
          return null;
        }
        setMarket(data);
        const name = getLocalizedField(data, lang, 'title', 'titleEn');
        document.title = `${name} | ${t('market.title')}`;
        return data;
      })
      .catch((err) => {
        if (!mounted) return null;
        if (err?.response?.status === 404) setNotFound(true);
        console.warn('[MarketDetail] getMarketTree failed:', err);
        return null;
      });

    const fetchProducts = publicApi
      .getProducts({ lang, market: id, limit: 60, sort: sortBy })
      .then((r) => {
        if (!mounted) return null;
        const payload = r.data?.data;
        const items = Array.isArray(payload) ? payload : payload?.items || [];
        const total = payload?.pagination?.total;
        setProducts(items);
        setProductsTotal(Number.isFinite(total) ? total : items.length);
        return items;
      })
      .catch((err) => {
        console.warn('[MarketDetail] getProducts failed:', err);
        return null;
      });

    Promise.all([fetchMarket, fetchProducts]).finally(() => {
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      document.title = t('seo.defaultTitle');
    };
  }, [id, lang, sortBy, t]);

  const tabs = useMemo(
    () => [
      { id: 'overview', label: t('market.tabs.overview') },
      { id: 'technologies', label: t('market.tabs.technologies') },
      { id: 'applications', label: t('market.tabs.applications') },
      { id: 'products', label: t('market.tabs.products') },
    ],
    [t]
  );

  const counts = useMemo(() => {
    if (!market) return {};
    return {
      overview: undefined,
      technologies: Array.isArray(market.technologies) ? market.technologies.length : 0,
      applications: Array.isArray(market.applications) ? market.applications.length : 0,
      products: productsTotal,
    };
  }, [market, productsTotal]);

  const visibleProducts = useMemo(
    () => products.slice(0, visibleCount),
    [products, visibleCount]
  );

  const handleLoadMore = useCallback(() => {
    setLoadingMore(true);
    // Small artificial delay keeps the spinner visible and avoids layout jump.
    setTimeout(() => {
      setVisibleCount((c) => c + PAGE_SIZE);
      setLoadingMore(false);
    }, 220);
  }, []);

  const activeSort = SORT_OPTIONS.find((s) => s.id === sortBy) || SORT_OPTIONS[0];

  if (loading) {
    return (
      <div className="container-page py-16 md:py-24 text-center">
        <div className="inline-block w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-sm text-gray-500">{t('common.loading')}</p>
      </div>
    );
  }

  if (notFound || !market) {
    return (
      <div className="container-page py-16 md:py-24 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-50 text-primary mb-4">
          <FiBox size={28} />
        </div>
        <h1 className="text-2xl font-semibold text-slate-900 mb-3">
          {t('market.notFound')}
        </h1>
        <Link
          to={`/${lang}/markets`}
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-medium"
        >
          ← {t('market.backToList')}
        </Link>
      </div>
    );
  }

  const name = getLocalizedField(market, lang, 'title', 'titleEn');
  const description = getLocalizedField(market, lang, 'description', 'descriptionEn');
  const technologies = Array.isArray(market.technologies) ? market.technologies : [];
  const applications = Array.isArray(market.applications) ? market.applications : [];

  return (
    <div className="pb-24 md:pb-28">
      <PageHero
        title={name}
        subtitle={description}
        breadcrumb={[
          { label: t('market.breadcrumbHome'), to: `/${lang}` },
          { label: t('market.breadcrumbMarkets'), to: `/${lang}/markets` },
          { label: name },
        ]}
      />

      {market.imageUrl && (
        <section className="container-page -mt-6 mb-8">
          <div className="rounded-2xl overflow-hidden shadow-lg aspect-video bg-gray-100">
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

      {/* Overview panel */}
      {activeTab === 'overview' && (
        <section className="container-page py-10 md:py-14">
          <Link
            to={`/${lang}/markets`}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-6 transition-colors"
          >
            <FiArrowLeft size={14} />
            {t('market.backToList')}
          </Link>

          {description && (
            <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed mb-6">
              <p>{description}</p>
            </div>
          )}

          {market.introductions?.vi || market.introductions?.en ? (
            <div className="prose prose-base max-w-none text-slate-700 leading-relaxed mb-10 border-l-4 border-primary-200 pl-4 bg-primary-50/30 rounded-r-lg py-4">
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
          <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-700 text-white rounded-2xl p-6 md:p-8 mb-6 shadow-card">
            <div
              aria-hidden="true"
              className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none"
            />
            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3 md:gap-4">
                <span className="hidden md:inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex-shrink-0">
                  <FiZap size={22} />
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
                className="inline-flex items-center gap-2 bg-white text-primary font-semibold px-5 py-2.5 rounded-lg hover:bg-white/90 transition-colors flex-shrink-0 shadow-sm"
              >
                <FiSend size={14} />
                {t('market.quoteCallout.cta')}
              </Link>
            </div>
          </div>

          {/* Featured products CTA — drives traffic to the products tab */}
          <div className="bg-gradient-to-r from-primary-50 to-primary-100/60 rounded-2xl p-6 md:p-7 flex items-center justify-between gap-4 flex-wrap">
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
              className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-sm"
            >
              {t('common.viewAll')}
              <FiArrowRight size={14} />
            </button>
          </div>
        </section>
      )}

      {/* Technologies panel */}
      {activeTab === 'technologies' && (
        <section className="container-page py-10 md:py-14">
          <SectionHeader
            eyebrow={t('market.tabs.technologies')}
            title={t('market.tabs.technologies')}
            align="left"
            className="mb-8"
          />
          {technologies.length === 0 ? (
            <EmptyState icon={FiBox} title={t('market.noTechnologies')} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {technologies.map((tech, idx) => (
                <MarketTechCard key={tech._id || idx} tech={tech} index={idx} lang={lang} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Applications panel — each card has its own CTA pointing to the
          filtered product list for that application. */}
      {activeTab === 'applications' && (
        <section className="container-page py-10 md:py-14">
          <SectionHeader
            eyebrow={t('market.tabs.applications')}
            title={t('market.tabs.applications')}
            align="left"
            className="mb-8"
          />
          {applications.length === 0 ? (
            <EmptyState icon={FiBox} title={t('market.noApplications')} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {applications.map((app, idx) => (
                <div key={app._id || idx} className="flex flex-col">
                  <MarketAppCard app={app} index={idx} lang={lang} />
                  <Link
                    to={`/${lang}/products?market=${id}`}
                    className="mt-3 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-700 transition-colors"
                  >
                    {t('market.viewAllProducts')}
                    <FiArrowRight size={12} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Products panel — sort + load more */}
      {activeTab === 'products' && (
        <section className="container-page py-10 md:py-14">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">
                {t('market.tabs.products')}
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                {t('market.tabs.products')}
              </h2>
              {productsTotal > 0 && (
                <p className="text-sm text-slate-500 mt-1">
                  {t('market.productCount', { count: productsTotal })}
                </p>
              )}
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setSortOpen((o) => !o)}
                className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:border-primary-300 transition-colors"
              >
                <span className="text-slate-500">{t('product.sort.label')}:</span>
                <span>{t(activeSort.labelKey)}</span>
                <FiChevronDown
                  size={14}
                  className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {sortOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setSortOpen(false)}
                  />
                  <div className="absolute right-0 mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden min-w-[180px]">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setSortBy(opt.id);
                          setSortOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-primary-50 transition-colors ${
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

          {products.length === 0 ? (
            <EmptyState icon={FiBox} title={t('market.noProducts')} />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
                {visibleProducts.map((product, idx) => (
                  <ProductCard key={product._id} product={product} index={idx} />
                ))}
              </div>
              {visibleCount < products.length && (
                <div className="mt-10 text-center">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="inline-flex items-center gap-2 bg-white border border-primary-200 text-primary px-6 py-2.5 rounded-lg font-semibold hover:bg-primary hover:text-white transition-colors disabled:opacity-60"
                  >
                    {loadingMore ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        {t('common.loading')}
                      </>
                    ) : (
                      <>
                        {t('common.loadMore')}
                        <FiArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              )}
              {visibleCount >= products.length && products.length > PAGE_SIZE && (
                <p className="mt-6 text-center text-xs text-slate-400">
                  {isEN
                    ? `You've viewed all ${products.length} products`
                    : `Bạn đã xem hết ${products.length} sản phẩm`}
                </p>
              )}
            </>
          )}
        </section>
      )}

      {/* Sticky bottom CTA — persists across tabs */}
      <div className="fixed bottom-0 inset-x-0 z-30 pointer-events-none">
        <div className="container-page pb-3 md:pb-4">
          <div className="pointer-events-auto bg-white/90 backdrop-blur border border-primary-100 rounded-2xl shadow-card px-4 md:px-6 py-3 flex items-center justify-between gap-3 flex-wrap">
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
                className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                {t('market.viewAllProducts')}
              </Link>
              <Link
                to={`/${lang}/quote?market=${market._id}`}
                className="inline-flex items-center gap-2 bg-primary text-white text-xs font-semibold px-4 py-2.5 rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
              >
                <FiSend size={12} />
                {isEN ? 'Request quote' : 'Yêu cầu báo giá'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketDetail;