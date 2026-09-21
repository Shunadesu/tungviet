import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  FiArrowRight, FiBox, FiGrid, FiCpu, FiLayers,
  FiSearch, FiChevronDown, FiX,
} from 'react-icons/fi';
import publicApi from '../api/publicApi';
import { getLocalizedField } from '../utils/i18nField';
import { SUPPORTED_LOCALES } from '../i18n';
import EmptyState from '../components/EmptyState';
import SEO from '../components/SEO';
import Skeleton from '../components/Skeleton';
import { htmlToText, htmlToExcerpt } from '../utils/html';

const stripHtml = (html) => (html ? htmlToText(html) : '');

// ─── Inline Tech Card ───────────────────────────────────────────────────────
const TechCard = ({ tech, index, lang }) => {
  const desc = stripHtml(tech.description || '');
  const title = getLocalizedField(tech, lang, 'title', 'titleEn');
  const specCount = Array.isArray(tech.specifications) ? tech.specifications.length : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, delay: Math.min(index, 5) * 0.05 }}
      className="group bg-white rounded-xl border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all duration-250 overflow-hidden"
    >
      {/* Top accent */}
      <div className="h-0.5 bg-gradient-to-r from-primary to-primary-400" />

      <div className="p-4">
        {/* Icon + number + name */}
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary-50 text-primary flex items-center justify-center">
            <FiCpu size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-primary/60 mb-0.5">
              {lang === 'en' ? 'Technology' : 'Công nghệ'}
            </div>
            <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
              {title}
            </h3>
          </div>
          <span className="flex-shrink-0 text-[11px] font-bold text-slate-300 mt-5">
            #{String(index + 1).padStart(2, '0')}
          </span>
        </div>

        {/* Description */}
        {desc && (
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-3">
            {htmlToExcerpt(desc, 120)}
          </p>
        )}

        {/* Specs indicator */}
        {specCount > 0 && (
          <div className="mb-3">
            <span className="text-[11px] text-slate-400">{specCount} specs</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          {tech.linkCustomUrl ? (
            <a
              href={tech.linkCustomUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary-700 transition-colors"
            >
              {lang === 'en' ? 'View' : 'Chi tiết'}
              <FiArrowRight size={11} />
            </a>
          ) : (
            <span className="text-[11px] text-slate-300">—</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Inline App Card ────────────────────────────────────────────────────────
const AppCard = ({ app, index, lang }) => {
  const desc = stripHtml(app.description || app.descriptionEn || '');
  const title = getLocalizedField(app, lang, 'title', 'titleEn');

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, delay: Math.min(index, 5) * 0.05 }}
      className="group bg-white rounded-xl border border-gray-100 hover:border-accent/30 hover:shadow-md transition-all duration-250 overflow-hidden"
    >
      <div className="h-0.5 bg-gradient-to-r from-accent to-accent-400" />

      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
            <FiLayers size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-accent/60 mb-0.5">
              {lang === 'en' ? 'Application' : 'Ứng dụng'}
            </div>
            <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
              {title}
            </h3>
          </div>
        </div>

        {desc && (
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
            {htmlToExcerpt(desc, 120)}
          </p>
        )}
      </div>
    </motion.div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────
const MainTreeDetail = () => {
  const { t } = useTranslation();
  const { id, lang: urlLang } = useParams();
  const lang = SUPPORTED_LOCALES.includes(urlLang) ? urlLang : 'vi';

  const [mainTree, setMainTree] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState('tech');
  const [catSearch, setCatSearch] = useState('');
  const [catSort, setCatSort] = useState('default');

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    Promise.all([
      publicApi.getMainTree(id, lang).catch(() => null),
      publicApi.getCategories({ lang, mainTree: id }).catch(() => null),
    ])
      .then(([treeRes, catsRes]) => {
        if (!mounted) return;
        const tree = treeRes?.data?.data;
        if (!tree) { setNotFound(true); return; }
        setMainTree(tree);
        setSubCategories(Array.isArray(catsRes?.data?.data) ? catsRes.data.data : []);
        const name = getLocalizedField(tree, lang, 'name', 'nameEn');
        document.title = `${name} | Tungviet`;
      })
      .catch((err) => {
        console.warn('[MainTreeDetail] fetch failed:', err);
        if (mounted) setNotFound(true);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
      document.title = t('seo.defaultTitle');
    };
  }, [id, lang, t]);

  if (loading) {
    return <Skeleton.MainTreeDetail />;
  }

  if (notFound || !mainTree) {
    return (
      <div className="container-page py-12 text-center">
        <SEO title={t('mainTree.notFound')} url={`/${lang}/main-trees/${id}`} />
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-50 text-primary mb-3">
          <FiBox size={22} />
        </div>
        <h1 className="text-xl font-semibold text-slate-900 mb-2">{t('mainTree.notFound')}</h1>
        <Link to={`/${lang}/main-trees`} className="text-sm text-primary hover:underline font-medium">
          ← {t('mainTree.backToList')}
        </Link>
      </div>
    );
  }

  const name = getLocalizedField(mainTree, lang, 'name', 'nameEn');
  const description = getLocalizedField(mainTree, lang, 'description', 'descriptionEn');
  const descriptionText = stripHtml(description);
  const seoDesc = descriptionText.slice(0, 160) || t('mainTree.subtitle');

  const technologies = Array.isArray(mainTree.technologies) ? mainTree.technologies : [];
  const applications = Array.isArray(mainTree.applications) ? mainTree.applications : [];
  const hasTech = technologies.length > 0;
  const hasApp = applications.length > 0;
  const tabCount = (hasTech ? 1 : 0) + (hasApp ? 1 : 0);

  return (
    <div className="bg-white">
      <SEO
        title={`${name} | ${t('mainTree.title')}`}
        description={seoDesc}
        url={`/${lang}/main-trees/${id}`}
      />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="border-b border-gray-100 bg-gradient-to-br from-primary-50/60 via-white to-white">
        <div className="container-page py-6 md:py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
            <Link to={`/${lang}`} className="hover:text-primary transition-colors">{t('mainTree.breadcrumbHome')}</Link>
            <span>/</span>
            <Link to={`/${lang}/main-trees`} className="hover:text-primary transition-colors">{t('mainTree.breadcrumbMainTrees')}</Link>
            <span>/</span>
            <span className="text-primary font-medium">{name}</span>
          </nav>

          <div className="flex items-start gap-5">
            {/* Industry icon */}
            <div className="hidden md:flex flex-shrink-0 w-16 h-16 rounded-2xl bg-white border border-primary/20 text-primary items-center justify-center shadow-sm mt-1">
              {mainTree.iconUrl ? (
                <img src={mainTree.iconUrl} alt={name} className="w-9 h-9 object-contain" />
              ) : (
                <FiBox size={28} />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight leading-tight mb-1">
                {name}
              </h1>
              {descriptionText && (
                <p className="text-sm text-slate-600 leading-relaxed max-w-2xl line-clamp-2">
                  {descriptionText}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container-page">

        {/* ── Technology & Applications tabs ─────────────────────────────── */}
        {hasTech || hasApp ? (
          <section className="py-6">
            {/* Section label */}
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-base font-bold text-slate-900">
                {lang === 'en' ? 'Technologies & Applications' : 'Công nghệ & Ứng dụng'}
              </h2>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Tab pills */}
            {tabCount > 1 && (
              <div className="flex items-center gap-1 mb-5 p-0.5 bg-gray-50 rounded-xl w-fit">
                {hasTech && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('tech')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === 'tech'
                        ? 'bg-white text-primary shadow-sm border border-primary/20'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <FiCpu size={12} />
                    {technologies.length} {lang === 'en' ? 'Technologies' : 'Công nghệ'}
                  </button>
                )}
                {hasApp && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('app')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === 'app'
                        ? 'bg-white text-accent shadow-sm border border-accent/20'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <FiLayers size={12} />
                    {applications.length} {lang === 'en' ? 'Applications' : 'Ứng dụng'}
                  </button>
                )}
              </div>
            )}

            {/* Cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {activeTab === 'tech' && hasTech && technologies.map((tech, idx) => (
                <TechCard key={tech._id || idx} tech={tech} index={idx} lang={lang} />
              ))}
              {activeTab === 'app' && hasApp && applications.map((app, idx) => (
                <AppCard key={app._id || idx} app={app} index={idx} lang={lang} />
              ))}
            </div>
          </section>
        ) : null}

        {/* ── Sub-categories ─────────────────────────────────────────────── */}
        {subCategories.length > 0 && (
          <section className="py-8 border-t border-gray-100">
            {/* Section header */}
            <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {t('mainTree.subCategories')}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {subCategories.length}{' '}
                  {lang === 'en' ? 'categories' : 'danh mục'}
                </p>
              </div>
            </div>

            {/* Search + Sort bar */}
            <div className="flex items-center gap-3 mb-5">
              {/* Search */}
              <div className="relative flex-1 max-w-xs">
                <FiSearch
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="text"
                  value={catSearch}
                  onChange={(e) => setCatSearch(e.target.value)}
                  placeholder={lang === 'en' ? 'Search categories...' : 'Tìm danh mục...'}
                  className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-gray-200 bg-white
                             placeholder-slate-400 text-slate-700
                             focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                             transition-all duration-200"
                />
                {catSearch && (
                  <button
                    type="button"
                    onClick={() => setCatSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <FiX size={12} />
                  </button>
                )}
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={catSort}
                  onChange={(e) => setCatSort(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 text-sm rounded-lg border border-gray-200 bg-white
                             text-slate-700 cursor-pointer
                             focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                             transition-all duration-200"
                >
                  <option value="default">
                    {lang === 'en' ? 'Default' : 'Mặc định'}
                  </option>
                  <option value="nameAsc">
                    {lang === 'en' ? 'Name: A–Z' : 'Tên: A–Z'}
                  </option>
                  <option value="nameDesc">
                    {lang === 'en' ? 'Name: Z–A' : 'Tên: Z–A'}
                  </option>
                </select>
                <FiChevronDown
                  size={12}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Cards grid */}
            {(() => {
              let filtered = subCategories;
              if (catSearch.trim()) {
                const q = catSearch.trim().toLowerCase();
                filtered = subCategories.filter((c) => {
                  const n = getLocalizedField(c, lang, 'name', 'nameEn') || '';
                  return n.toLowerCase().includes(q);
                });
              }
              const sorted = [...filtered].sort((a, b) => {
                const na = getLocalizedField(a, lang, 'name', 'nameEn') || '';
                const nb = getLocalizedField(b, lang, 'name', 'nameEn') || '';
                if (catSort === 'nameAsc') return na.localeCompare(nb);
                if (catSort === 'nameDesc') return nb.localeCompare(na);
                return 0;
              });

              if (sorted.length === 0) {
                return (
                  <div className="py-10 text-center text-sm text-slate-400">
                    {lang === 'en' ? 'No categories match your search.' : 'Không có danh mục phù hợp.'}
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sorted.map((cat, idx) => {
                    const catName = getLocalizedField(cat, lang, 'name', 'nameEn');
                    const catDesc = stripHtml(
                      getLocalizedField(cat, lang, 'description', 'descriptionEn'),
                    );

                    return (
                      <motion.div
                        key={cat._id}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05, duration: 0.3 }}
                      >
                        <Link
                          to={`/${lang}/categories/${cat._id}`}
                          className="group flex flex-col h-full rounded-2xl border border-gray-100 bg-white
                                     hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5
                                     transition-all duration-250 overflow-hidden"
                        >
                          {/* Image area */}
                          {cat.imageUrl ? (
                            <div className="aspect-video bg-gray-50 overflow-hidden flex-shrink-0">
                              <img
                                src={cat.imageUrl}
                                alt={catName}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                              />
                            </div>
                          ) : (
                            <div className="aspect-video flex-shrink-0 bg-gradient-to-br from-primary-50 via-indigo-50 to-emerald-50
                                            flex items-center justify-center">
                              <FiGrid size={36} className="text-primary/30" />
                            </div>
                          )}

                          {/* Content */}
                          <div className="flex flex-col flex-1 p-5">
                            <h3 className="text-[15px] font-bold text-slate-900 group-hover:text-primary
                                           transition-colors line-clamp-1 mb-1.5">
                              {catName}
                            </h3>
                            {catDesc && (
                              <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 flex-1">
                                {catDesc}
                              </p>
                            )}
                            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-primary">
                              {lang === 'en' ? 'Browse products' : 'Xem sản phẩm'}
                              <FiArrowRight
                                size={11}
                                className="transition-transform group-hover:translate-x-1"
                              />
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              );
            })()}
          </section>
        )}

        {/* ── Empty state when no content ─────────────────────────────────── */}
        {!hasTech && !hasApp && subCategories.length === 0 && (
          <section className="py-16">
            <EmptyState
              icon={FiGrid}
              title={t('mainTree.noSubCategories')}
              description={t('mainTree.noSubCategoriesHint')}
            />
          </section>
        )}
      </div>

      {/* Back link */}
      <div className="container-page pb-8">
        <Link
          to={`/${lang}/main-trees`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-primary transition-colors font-medium"
        >
          ← {t('mainTree.backToList')}
        </Link>
      </div>
    </div>
  );
};

export default MainTreeDetail;
