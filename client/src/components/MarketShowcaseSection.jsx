import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import publicApi from '../api/publicApi';
import { getLocalizedField } from '../utils/i18nField';
import { SUPPORTED_LOCALES } from '../i18n';
import SectionHeader from './SectionHeader';
import placeholderProduct from '../assets/placeholder-product.svg';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

const MarketShowcaseSection = () => {
  const { t, i18n } = useTranslation();
  const isEN = i18n.language === 'en';
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Resolve lang from URL
  const pathname = window.location?.pathname || '';
  const seg = pathname.split('/').filter(Boolean)[0];
  const lang = SUPPORTED_LOCALES.includes(seg) ? seg : 'vi';

  useEffect(() => {
    let mounted = true;
    publicApi
      .getMarketTrees({ lang })
      .then((r) => {
        if (!mounted) return;
        // Take up to 6 markets
        const data = Array.isArray(r.data?.data) ? r.data.data : [];
        setItems(data.slice(0, 6));
      })
      .catch((err) => {
        console.warn('[MarketShowcaseSection] getMarketTrees failed:', err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [lang]);

  if (!loading && items.length === 0) return null;

  return (
    <section className="bg-white py-16 md:py-20 lg:py-24">
      <div className="container-page">
        <SectionHeader
          eyebrow={isEN ? 'Markets' : 'Thị trường'}
          title={isEN ? 'Explore Our Markets' : 'Khám phá các thị trường'}
          subtitle={
            isEN
              ? 'Discover the diverse markets we serve and the unique solutions tailored for each.'
              : 'Tìm hiểu các thị trường đa dạng mà chúng tôi phục vụ cùng những giải pháp phù hợp cho từng lĩnh vực.'
          }
          align="center"
          className="mb-12"
        />

        {loading ? (
          <div className="flex justify-center">
            <div className="grid grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-3">
                  <div className="w-24 h-24 rounded-full skeleton" />
                  <div className="h-4 w-20 skeleton rounded" />
                  <div className="h-3 w-14 skeleton rounded" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <motion.div
            className={`grid gap-6 ${
              items.length <= 2
                ? 'grid-cols-2 max-w-sm mx-auto'
                : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
            }`}
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
          >
            {items.map((m) => {
              const name = getLocalizedField(m, lang, 'title', 'titleEn');
              return (
                <motion.div
                  key={m._id}
                  variants={cardVariants}
                  className="flex flex-col items-center text-center group"
                >
                  <Link
                    to={`/${lang}/markets/${m._id}`}
                    className="flex flex-col items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
                  >
                    {/* Circle image */}
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-gray-100 group-hover:ring-primary/30 transition-all duration-300 group-hover:scale-105 shadow-sm group-hover:shadow-md">
                        {m.imageUrl ? (
                          <img
                            src={m.imageUrl}
                            alt={name}
                            loading="lazy"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement.querySelector('.fallback-icon')?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        {/* Fallback icon when no image */}
                        <div
                          className={`fallback-icon absolute inset-0 flex items-center justify-center bg-primary-50 text-primary rounded-full${m.imageUrl ? ' hidden' : ''}`}
                        >
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                          </svg>
                        </div>
                      </div>
                      {/* Hover arrow indicator */}
                      <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 shadow-sm">
                        <FiArrowRight size={12} />
                      </span>
                    </div>

                    {/* Market name */}
                    <span className="text-sm font-semibold text-slate-800 group-hover:text-primary transition-colors leading-snug line-clamp-2 max-w-full px-1">
                      {name}
                    </span>

                    {/* Explore label */}
                    <span className="text-xs text-slate-400 group-hover:text-primary transition-colors flex items-center gap-0.5">
                      {isEN ? 'Explore' : 'Khám phá'}
                      <FiArrowRight
                        size={10}
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* View all link */}
        {!loading && items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-10 text-center"
          >
            <Link
              to={`/${lang}/markets`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-700 transition-colors group"
            >
              {isEN ? 'View all markets' : 'Xem tất cả thị trường'}
              <FiArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default MarketShowcaseSection;
