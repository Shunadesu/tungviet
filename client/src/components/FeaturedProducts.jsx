import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard';
import publicApi from '../api/publicApi';
import { SUPPORTED_LOCALES } from '../i18n';
import SectionHeader from './SectionHeader';
import EmptyState from './EmptyState';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const FeaturedProducts = ({
  title,
  subtitle,
  eyebrow,
  icon: Icon,
  limit = 8,
  viewAllLink,
  viewAllText,
}) => {
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

  if (products.length === 0 && !loading) {
    return (
      <section className="bg-slate-50/60 py-16 md:py-20">
        <div className="container-page">
          <SectionHeader
            eyebrow={eyebrow}
            icon={Icon}
            title={title || t('home.featuredProducts')}
            subtitle={subtitle}
            align="center"
            className="mb-10"
          />
          <EmptyState
            title={t('home.featuredEmpty', 'Chưa có sản phẩm nổi bật')}
            description={t('home.featuredEmptyDesc', 'Vui lòng quay lại sau.')}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="bg-slate-50/60 py-16 md:py-20">
      <div className="container-page">
        <SectionHeader
          eyebrow={eyebrow}
          icon={Icon}
          title={title || t('home.featuredProducts')}
          subtitle={subtitle}
          align="center"
          className="mb-10"
        />

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card overflow-hidden">
                <div className="aspect-[4/3] skeleton !rounded-none" />
                <div className="p-5 space-y-3">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-3 w-1/2" />
                  <div className="skeleton h-9 w-full mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6 items-stretch"
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
          >
            {products.map((product, index) => (
              <ProductCard key={product._id} product={product} index={index} />
            ))}
          </motion.div>
        )}

        {(viewAllLink || viewAllText) && (
          <div className="mt-10 text-center">
            <Link
              to={viewAllLink || `/${lang}/products`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-700 transition-colors group"
            >
              {viewAllText || t('common.viewAll')}
              <FiArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;