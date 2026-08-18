import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiGrid,
  FiList,
  FiSearch,
  FiFilter,
  FiX,
  FiBox,
  FiArrowRight,
} from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import ProductCard from '../components/ProductCard';
import PageHero from '../components/PageHero';
import ProductFilterSidebar from '../components/ProductFilterSidebar';
import ActiveFilterChips from '../components/ActiveFilterChips';
import EmptyState from '../components/EmptyState';
import LoadMore from '../components/LoadMore';
import SEO from '../components/SEO';
import publicApi from '../api/publicApi';
import useProductFilters from '../hooks/useProductFilters';
import useDebounce from '../hooks/useDebounce';
import { getLocalizedField } from '../utils/i18nField';
import { SUPPORTED_LOCALES } from '../i18n';

const SOFTENING_RANGES = [
  { value: '', label: '—' },
  { value: '<80', label: '< 80°C' },
  { value: '80-100', label: '80 – 100°C' },
  { value: '100-120', label: '100 – 120°C' },
  { value: '>120', label: '> 120°C' },
];

const PAGE_SIZE = 24;

const ProductList = () => {
  const { t, i18n } = useTranslation();
  const lang = SUPPORTED_LOCALES.includes(i18n.language) ? i18n.language : 'vi';

  const { values, setParam, clearAll, activeCount, getShareUrl } = useProductFilters();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mainTrees, setMainTrees] = useState([]);
  const [categories, setCategories] = useState([]);
  const [marketTrees, setMarketTrees] = useState([]);

  const search = values.search;
  const sort = values.sort;
  const page = Math.max(1, parseInt(values.page, 10) || 1);

  // Local input state for debounced search
  const [searchInput, setSearchInput] = useState(search || '');
  const debouncedSearch = useDebounce(searchInput, 400);

  // Sync URL ?q=... → local input (e.g. when arriving from header search)
  useEffect(() => {
    setSearchInput(search || '');
  }, [search]);

  // Push debounced value → URL
  useEffect(() => {
    if (debouncedSearch !== search) {
      setParam('q', debouncedSearch);
    }
  }, [debouncedSearch]);

  // Reset to page 1 whenever any filter other than page changes
  useEffect(() => {
    if (page !== 1) setParam('page', 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sort, values.industries, values.category, values.market, values.softeningPoint]);

  // Fetch mainTrees + categories + markets for chip labels + UI hints
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      publicApi.getMainTrees(lang).catch(() => null),
      publicApi.getCategories({ lang }).catch(() => null),
      publicApi.getMarketTrees({ lang }).catch(() => null),
    ]).then(([mtRes, catRes, mktRes]) => {
      if (cancelled) return;
      if (mtRes?.data?.data) setMainTrees(Array.isArray(mtRes.data.data) ? mtRes.data.data : []);
      if (catRes?.data?.data) {
        const raw = catRes.data.data;
        setCategories(Array.isArray(raw) ? raw : raw?.items || []);
      }
      if (mktRes?.data?.data) {
        const raw = mktRes.data.data;
        const flat = Array.isArray(raw) ? raw : [];
        const tops = flat.filter((m) => !m.parent);
        setMarketTrees(tops.length ? tops : flat);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [lang]);

  // Fetch products — page 1 replaces, page >1 appends
  useEffect(() => {
    const isFirstPage = page === 1;
    if (isFirstPage) setLoading(true);
    else setLoadingMore(true);

    const params = { lang, page, limit: PAGE_SIZE };
    if (search) params.search = search;
    if (sort) params.sort = sort;
    if (values.industries && values.industries.length > 0) {
      params.industries = values.industries.join(',');
    }
    if (values.category) params.productLine = values.category;
    if (values.market && values.market.length > 0) {
      params.market = values.market.join(',');
    }
    if (values.softeningPoint) params.softeningPoint = values.softeningPoint;

    publicApi
      .getProducts(params)
      .then((res) => {
        const items = Array.isArray(res.data?.data) ? res.data.data : [];
        const pg = res.data?.pagination || { page, total: items.length, pages: 1 };
        if (isFirstPage) setProducts(items);
        else setProducts((prev) => [...prev, ...items]);
        setPagination(pg);
      })
      .catch((err) => {
        console.warn('[ProductList] getProducts failed:', err);
        if (isFirstPage) setProducts([]);
        setPagination({ page: 1, total: 0, pages: 0 });
      })
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
      });
  }, [lang, search, sort, values.industries, values.category, values.market, values.softeningPoint, page]);

  const loadMore = () => {
    if (pagination.page < pagination.pages) {
      setParam('page', String(pagination.page + 1));
      // Smooth scroll to the newly-loaded row
      setTimeout(() => {
        window.scrollBy({ top: 200, behavior: 'smooth' });
      }, 80);
    }
  };

  const clearSearch = () => {
    setSearchInput('');
    setParam('q', '');
  };

  const breadcrumb = useMemo(
    () => [
      { label: t('product.breadcrumbHome'), to: `/${lang}` },
      { label: t('nav.products') },
    ],
    [lang, t]
  );

  // Determine active market context (first market in the filter, if any).
  const activeMarket = useMemo(() => {
    if (!values.market || values.market.length === 0) return null;
    const id = values.market[0];
    const found = marketTrees.find((m) => String(m._id) === String(id));
    return found ? { id, ...found } : { id, name: '', description: '' };
  }, [values.market, marketTrees]);

  // Pick a few other markets to suggest when the current filter has no
  // results. We prefer markets outside the current filter and prefer
  // admin-featured markets first.
  const suggestedMarkets = useMemo(() => {
    if (!marketTrees || marketTrees.length === 0) return [];
    const activeIds = new Set((values.market || []).map(String));
    return [...marketTrees]
      .filter((m) => !activeIds.has(String(m._id)))
      .sort((a, b) => {
        if (a.isFeatured === true && b.isFeatured !== true) return -1;
        if (b.isFeatured === true && a.isFeatured !== true) return 1;
        return 0;
      })
      .slice(0, 3);
  }, [marketTrees, values.market]);

  // Hero copy adapts to the active context so the user always knows why they
  // landed here.
  const heroTitle = (() => {
    if (search) return t('product.searchResultsFor', { q: search });
    if (activeMarket) {
      const name = activeMarket.name || getLocalizedField(activeMarket, lang, 'title', 'titleEn');
      return t('product.marketFilteredTitle', { market: name });
    }
    return t('nav.products');
  })();
  const heroSubtitle = (() => {
    if (search) return t('product.searchResultsSubtitle');
    if (activeMarket) return t('product.marketFilteredSubtitle');
    return t('product.productsSubtitle');
  })();

  const hasMore = pagination.page < pagination.pages;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white min-h-screen"
    >
      <SEO
        title={heroTitle}
        description={t('seo.defaultDescription')}
        keywords={t('seo.defaultKeywords')}
        url={`/${lang}/products`}
        breadcrumb={breadcrumb}
      />

      <PageHero breadcrumb={breadcrumb} title={heroTitle} subtitle={heroSubtitle}>
        {activeMarket && !search && (
          <div className="mb-5">
            <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full ring-1 ring-white/20">
              <FiBox size={12} />
              {t('product.marketFilteredBadge')}
              <Link
                to={`/${lang}/markets/${activeMarket.id}`}
                className="ml-1 underline hover:text-white"
              >
                {t('product.viewMarket')}
                <FiArrowRight className="inline ml-1" size={10} />
              </Link>
            </span>
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
          role="search"
          className="relative max-w-2xl w-full"
        >
          <FiSearch
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('common.search')}
            aria-label={t('common.search')}
            className="w-full pl-11 pr-12 py-3.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-card"
          />
          {searchInput && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label={t('common.clearSearch')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <FiX size={16} />
            </button>
          )}
        </form>
      </PageHero>

      <section className="container-page py-8 md:py-12">
        {/* Sticky toolbar */}
        <div className="sticky top-16 md:top-20 z-20 -mx-4 px-4 py-3 bg-white/85 backdrop-blur border-b border-gray-100 mb-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="md:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium hover:border-primary hover:text-primary transition-colors"
              >
                <FiFilter size={14} />
                {t('product.filter.title')}
                {activeCount > 0 && (
                  <span className="ml-1 badge-primary !text-[10px] !px-1.5 !py-0">
                    {activeCount}
                  </span>
                )}
              </button>
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-slate-900">{pagination.total}</span>{' '}
                {t('product.productsCount', { n: pagination.total })}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sort}
                onChange={(e) => setParam('sort', e.target.value)}
                aria-label={t('product.sort.title')}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 bg-white"
              >
                <option value="">{t('product.sort.default')}</option>
                <option value="name_asc">{t('product.sort.nameAsc')}</option>
                <option value="name_desc">{t('product.sort.nameDesc')}</option>
                <option value="price_asc">{t('product.sort.priceAsc')}</option>
                <option value="price_desc">{t('product.sort.priceDesc')}</option>
                <option value="newest">{t('product.sort.newest')}</option>
                <option value="popularity">{t('product.sort.popular')}</option>
              </select>

              <div className="hidden md:flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                  aria-pressed={viewMode === 'grid'}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-primary text-white'
                      : 'text-gray-500 hover:text-primary'
                  }`}
                >
                  <FiGrid size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                  aria-pressed={viewMode === 'list'}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'list'
                      ? 'bg-primary text-white'
                      : 'text-gray-500 hover:text-primary'
                  }`}
                >
                  <FiList size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Active filter chips */}
        <ActiveFilterChips
          values={values}
          setParam={setParam}
          clearAll={clearAll}
          getShareUrl={getShareUrl}
          mainTrees={mainTrees}
          categories={categories}
          marketTrees={marketTrees}
          softeningPointRanges={SOFTENING_RANGES.filter((r) => r.value)}
        />

        <div className="flex gap-8">
          <ProductFilterSidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            values={values}
            setParam={setParam}
            clearAll={clearAll}
            activeCount={activeCount}
          />

          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-[4/5] skeleton rounded-2xl" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <>
                <EmptyState
                  icon={FiSearch}
                  title={t('product.noResults')}
                  description={
                    search
                      ? t('product.searchResultsSubtitle')
                      : t('product.noResultsHint')
                  }
                  action={
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button type="button" onClick={clearAll} className="btn-secondary">
                        {t('product.filter.clearAll')}
                      </button>
                      {activeMarket && (
                        <Link
                          to={`/${lang}/markets/${activeMarket.id}`}
                          className="btn-primary"
                        >
                          {t('product.viewMarket')}
                        </Link>
                      )}
                    </div>
                  }
                />

                {suggestedMarkets.length > 0 && (
                  <div className="mt-10">
                    <h3 className="text-sm font-semibold text-slate-900 mb-3 text-center">
                      {t('product.suggestMarketsTitle')}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {suggestedMarkets.map((m) => {
                        const name = getLocalizedField(m, lang, 'title', 'titleEn');
                        return (
                          <Link
                            key={m._id}
                            to={`/${lang}/markets/${m._id}`}
                            className="group flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all"
                          >
                            <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary-50 text-primary flex-shrink-0">
                              <FiBox size={18} />
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-primary transition-colors">
                                {name}
                              </p>
                              {m.isFeatured === true && (
                                <p className="text-[10px] text-amber-600 font-medium uppercase tracking-wider">
                                  {t('product.featuredTag')}
                                </p>
                              )}
                            </div>
                            <FiArrowRight
                              size={14}
                              className="text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0"
                            />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6'
                      : 'space-y-4'
                  }
                >
                  {products.map((product, index) => (
                    <ProductCard key={product._id} product={product} index={index} />
                  ))}
                </div>
                <LoadMore
                  hasMore={hasMore}
                  loading={loadingMore}
                  onLoad={loadMore}
                  label={t('product.loadMore')}
                />
              </>
            )}
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default ProductList;
