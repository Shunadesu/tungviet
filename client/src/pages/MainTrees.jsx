import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiArrowRight, FiBox } from 'react-icons/fi';
import publicApi from '../api/publicApi';
import { getLocalizedField } from '../utils/i18nField';
import { SUPPORTED_LOCALES } from '../i18n';
import PageHero from '../components/PageHero';
import EmptyState from '../components/EmptyState';
import SEO from '../components/SEO';
import { sanitizeHtml } from '../utils/sanitize';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

const stripHtml = (html) => (html ? sanitizeHtml(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '');

const MainTrees = () => {
  const { t, i18n } = useTranslation();
  const { lang: urlLang } = useParams();
  const lang = SUPPORTED_LOCALES.includes(urlLang) ? urlLang : 'vi';
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    document.title = `${t('mainTree.title')} | Tungviet`;
    publicApi
      .getMainTrees(lang)
      .then((r) => setItems(Array.isArray(r.data?.data) ? r.data.data : []))
      .catch((err) => console.warn('[MainTrees] getMainTrees failed:', err))
      .finally(() => setLoading(false));
  }, [lang, t]);

  return (
    <div className="bg-white min-h-screen">
      <SEO
        title={t('mainTree.title')}
        description={t('mainTree.subtitle')}
        keywords={t('seo.defaultKeywords')}
        url={`/${lang}/main-trees`}
        breadcrumb={[
          { label: t('mainTree.breadcrumbHome'), to: `/${lang}` },
          { label: t('mainTree.breadcrumbMainTrees') },
        ]}
      />

      <PageHero
        title={t('mainTree.title')}
        subtitle={t('mainTree.subtitle')}
        breadcrumb={[
          { label: t('mainTree.breadcrumbHome'), to: `/${lang}` },
          { label: t('mainTree.breadcrumbMainTrees') },
        ]}
      />

      <section className="container-page py-12 md:py-16">
        {loading ? (
          <div className="text-center text-gray-500 py-12">
            <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="mt-3 text-sm">{t('common.loading')}</p>
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={FiBox}
            title={t('mainTree.noMainTrees')}
            description={t('mainTree.noMainTreesHint')}
          />
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {items.map((m) => {
              const name = getLocalizedField(m, lang, 'name', 'nameEn');
              const description = getLocalizedField(m, lang, 'description', 'descriptionEn');
              const descriptionText = stripHtml(description);
              return (
                <motion.div key={m._id} variants={cardVariants}>
                  <Link
                    to={`/${lang}/main-trees/${m._id}`}
                    className="group block h-full bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                  >
                    {m.imageUrl ? (
                      <div className="aspect-video bg-gray-100 overflow-hidden">
                        <img
                          src={m.imageUrl}
                          alt={name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-primary-50 to-emerald-50 flex items-center justify-center">
                        <FiBox size={48} className="text-primary/40" />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">
                        {name}
                      </h3>
                      <p className="text-sm text-slate-600 line-clamp-3 min-h-[3.5rem]">
                        {descriptionText || t('mainTree.noDescription')}
                      </p>
                      <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                        {t('mainTree.explore')}
                        <FiArrowRight
                          size={12}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </div>
                    </div>
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

export default MainTrees;