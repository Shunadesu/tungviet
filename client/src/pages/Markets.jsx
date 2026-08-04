import { useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiPackage } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import PageHero from '../components/PageHero';
import EmptyState from '../components/EmptyState';
import MarketCard from '../components/MarketCard';
import Pagination from '../components/Pagination';
import useMarkets from '../hooks/useMarkets';
import { SUPPORTED_LOCALES } from '../i18n';

const Markets = () => {
  const { t, i18n } = useTranslation();
  const lang = SUPPORTED_LOCALES.includes(i18n.language) ? i18n.language : 'vi';
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSearch = searchParams.get('q') || '';
  const initialSort = searchParams.get('sort') || '';

  const {
    markets,
    total,
    totalPages,
    page,
    pageSize,
    loading,
    search,
    sort,
    setSearch,
    setSort,
    setPage,
  } = useMarkets({ lang, initialSearch, initialSort });

  const gridRef = useRef(null);
  const isFirstRender = useRef(true);

  // Sync URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (sort) params.set('sort', sort);
    if (page > 1) params.set('page', String(page));
    setSearchParams(params, { replace: true });
  }, [search, sort, page, setSearchParams]);

  // Scroll to top of grid on page change (skip first render)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (page > 1 && gridRef.current) {
      const top =
        gridRef.current.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = e.target.search.value.trim();
    setSearch(q);
  };

  const breadcrumb = [
    { label: t('market.breadcrumbHome'), to: `/${lang}` },
    { label: t('market.breadcrumbMarkets') },
  ];

  const heroTitle = search
    ? t('market.searchResultsTitle', { q: search })
    : t('market.title');
  const heroSubtitle = search
    ? t('market.searchResultsSubtitle')
    : t('market.subtitle');

  const hasResults = !loading && markets.length > 0;
  const isFiltered = Boolean(search || sort);
  const isEmptyAll = !loading && total === 0 && !isFiltered;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white min-h-screen"
    >
      <SEO
        title={heroTitle}
        description={heroSubtitle}
        url={`/${lang}/markets`}
      />

      <PageHero
        breadcrumb={breadcrumb}
        title={heroTitle}
        subtitle={heroSubtitle}
        align="center"
      >
        <form
          onSubmit={handleSearchSubmit}
          className="relative max-w-2xl w-full mx-auto"
        >
          <FiSearch
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder={t('market.searchPlaceholder')}
            className="w-full pl-11 pr-32 py-3.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-card"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary !py-2 !px-4 !rounded-lg !text-xs"
          >
            {t('common.search')}
          </button>
        </form>
      </PageHero>

      <section className="container-page py-10 md:py-14" ref={gridRef}>
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{total}</span>{' '}
            {t('market.cardsCount', { n: total })}
          </p>

          <div className="flex items-center gap-2">
            <label
              htmlFor="markets-sort"
              className="hidden sm:inline-block text-xs font-medium text-slate-500"
            >
              {t('market.sort.label')}
            </label>
            <select
              id="markets-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 bg-white"
            >
              <option value="">{t('market.sort.default')}</option>
              <option value="newest">{t('market.sort.newest')}</option>
              <option value="name_asc">{t('market.sort.nameAsc')}</option>
            </select>
          </div>
        </div>

        {/* Active filter chip */}
        {isFiltered && !loading && total > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-5">
            {search && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary-50 text-primary text-xs font-medium">
                <FiSearch size={11} />
                {search}
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSort('');
              }}
              className="text-xs text-primary hover:underline font-medium"
            >
              {t('market.filter.clearAll')}
            </button>
          </div>
        )}

        {/* Body */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 items-stretch">
            {Array.from({ length: pageSize }).map((_, i) => (
              <div key={i} className="card overflow-hidden flex flex-col h-full">
                <div className="aspect-[16/10] skeleton !rounded-none" />
                <div className="p-5 space-y-3">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="flex gap-1.5">
                    <div className="skeleton h-5 w-20" />
                    <div className="skeleton h-5 w-20" />
                  </div>
                  <div className="skeleton h-3 w-full" />
                  <div className="skeleton h-3 w-5/6" />
                  <div className="skeleton h-4 w-24 mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : isEmptyAll ? (
          <EmptyState
            icon={FiPackage}
            title={t('market.noMarkets')}
            description={t('market.noMarketsHint')}
          />
        ) : total === 0 ? (
          <EmptyState
            icon={FiSearch}
            title={t('market.noResults')}
            description={t('market.noResultsHint')}
            action={
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSort('');
                }}
                className="btn-secondary"
              >
                {t('market.filter.clearAll')}
              </button>
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 items-stretch">
              {markets.map((market, index) => (
                <MarketCard
                  key={market._id != null ? String(market._id) : `market-${index}`}
                  market={market}
                  lang={lang}
                  index={index}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </section>
    </motion.div>
  );
};

export default Markets;