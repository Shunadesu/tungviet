import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid,
  FiList,
  FiSearch,
  FiFilter,
  FiX,
} from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import ProductCard from '../components/ProductCard';
import PageHero from '../components/PageHero';
import ProductFilterSidebar from '../components/ProductFilterSidebar';
import EmptyState from '../components/EmptyState';
import SEO from '../components/SEO';
import publicApi from '../api/publicApi';
import useProductFilters from '../hooks/useProductFilters';
import { SUPPORTED_LOCALES } from '../i18n';

const ProductList = () => {
  const { t, i18n } = useTranslation();
  const lang = SUPPORTED_LOCALES.includes(i18n.language) ? i18n.language : 'vi';

  const [searchParams, setSearchParams] = useSearchParams();
  const { values, setParam, clearAll, activeCount } = useProductFilters();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const search = values.search;
  const sort = values.sort;

  useEffect(() => {
    setLoading(true);
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sort, values.market, values.category, values.softeningPoint, lang]);

  const fetchProducts = async () => {
    try {
      const params = { lang };
      if (search) params.search = search;
      if (sort) params.sort = sort;
      if (values.market) params.market = values.market;
      if (values.category) params.category = values.category;
      if (values.softeningPoint) params.softeningPoint = values.softeningPoint;

      const res = await publicApi.getProducts(params);
      setProducts(res.data?.data || []);
    } catch (error) {
      console.error('Error:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = e.target.search.value.trim();
    setParam('q', q);
  };

  const breadcrumb = [
    { label: t('product.breadcrumbHome'), to: `/${lang}` },
    { label: t('nav.products') },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white min-h-screen"
    >
      <SEO
        title={search ? t('product.searchResultsFor', { q: search }) : t('nav.products')}
        description={t('seo.defaultDescription')}
        keywords={t('seo.defaultKeywords')}
        url={`/${lang}/products`}
      />

      <PageHero
        breadcrumb={breadcrumb}
        title={search ? t('product.searchResultsFor', { q: search }) : t('nav.products')}
        subtitle={
          search
            ? t('product.searchResultsSubtitle')
            : t('product.productsSubtitle')
        }
      >
        <form
          onSubmit={handleSearchSubmit}
          className="relative max-w-2xl w-full"
        >
          <FiSearch
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder={t('common.search')}
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

      <section className="container-page py-8 md:py-12">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 gap-3">
          <div className="flex items-center gap-2">
            <button
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
              <span className="font-semibold text-slate-900">
                {products.length}
              </span>{' '}
              {t('product.productsCount', { n: products.length })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sort}
              onChange={(e) => setParam('sort', e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 bg-white"
            >
              <option value="">{t('product.sort.default')}</option>
              <option value="name_asc">{t('product.sort.nameAsc')}</option>
              <option value="newest">{t('product.sort.newest')}</option>
            </select>

            <div className="hidden md:flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-primary text-white'
                    : 'text-gray-500 hover:text-primary'
                }`}
                aria-label="Grid view"
              >
                <FiGrid size={14} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary text-white'
                    : 'text-gray-500 hover:text-primary'
                }`}
                aria-label="List view"
              >
                <FiList size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Active filters chips */}
        {activeCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className="text-xs text-gray-500">
              {t('product.filter.active')}:
            </span>
            <button
              onClick={clearAll}
              className="text-xs text-primary hover:underline font-medium"
            >
              {t('product.filter.clearAll')}
            </button>
          </div>
        )}

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
              <EmptyState
                icon={FiSearch}
                title={t('product.noResults')}
                description={search ? t('product.searchResultsSubtitle') : t('product.noResultsHint')}
                action={
                  <button onClick={clearAll} className="btn-secondary">
                    {t('product.filter.clearAll')}
                  </button>
                }
              />
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6'
                    : 'space-y-4'
                }
              >
                {products.map((product, index) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default ProductList;