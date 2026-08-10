import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiHeart, FiTrash2, FiArrowRight } from 'react-icons/fi';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import publicApi from '../api/publicApi';
import PageHero from '../components/PageHero';
import ProductCard from '../components/ProductCard';
import EmptyState from '../components/EmptyState';
import SEO from '../components/SEO';
import { SUPPORTED_LOCALES } from '../i18n';

const Wishlist = () => {
  const { t, i18n } = useTranslation();
  const lang = SUPPORTED_LOCALES.includes(i18n.language) ? i18n.language : 'vi';
  const { items, removeFromWishlist, clearWishlist, count } = useWishlist();
  const toast = useToast();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Hydrate wishlist items with full product data so cards have image/specs
  useEffect(() => {
    if (items.length === 0) {
      setProducts([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all(
      items.map((it) =>
        publicApi
          .getProduct(it._id, lang)
          .then((res) => res?.data?.data || it)
          .catch(() => it)
      )
    ).then((fetched) => {
      if (!cancelled) {
        setProducts(fetched.filter(Boolean));
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [items, lang]);

  const handleRemove = (id) => {
    removeFromWishlist(id);
    toast.info(t('toast.removedFromWishlist'));
  };

  const handleClear = () => {
    if (window.confirm(t('wishlist.clearAll') + '?')) {
      clearWishlist();
    }
  };

  const breadcrumb = useMemo(
    () => [
      { label: t('product.breadcrumbHome'), to: `/${lang}` },
      { label: t('nav.wishlist') },
    ],
    [lang, t]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white min-h-screen"
    >
      <SEO
        title={t('wishlist.title')}
        description={t('wishlist.subtitle')}
        url={`/${lang}/wishlist`}
        breadcrumb={breadcrumb}
      />

      <PageHero
        breadcrumb={breadcrumb}
        title={t('wishlist.title')}
        subtitle={t('wishlist.subtitle')}
      />

      <section className="container-page py-10 md:py-14">
        {count > 0 && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-900">{count}</span>{' '}
              {t('wishlist.count', { n: count })}
            </p>
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 text-sm text-rose-600 hover:text-rose-700 font-medium"
            >
              <FiTrash2 size={14} />
              {t('wishlist.clearAll')}
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] skeleton rounded-2xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={FiHeart}
            title={t('wishlist.empty')}
            description={t('wishlist.emptyHint')}
            action={
              <Link to={`/${lang}/products`} className="btn-primary inline-flex items-center gap-2">
                {t('common.viewAll')}
                <FiArrowRight size={14} />
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, idx) => (
              <div key={product._id} className="relative group">
                <ProductCard product={product} index={idx} />
                <button
                  type="button"
                  onClick={() => handleRemove(product._id)}
                  aria-label={t('wishlist.remove')}
                  className="absolute top-2 left-2 z-10 w-9 h-9 rounded-full bg-white/95 backdrop-blur border border-gray-200 flex items-center justify-center text-rose-600 hover:bg-rose-50 hover:border-rose-300 shadow-sm transition-all"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
};

export default Wishlist;
