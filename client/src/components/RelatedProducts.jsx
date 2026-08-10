import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiArrowRight } from 'react-icons/fi';
import ProductCard from './ProductCard';
import EmptyState from './EmptyState';
import publicApi from '../api/publicApi';
import { SUPPORTED_LOCALES } from '../i18n';

/**
 * Sản phẩm liên quan: cùng category hoặc market.
 */
const RelatedProducts = ({ currentProduct, limit = 4 }) => {
  const { t } = useTranslation();
  const { lang: urlLang } = useParams();
  const lang = SUPPORTED_LOCALES.includes(urlLang) ? urlLang : 'vi';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentProduct) return;
    setLoading(true);
    const params = {
      lang,
      limit: limit + 1, // +1 để loại trừ current
    };
    if (currentProduct.category) params.category = currentProduct.category;
    else if (currentProduct.market) params.market = currentProduct.market;
    else if (currentProduct.mainTree) params.mainTree = currentProduct.mainTree;

    publicApi
      .getProducts(params)
      .then((r) => {
        const list = (r?.data?.data || []).filter(
          (p) => p._id !== currentProduct._id
        );
        setProducts(list.slice(0, limit));
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProduct?._id, lang]);

  if (loading) {
    return (
      <section className="container-page py-12 md:py-16">
        <h2 className="heading-section mb-6">{t('product.relatedProducts')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="aspect-[4/5] skeleton rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="bg-slate-50/60 py-12 md:py-16">
      <div className="container-page">
        <div className="flex items-end justify-between mb-6 md:mb-8">
          <div>
            <span className="heading-eyebrow">{t('product.mightLike')}</span>
            <h2 className="heading-section mt-2">{t('product.relatedProducts')}</h2>
          </div>
          <Link
            to={`/${lang}/products`}
            className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-700 transition-colors"
          >
            {t('common.viewAll')} <FiArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, idx) => (
            <ProductCard key={product._id} product={product} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedProducts;