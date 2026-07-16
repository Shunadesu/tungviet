import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiGrid, FiList, FiSearch } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';
import publicApi from '../api/publicApi';
import { SUPPORTED_LOCALES } from '../i18n';

const ProductList = () => {
  const { t, i18n } = useTranslation();
  const lang = SUPPORTED_LOCALES.includes(i18n.language) ? i18n.language : 'vi';

  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');

  const search = searchParams.get('search') || searchParams.get('q') || '';
  const sort = searchParams.get('sort') || '';

  useEffect(() => {
    setLoading(true);
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sort, lang]);

  const fetchProducts = async () => {
    try {
      const params = { lang };
      if (search) params.search = search;
      if (sort) params.sort = sort;

      const res = await publicApi.getProducts(params);
      setProducts(res.data.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-8"
    >
      <SEO
        title={search ? t('product.searchResultsFor', { q: search }) : t('nav.products')}
        description={t('seo.defaultDescription')}
        keywords={t('seo.defaultKeywords')}
        url={`/${lang}/products`}
      />
      <div className="bg-primary text-white py-4">
        <div className="max-w-7xl mx-auto px-2">
          <h1 className="text-lg font-semibold">{t('nav.products')}</h1>
          <p className="text-xs text-white/70">{t('product.productsCount', { n: products.length })}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 py-4">
        {/* Search Bar */}
        <div className="mb-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const q = e.target.search.value.trim();
              handleFilterChange('q', q);
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder={t('common.search')}
                className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <button type="submit" className="btn-primary px-4">
              {t('common.search')}
            </button>
          </form>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4 gap-2">
          <div className="flex items-center gap-2">
            {search && (
              <span className="text-xs text-gray-500">
                {t('product.searchResultsFor', { q: search })}
              </span>
            )}
          </div>

          <select
            value={sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="text-xs border rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary"
          >
            <option value="">{t('product.sort.default')}</option>
            <option value="name_asc">{t('product.sort.nameAsc')}</option>
            <option value="newest">{t('product.sort.newest')}</option>
          </select>

          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-gray-100'}`}
              aria-label="Grid view"
            >
              <FiGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-gray-100'}`}
              aria-label="List view"
            >
              <FiList size={16} />
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm">{t('product.noResults')}</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3' : 'space-y-2'}>
              {products.map((product, index) => (
                <ProductCard key={product._id} product={product} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductList;