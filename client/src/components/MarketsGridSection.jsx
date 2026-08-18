import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiArrowRight, FiArrowUpRight, FiBox, FiPackage } from 'react-icons/fi';
import publicApi from '../api/publicApi';
import { getLocalizedField } from '../utils/i18nField';
import { SUPPORTED_LOCALES } from '../i18n';
import SectionHeader from './SectionHeader';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

const GRADIENTS = [
  'from-sky-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-cyan-500 to-sky-600',
  'from-teal-500 to-cyan-600',
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-green-600',
];

const MarketsGridSection = () => {
  const { t, i18n } = useTranslation();
  const { lang: urlLang } = useParams();
  const lang = SUPPORTED_LOCALES.includes(urlLang) ? urlLang : 'vi';
  const isEN = i18n.language === 'en';
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    publicApi
      .getMarketTrees({ lang })
      .then((r) => {
        if (!mounted) return;
        setItems(Array.isArray(r.data?.data) ? r.data.data : []);
      })
      .catch((err) => {
        console.warn('[MarketsGridSection] getMarketTrees failed:', err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [lang]);

  // Hide section entirely if no data and not loading
  if (!loading && items.length === 0) return null;

  // Identify the featured market (admin-flagged) and use it as the hero card.
  const featured = items.find((m) => m.isFeatured) || items[0];
  const rest = items.filter((m) => m._id !== featured?._id).slice(0, 5);

  return (
    <section className="bg-slate-50/60 py-16 md:py-20 lg:py-24">
      <div className="container-page">
        <SectionHeader
          eyebrow={isEN ? 'Markets' : 'Thị trường'}
          title={t('marketsGrid.title')}
          subtitle={t('marketsGrid.subtitle')}
          align="center"
          className="mb-12"
        />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 md:p-7 border border-gray-100 shadow-card h-48"
              >
                <div className="w-14 h-14 rounded-2xl skeleton mb-5" />
                <div className="h-4 w-3/4 skeleton mb-3" />
                <div className="h-3 w-full skeleton mb-2" />
                <div className="h-3 w-2/3 skeleton" />
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
          >
            {/* Hero / Featured card: spans 2 cols on lg */}
            {featured && (
              <motion.div variants={cardVariants} className="sm:col-span-2 lg:col-span-2">
                <FeaturedMarketCard market={featured} lang={lang} isEN={isEN} />
              </motion.div>
            )}

            {/* Remaining markets */}
            {rest.map((m, idx) => {
              const name = getLocalizedField(m, lang, 'title', 'titleEn');
              const description = getLocalizedField(
                m,
                lang,
                'description',
                'descriptionEn'
              );
              const gradient = GRADIENTS[(idx + 1) % GRADIENTS.length];
              return (
                <motion.div key={m._id} variants={cardVariants}>
                  <MarketCard
                    market={m}
                    name={name}
                    description={description}
                    gradient={gradient}
                    lang={lang}
                    isEN={isEN}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        )}

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
      </div>
    </section>
  );
};

const MarketCard = ({ market, name, description, gradient, lang, isEN }) => (
  <Link
    to={`/${lang}/markets/${market._id}`}
    className="group relative block h-full bg-white rounded-2xl p-6 md:p-7 border border-gray-100 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 overflow-hidden"
  >
    <div
      aria-hidden="true"
      className={`absolute -top-24 -right-24 w-56 h-56 rounded-full bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-[0.10] transition-opacity duration-500 pointer-events-none blur-2xl`}
    />

    <div className="relative">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-50 text-primary text-2xl mb-5 ring-1 ring-inset ring-primary-100 transition-all duration-300 group-hover:scale-110 group-hover:rotate-[6deg]">
        <FiBox />
      </div>

      <h3 className="text-base md:text-lg font-bold text-slate-900 mb-2 tracking-tight">
        {name}
      </h3>
      <p className="text-xs md:text-sm text-slate-600 leading-relaxed line-clamp-3">
        {description || (isEN ? 'Explore this market' : 'Khám phá thị trường này')}
      </p>

      {/* Product count badge */}
      {Number.isFinite(market.productCount) && market.productCount > 0 && (
        <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
          <FiPackage size={11} />
          <span>
            {market.productCount} {isEN ? 'products' : 'sản phẩm'}
          </span>
        </div>
      )}

      <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-primary">
        <span>{isEN ? 'Explore' : 'Khám phá'}</span>
        <FiArrowRight
          size={12}
          className="transition-transform group-hover:translate-x-1"
        />
      </div>
    </div>

    <FiArrowUpRight
      size={16}
      className="absolute top-5 right-5 text-slate-300 group-hover:text-primary group-hover:rotate-12 transition-all duration-300"
    />
  </Link>
);

/**
 * Larger card used for the featured/first market — gives the home grid a
 * clear focal point and reduces visual flatness when many markets are shown.
 */
const FeaturedMarketCard = ({ market, lang, isEN }) => {
  const name = getLocalizedField(market, lang, 'title', 'titleEn');
  const description = getLocalizedField(
    market,
    lang,
    'description',
    'descriptionEn'
  );
  const appsCount = Array.isArray(market.applications)
    ? market.applications.filter((a) => a.isActive !== false).length
    : 0;
  const techCount = Array.isArray(market.technologies)
    ? market.technologies.filter((t) => t.isActive !== false).length
    : 0;

  return (
    <Link
      to={`/${lang}/markets/${market._id}`}
      className="group relative block h-full bg-gradient-to-br from-primary via-primary to-primary-700 text-white rounded-2xl p-7 md:p-9 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden"
    >
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-white/5 blur-2xl pointer-events-none"
      />

      <div className="relative flex flex-col h-full min-h-[280px]">
        <div className="inline-flex items-center gap-1.5 self-start bg-white/20 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full mb-5">
          <FiBox size={11} />
          {isEN ? 'Featured market' : 'Thị trường nổi bật'}
        </div>

        <h3 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight leading-tight">
          {name}
        </h3>
        {description && (
          <p className="text-sm md:text-base text-white/85 leading-relaxed mb-6 line-clamp-4">
            {description}
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-4 text-xs">
            {Number.isFinite(market.productCount) && market.productCount > 0 && (
              <span className="inline-flex items-center gap-1 bg-white/15 px-2 py-1 rounded-md">
                <FiPackage size={11} />
                {market.productCount} {isEN ? 'products' : 'SP'}
              </span>
            )}
            {appsCount > 0 && (
              <span className="inline-flex items-center gap-1 bg-white/15 px-2 py-1 rounded-md">
                {appsCount} {isEN ? 'apps' : 'ứng dụng'}
              </span>
            )}
            {techCount > 0 && (
              <span className="inline-flex items-center gap-1 bg-white/15 px-2 py-1 rounded-md">
                {techCount} {isEN ? 'tech' : 'công nghệ'}
              </span>
            )}
          </div>
          <span className="inline-flex items-center gap-2 text-sm font-semibold">
            {isEN ? 'Explore' : 'Khám phá ngay'}
            <FiArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-1"
            />
          </span>
        </div>
      </div>

      <FiArrowUpRight
        size={20}
        className="absolute top-5 right-5 text-white/40 group-hover:text-white group-hover:rotate-12 transition-all duration-300"
      />
    </Link>
  );
};

export default MarketsGridSection;