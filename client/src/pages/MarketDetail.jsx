import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiDownload,
  FiCpu,
  FiPackage,
  FiFileText,
  FiCheckCircle,
  FiArrowRight,
  FiGrid,
  FiBox,
} from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import PageHero from '../components/PageHero';
import EmptyState from '../components/EmptyState';
import ProductCard from '../components/ProductCard';
import MarketDetailTabs from '../components/MarketDetailTabs';
import MarketTechCard from '../components/MarketTechCard';
import MarketAppCard from '../components/MarketAppCard';
import publicApi from '../api/publicApi';
import { SUPPORTED_LOCALES } from '../i18n';
import { sanitizeHtml } from '../utils/sanitize';
import {
  getMarketTitle,
  getMarketDescription,
  getMarketImage,
  getMarketTdsUrl,
} from '../utils/market';
import { htmlToText } from '../utils/html';

const TABS = [
  { id: 'overview' },
  { id: 'technologies' },
  { id: 'applications' },
  { id: 'products' },
];

const MarketDetail = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const lang = SUPPORTED_LOCALES.includes(i18n.language) ? i18n.language : 'vi';

  const [market, setMarket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchMarket();
    window.scrollTo({ top: 0, behavior: 'instant' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, lang]);

  const fetchMarket = async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const res = await publicApi.getMarket(id, lang);
      const data = res?.data?.data;
      if (!data) {
        setNotFound(true);
      } else {
        setMarket(data);
        setActiveTab('overview');
      }
    } catch (error) {
      console.error('[MarketDetail] error:', error);
      if (error.response?.status === 404) setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const technologies = useMemo(
    () => (market?.technologies || []).filter((tt) => tt.isActive !== false),
    [market]
  );
  const applications = useMemo(
    () => (market?.applications || []).filter((a) => a.isActive !== false),
    [market]
  );
  const products = useMemo(() => market?.selectedProducts || [], [market]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (notFound || !market) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-2xl font-semibold text-slate-900 mb-3">
          {t('market.notFound')}
        </h1>
        <Link to={`/${lang}/markets`} className="btn-primary">
          {t('market.backToList')}
        </Link>
      </div>
    );
  }

  const title = getMarketTitle(market, lang);
  const descriptionRaw = getMarketDescription(market, lang);
  const descriptionHtml = descriptionRaw ? sanitizeHtml(descriptionRaw) : '';
  const descriptionPlain = htmlToText(descriptionRaw);
  const heroImage = getMarketImage(market);
  const tdsUrl = getMarketTdsUrl(market);

  const breadcrumb = [
    { label: t('market.breadcrumbHome'), to: `/${lang}` },
    { label: t('market.breadcrumbMarkets'), to: `/${lang}/markets` },
    { label: title },
  ];

  const tabs = TABS.map((tab) => ({ ...tab, label: t(`market.tabs.${tab.id}`) }));
  const tabCounts = {
    technologies: technologies.length,
    applications: applications.length,
    products: products.length,
  };

  const stats = [
    { id: 'products', icon: FiBox, value: products.length, label: t('market.productCount', { count: products.length }) },
    { id: 'tech', icon: FiCpu, value: technologies.length, label: t('market.techsCount', { n: technologies.length }) },
    { id: 'apps', icon: FiPackage, value: applications.length, label: t('market.appsCount', { n: applications.length }) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white"
    >
      <SEO
        title={title}
        description={(descriptionPlain || title).slice(0, 200)}
        url={`/${lang}/markets/${market._id}`}
      />

      <PageHero
        breadcrumb={breadcrumb}
        title={title}
        subtitle={descriptionPlain ? descriptionPlain.slice(0, 220) : t('market.subtitle')}
        background={heroImage || undefined}
      >
        <div className="mt-8 max-w-3xl mx-auto">
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {stats.map(({ id: sid, icon: Icon, value, label }) => (
              <div
                key={sid}
                className="flex flex-col items-center text-center px-2 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15"
              >
                <Icon size={18} className="text-white/90 mb-1" />
                <span className="text-xl sm:text-2xl font-bold text-white leading-none">
                  {value}
                </span>
                <span className="mt-1 text-[10px] sm:text-xs text-white/75 leading-tight line-clamp-2">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {tdsUrl && (
            <div className="mt-5 flex justify-center">
              <a
                href={tdsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-accent shadow-card"
              >
                <FiDownload size={16} />
                {t('market.downloadTds')} (PDF)
              </a>
            </div>
          )}
        </div>
      </PageHero>

      <MarketDetailTabs
        tabs={tabs}
        activeId={activeTab}
        onChange={setActiveTab}
        counts={tabCounts}
      />

      <section className="container-page py-10 md:py-14">
        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
            <div className="lg:col-span-2 space-y-10">
              {descriptionHtml && (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <span className="heading-eyebrow">{t('market.about')}</span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>
                  <div
                    className="rich-content prose prose-slate max-w-none text-slate-700 leading-relaxed prose-headings:text-slate-900 prose-img:rounded-xl prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
                    dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                  />
                </div>
              )}

              {(technologies.length > 0 || applications.length > 0) && (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <span className="heading-eyebrow">{t('market.whyThisMarket')}</span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>
                  <div className="card p-5 md:p-6 bg-gradient-to-br from-primary-50/60 to-white border-primary-100">
                    <ul className="grid sm:grid-cols-2 gap-3">
                      {[
                        technologies.length > 0 && {
                          icon: FiCpu,
                          label: t('market.technologies'),
                          value: technologies.length,
                        },
                        applications.length > 0 && {
                          icon: FiPackage,
                          label: t('market.applications'),
                          value: applications.length,
                        },
                        products.length > 0 && {
                          icon: FiBox,
                          label: t('market.products'),
                          value: products.length,
                        },
                        tdsUrl && {
                          icon: FiFileText,
                          label: t('market.downloadTds'),
                          value: 'PDF',
                        },
                      ]
                        .filter(Boolean)
                        .map(({ icon: Icon, label, value }) => (
                          <li
                            key={label}
                            className="flex items-center gap-3 text-sm"
                          >
                            <span className="flex-shrink-0 w-9 h-9 rounded-xl bg-white text-primary flex items-center justify-center shadow-sm border border-primary-100">
                              <Icon size={16} />
                            </span>
                            <span className="flex-1 text-slate-700">{label}</span>
                            <span className="font-semibold text-slate-900">
                              {value}
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              )}

              <div>
                <Link
                  to={`/${lang}/quote?market=${market._id}`}
                  className="btn-primary w-full sm:w-auto"
                >
                  <FiFileText size={16} />
                  {t('market.requestQuoteForMarket')}
                  <FiArrowRight size={14} />
                </Link>
              </div>
            </div>

            <aside className="lg:col-span-1">
              <div className="space-y-4 lg:sticky lg:top-32">
                {tdsUrl && (
                  <div className="card p-5">
                    <h3 className="heading-eyebrow mb-3">
                      {t('market.downloadTds')}
                    </h3>
                    <a
                      href={tdsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-accent w-full"
                    >
                      <FiDownload size={16} />
                      PDF
                    </a>
                  </div>
                )}

                <div className="card p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <FiGrid size={14} className="text-primary" />
                    <h3 className="heading-eyebrow">{t('market.keySpecs')}</h3>
                  </div>
                  <dl className="space-y-3">
                    {stats.map(({ id: sid, icon: Icon, value, label }) => (
                      <div
                        key={sid}
                        className="flex items-center justify-between gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0"
                      >
                        <dt className="flex items-center gap-2 text-sm text-slate-600">
                          <Icon size={14} className="text-primary" />
                          {label}
                        </dt>
                        <dd className="text-sm font-semibold text-slate-900">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* Technologies */}
        {activeTab === 'technologies' && (
          <div>
            {technologies.length === 0 ? (
              <EmptyState
                icon={FiCpu}
                title={t('market.noTechnologies')}
                description=""
              />
            ) : (
              <>
                <div className="mb-8 flex items-end justify-between gap-4">
                  <div className="min-w-0">
                    <span className="heading-eyebrow">
                      {t('market.technologies')}
                    </span>
                    <h2 className="heading-section mt-2">
                      {lang === 'en'
                        ? `Core technologies powering this market`
                        : 'Công nghệ cốt lõi của thị trường này'}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500 max-w-2xl">
                      {lang === 'en'
                        ? 'Explore the formulation and processing techniques behind our solutions for this market.'
                        : 'Khám phá công thức và quy trình xử lý đứng sau các giải pháp cho thị trường này.'}
                    </p>
                  </div>
                  <span className="hidden sm:inline-flex flex-shrink-0 items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 text-primary text-xs font-semibold ring-1 ring-primary-100">
                    <FiCpu size={12} />
                    {technologies.length}{' '}
                    {lang === 'en' ? 'technologies' : 'công nghệ'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5 md:gap-6">
                  {technologies.map((tech, i) => (
                    <MarketTechCard
                      key={tech._id ?? `t-${i}`}
                      tech={tech}
                      index={i}
                      lang={lang}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Applications */}
        {activeTab === 'applications' && (
          <div>
            {applications.length === 0 ? (
              <EmptyState
                icon={FiPackage}
                title={t('market.noApplications')}
                description=""
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                {applications.map((app, i) => (
                  <MarketAppCard
                    key={app._id ?? `a-${i}`}
                    app={app}
                    index={i}
                    lang={lang}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Products */}
        {activeTab === 'products' && (
          <div>
            {products.length === 0 ? (
              <EmptyState
                icon={FiBox}
                title={t('market.noProducts')}
                description=""
              />
            ) : (
              <>
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <span className="heading-eyebrow">
                      {t('market.featuredProducts')}
                    </span>
                    <h2 className="heading-section mt-2">
                      {t('market.productsInMarket')}
                    </h2>
                  </div>
                  <span className="text-sm text-slate-500">
                    {t('market.productCount', { count: products.length })}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {products.map((product, idx) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      index={idx}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </section>

      <section className="container-page pb-12 md:pb-16">
        <div className="rounded-2xl bg-gradient-to-br from-primary/90 via-primary to-primary-800 p-6 md:p-8 lg:p-10 flex flex-col md:flex-row md:items-center gap-5 md:gap-8 shadow-card-hover overflow-hidden relative">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl"
          />
          <div className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/15 text-white">
            <FiCheckCircle size={26} />
          </div>
          <div className="flex-1 text-white">
            <h3 className="text-lg md:text-xl font-semibold mb-1">
              {t('market.requestQuoteForMarket')}
            </h3>
            <p className="text-sm md:text-base text-white/85">
              {title}
            </p>
          </div>
          <Link
            to={`/${lang}/quote?market=${market._id}`}
            className="inline-flex items-center justify-center gap-2 bg-white text-primary font-medium px-5 py-3 rounded-xl text-sm transition-all hover:bg-white/90 active:scale-[0.98] shadow-card"
          >
            {lang === 'en' ? 'Get a quote' : 'Yêu cầu báo giá'}
            <FiArrowRight size={14} />
          </Link>
        </div>
      </section>
    </motion.div>
  );
};

export default MarketDetail;