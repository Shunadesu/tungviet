import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiArrowRight, FiCpu, FiLayers } from 'react-icons/fi';
import publicApi from '../api/publicApi';
import { getLocalizedField } from '../utils/i18nField';
import { htmlToText } from '../utils/html';
import { SUPPORTED_LOCALES } from '../i18n';
import SectionHeader from './SectionHeader';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const ProductShowcaseSection = () => {
  const { t, i18n } = useTranslation();
  const isEN = i18n.language === 'en';
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const pathname = window.location?.pathname || '';
  const seg = pathname.split('/').filter(Boolean)[0];
  const lang = SUPPORTED_LOCALES.includes(seg) ? seg : 'vi';

  useEffect(() => {
    let mounted = true;
    publicApi
      .getMainTrees(lang)
      .then((r) => {
        if (!mounted) return;
        const data = Array.isArray(r.data?.data) ? r.data.data : [];
        setItems(data.slice(0, 6));
      })
      .catch((err) => {
        console.warn('[ProductShowcaseSection] getMainTrees failed:', err);
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
          eyebrow={isEN ? 'Product Tree' : 'Cây ngành sản phẩm'}
          title={isEN ? 'Industry Product Lines' : 'Danh mục ngành hàng'}
          subtitle={
            isEN
              ? 'Explore our structured product lines across industries — from rosin and resin derivatives to specialty chemicals.'
              : 'Khám phá các danh mục sản phẩm theo ngành — từ nhựa thông, dẫn xuất nhựa thông đến hóa chất chuyên dụng.'
          }
          align="center"
          className="mb-12"
        />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden">
                <div className="h-40 skeleton" />
                <div className="p-5 space-y-3">
                  <div className="h-5 w-2/3 skeleton rounded" />
                  <div className="h-3 w-full skeleton rounded" />
                  <div className="h-3 w-4/5 skeleton rounded" />
                  <div className="flex gap-4 pt-2">
                    <div className="h-3 w-16 skeleton rounded" />
                    <div className="h-3 w-16 skeleton rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            className={`grid gap-6 ${
              items.length === 1
                ? 'grid-cols-1 max-w-md mx-auto'
                : items.length === 2
                ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            }`}
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
          >
            {items.map((tree, idx) => {
              const name =
                getLocalizedField(tree, lang, 'name', 'nameEn') ||
                getLocalizedField(tree, lang, 'title', 'titleEn');
              const description =
                getLocalizedField(tree, lang, 'description', 'descriptionEn');
              const technologies = Array.isArray(tree.technologies)
                ? tree.technologies.filter((t) => t.isActive !== false)
                : [];
              const techCount = technologies.length;
              const appCount = technologies.reduce(
                (acc, t) => acc + (Array.isArray(t.applications) ? t.applications.length : 0),
                0
              );

              // Collect up to 3 technology names for preview
              const techPreview = technologies.slice(0, 3).map((t) =>
                getLocalizedField(t, lang, 'title', 'titleEn')
              );

              return (
                <motion.div
                  key={tree._id}
                  variants={cardVariants}
                  className="group"
                >
                  <Link
                    to={`/${lang}/main-trees/${tree._id}`}
                    className="flex flex-col h-full rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    {/* Image area — taller for richness */}
                    <div className="relative h-40 overflow-hidden bg-slate-100 flex-shrink-0">
                      {tree.imageUrl ? (
                        <img
                          src={tree.imageUrl}
                          alt={name}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement.querySelector('.fallback-bg')?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      {/* Fallback background */}
                      <div className={`fallback-bg absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-50${tree.imageUrl ? ' hidden' : ''}`}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary/40">
                          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                          <line x1="12" y1="22.08" x2="12" y2="12" />
                        </svg>
                      </div>
                      {/* Tech count badge */}
                      {techCount > 0 && (
                        <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                          <FiCpu size={11} className="text-primary" />
                          {techCount} {techCount === 1
                            ? (isEN ? 'Technology' : 'Công nghệ')
                            : (isEN ? 'Technologies' : 'Công nghệ')}
                        </div>
                      )}
                      {/* Hover overlay arrow */}
                      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300 flex items-center justify-center">
                        <span className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <FiArrowRight size={16} className="text-primary" />
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col flex-1 p-5">
                      {/* Name */}
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors mb-2 leading-snug">
                        {name}
                      </h3>

                      {/* Description — up to 2 lines (htmlToText strips Quill HTML tags) */}
                      {description && (
                        <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 mb-4 flex-1">
                          {htmlToText(description)}
                        </p>
                      )}

                      {/* Tech preview tags */}
                      {techPreview.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {techPreview.map((techName, i) => (
                            <span
                              key={i}
                              className="inline-block text-xs font-medium text-primary bg-primary-50 px-2 py-0.5 rounded-full border border-primary-100"
                            >
                              {techName}
                            </span>
                          ))}
                          {techCount > 3 && (
                            <span className="inline-block text-xs text-slate-400 px-1 py-0.5">
                              +{techCount - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Stats row */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <FiCpu size={13} className="text-primary/60" />
                            <span className="text-xs font-semibold text-slate-700">
                              {techCount}
                            </span>
                            <span className="text-xs text-slate-400">
                              {isEN ? 'tech' : 'công nghệ'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <FiLayers size={13} className="text-primary/60" />
                            <span className="text-xs font-semibold text-slate-700">
                              {appCount}
                            </span>
                            <span className="text-xs text-slate-400">
                              {isEN ? 'app' : 'ứng dụng'}
                            </span>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
                          {isEN ? 'Explore' : 'Khám phá'}
                          <FiArrowRight size={12} />
                        </span>
                      </div>
                    </div>
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
            className="mt-12 text-center"
          >
            <Link
              to={`/${lang}/main-trees`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-700 transition-colors group"
            >
              {isEN ? 'View all product lines' : 'Xem tất cả danh mục'}
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

export default ProductShowcaseSection;
