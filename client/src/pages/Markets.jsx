import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiArrowRight, FiArrowUpRight, FiBox, FiPackage, FiSearch } from 'react-icons/fi';
import publicApi from '../api/publicApi';
import { getLocalizedField } from '../utils/i18nField';
import { SUPPORTED_LOCALES } from '../i18n';
import PageHero from '../components/PageHero';
import EmptyState from '../components/EmptyState';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const GRADIENTS = [
  'from-sky-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-cyan-500 to-sky-600',
  'from-teal-500 to-cyan-600',
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-green-600',
];

const Markets = () => {
  const { t, i18n } = useTranslation();
  const { lang: urlLang } = useParams();
  const lang = SUPPORTED_LOCALES.includes(urlLang) ? urlLang : 'vi';
  const isEN = i18n.language === 'en';
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    publicApi
      .getMarketTrees({ lang })
      .then((res) => {
        setItems(Array.isArray(res.data?.data) ? res.data.data : []);
      })
      .catch((err) => console.warn('[Markets] fetch failed:', err))
      .finally(() => setLoading(false));
  }, [lang]);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase().trim();
    return items.filter((m) => {
      const title = getLocalizedField(m, lang, 'title', 'titleEn') || '';
      const desc = getLocalizedField(m, lang, 'description', 'descriptionEn') || '';
      return (
        title.toLowerCase().includes(q) || desc.toLowerCase().includes(q)
      );
    });
  }, [items, search, lang]);

  return (
    <div>
      <PageHero
        title={t('market.title')}
        subtitle={t('market.subtitle')}
        breadcrumb={[
          { label: t('market.breadcrumbHome'), to: `/${lang}` },
          { label: t('market.breadcrumbMarkets') },
        ]}
      />

      <section className="container-page py-12 md:py-16">
        <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900">
            {isEN ? 'All markets' : 'Tất cả thị trường'}
            <span className="ml-2 text-sm font-medium text-slate-500">
              ({filtered.length})
            </span>
          </h2>
          <div className="relative w-full sm:w-72">
            <FiSearch
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isEN ? 'Search markets...' : 'Tìm thị trường...'}
              className="input-field pl-9 pr-3 text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-card h-48"
              >
                <div className="w-14 h-14 rounded-2xl skeleton mb-5" />
                <div className="h-4 w-3/4 skeleton mb-3" />
                <div className="h-3 w-full skeleton mb-2" />
                <div className="h-3 w-2/3 skeleton" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={FiBox}
            title={isEN ? 'No markets found' : 'Không tìm thấy thị trường'}
            description={
              isEN
                ? 'Try a different search term.'
                : 'Hãy thử với từ khóa khác.'
            }
          />
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {filtered.map((m, idx) => {
              const name = getLocalizedField(m, lang, 'title', 'titleEn');
              const description = getLocalizedField(
                m,
                lang,
                'description',
                'descriptionEn'
              );
              const gradient = GRADIENTS[idx % GRADIENTS.length];
              const appCount = Array.isArray(m.applications)
                ? m.applications.length
                : 0;
              return (
                <motion.div key={m._id} variants={cardVariants}>
                  <Link
                    to={`/${lang}/markets/${m._id}`}
                    className="group relative block h-full bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                  >
                    {m.imageUrl ? (
                      <div className="aspect-video bg-gray-100 overflow-hidden">
                        <img
                          src={m.imageUrl}
                          alt={name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div
                        className={`aspect-video bg-gradient-to-br ${gradient} flex items-center justify-center`}
                      >
                        <FiBox size={56} className="text-white/40" />
                      </div>
                    )}
                    <div className="p-5 md:p-6">
                      {m.isFeatured === true && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full mb-2">
                          <FiPackage size={10} />
                          {isEN ? 'Featured' : 'Nổi bật'}
                        </span>
                      )}
                      <h3 className="text-base md:text-lg font-bold text-slate-900 mb-2 tracking-tight group-hover:text-primary transition-colors">
                        {name}
                      </h3>
                      {description && (
                        <p className="text-xs md:text-sm text-slate-600 leading-relaxed line-clamp-3">
                          {description}
                        </p>
                      )}
                      <div className="mt-4 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 text-[11px] text-slate-500">
                          {Number.isFinite(m.productCount) && m.productCount > 0 && (
                            <span className="inline-flex items-center gap-1">
                              <FiPackage size={10} />
                              {m.productCount} {isEN ? 'products' : 'SP'}
                            </span>
                          )}
                          {appCount > 0 && (
                            <span>
                              {appCount} {isEN ? 'applications' : 'ứng dụng'}
                            </span>
                          )}
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                          {t('market.viewDetails')}
                          <FiArrowRight
                            size={12}
                            className="transition-transform group-hover:translate-x-1"
                          />
                        </span>
                      </div>
                    </div>
                    <FiArrowUpRight
                      size={16}
                      className="absolute top-4 right-4 text-slate-300 group-hover:text-primary group-hover:rotate-12 transition-all duration-300"
                    />
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </section>
    </div>
  );
};

export default Markets;
