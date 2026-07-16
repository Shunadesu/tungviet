import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiPackage } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import ProductCard from './ProductCard';
import publicApi from '../api/publicApi';
import { SUPPORTED_LOCALES } from '../i18n';

const FeaturedProducts = ({ title, subtitle, limit = 8, viewAllLink, viewAllText }) => {
  const { t } = useTranslation();
  const { lang: urlLang } = useParams();
  const lang = SUPPORTED_LOCALES.includes(urlLang) ? urlLang : 'vi';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    publicApi
      .getProducts({ lang, limit, sort: 'newest' })
      .then((r) => setProducts(r.data?.data ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [lang, limit]);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title || t('home.featuredProducts')}</h2>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg h-64 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex items-end justify-between mb-6"
      >
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {title || t('home.featuredProducts')}
          </h2>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        {(viewAllLink || viewAllText) && (
          <Link
            to={viewAllLink || `/${lang}/products`}
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-700 transition-colors"
          >
            {viewAllText || t('common.viewAll')}
            <FiArrowRight size={14} />
          </Link>
        )}
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product, index) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.06, duration: 0.4 }}
          >
            <ProductCard product={product} index={index} />
          </motion.div>
        ))}
      </div>

      {(viewAllLink || viewAllText) && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-6 text-center sm:hidden"
        >
          <Link
            to={viewAllLink || `/${lang}/products`}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-700 transition-colors"
          >
            {viewAllText || t('common.viewAll')}
            <FiArrowRight size={14} />
          </Link>
        </motion.div>
      )}
    </section>
  );
};

export default FeaturedProducts;
