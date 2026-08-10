import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiArrowLeft, FiBox, FiArrowRight } from 'react-icons/fi';
import publicApi from '../api/publicApi';
import { getLocalizedField } from '../utils/i18nField';
import { SUPPORTED_LOCALES } from '../i18n';
import PageHero from '../components/PageHero';
import MarketDetailTabs from '../components/MarketDetailTabs';
import MarketAppCard from '../components/MarketAppCard';
import MarketTechCard from '../components/MarketTechCard';
import ProductCard from '../components/ProductCard';
import SectionHeader from '../components/SectionHeader';
import EmptyState from '../components/EmptyState';

const MarketDetail = () => {
  const { t } = useTranslation();
  const { id, lang: urlLang } = useParams();
  const lang = SUPPORTED_LOCALES.includes(urlLang) ? urlLang : 'vi';
  const [market, setMarket] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setNotFound(false);
    document.title = `${t('common.loading')} | Tungviet`;

    const fetchMarket = publicApi
      .getMarketTree(id, lang)
      .then((r) => {
        if (!mounted) return null;
        const data = r.data?.data;
        if (!data) {
          setNotFound(true);
          return null;
        }
        setMarket(data);
        const name = getLocalizedField(data, lang, 'title', 'titleEn');
        document.title = `${name} | ${t('market.title')}`;
        return data;
      })
      .catch((err) => {
        if (!mounted) return null;
        if (err?.response?.status === 404) setNotFound(true);
        console.warn('[MarketDetail] getMarketTree failed:', err);
        return null;
      });

    const fetchProducts = publicApi
      .getProducts({ lang, market: id, limit: 12 })
      .then((r) => {
        if (!mounted) return null;
        const items = Array.isArray(r.data?.data) ? r.data.data : r.data?.data?.items || [];
        setProducts(items);
        return items;
      })
      .catch((err) => {
        console.warn('[MarketDetail] getProducts failed:', err);
        return null;
      });

    Promise.all([fetchMarket, fetchProducts]).finally(() => {
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      document.title = t('seo.defaultTitle');
    };
  }, [id, lang]);

  const tabs = useMemo(
    () => [
      { id: 'overview', label: t('market.tabs.overview') },
      { id: 'technologies', label: t('market.tabs.technologies') },
      { id: 'applications', label: t('market.tabs.applications') },
      { id: 'products', label: t('market.tabs.products') },
    ],
    [t]
  );

  const counts = useMemo(() => {
    if (!market) return {};
    return {
      overview: undefined,
      technologies: Array.isArray(market.technologies) ? market.technologies.length : 0,
      applications: Array.isArray(market.applications) ? market.applications.length : 0,
      products: products.length,
    };
  }, [market, products]);

  if (loading) {
    return (
      <div className="container-page py-16 md:py-24 text-center">
        <div className="inline-block w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-sm text-gray-500">{t('common.loading')}</p>
      </div>
    );
  }

  if (notFound || !market) {
    return (
      <div className="container-page py-16 md:py-24 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-50 text-primary mb-4">
          <FiBox size={28} />
        </div>
        <h1 className="text-2xl font-semibold text-slate-900 mb-3">
          {t('market.notFound')}
        </h1>
        <Link
          to={`/${lang}/markets`}
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-medium"
        >
          ← {t('market.backToList')}
        </Link>
      </div>
    );
  }

  const name = getLocalizedField(market, lang, 'title', 'titleEn');
  const description = getLocalizedField(market, lang, 'description', 'descriptionEn');
  const technologies = Array.isArray(market.technologies) ? market.technologies : [];
  const applications = Array.isArray(market.applications) ? market.applications : [];

  return (
    <div>
      <PageHero
        title={name}
        subtitle={description}
        breadcrumb={[
          { label: t('market.breadcrumbHome'), to: `/${lang}` },
          { label: t('market.breadcrumbMarkets'), to: `/${lang}/markets` },
          { label: name },
        ]}
      />

      {market.imageUrl && (
        <section className="container-page -mt-6 mb-8">
          <div className="rounded-2xl overflow-hidden shadow-lg aspect-video bg-gray-100">
            <img
              src={market.imageUrl}
              alt={name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </section>
      )}

      <MarketDetailTabs
        tabs={tabs}
        activeId={activeTab}
        onChange={setActiveTab}
        counts={counts}
      />

      {/* Overview panel */}
      {activeTab === 'overview' && (
        <section className="container-page py-10 md:py-14">
          <Link
            to={`/${lang}/markets`}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-6 transition-colors"
          >
            <FiArrowLeft size={14} />
            {t('market.backToList')}
          </Link>

          {market.mainTree && (
            <div className="mb-6 text-sm text-gray-500">
              <span className="font-medium">{t('nav.mainTreeMenuTitle')}: </span>
              <Link
                to={`/${lang}/products?mainTree=${market.mainTree._id}`}
                className="text-primary hover:underline"
              >
                {getLocalizedField(market.mainTree, lang, 'name', 'nameEn')}
              </Link>
            </div>
          )}

          {description && (
            <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed mb-10">
              <p>{description}</p>
            </div>
          )}

          {market.mainTree && (
            <div className="bg-gradient-to-r from-primary-50 to-primary-100/60 rounded-2xl p-6 md:p-7 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-slate-900 mb-1">
                  {t('market.productsInMarket')}
                </h3>
                <p className="text-sm text-slate-600">
                  {t('market.featuredProducts')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('products')}
                className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-sm"
              >
                {t('common.viewAll')}
                <FiArrowRight size={14} />
              </button>
            </div>
          )}
        </section>
      )}

      {/* Technologies panel */}
      {activeTab === 'technologies' && (
        <section className="container-page py-10 md:py-14">
          <SectionHeader
            eyebrow={t('market.tabs.technologies')}
            title={t('market.tabs.technologies')}
            align="left"
            className="mb-8"
          />
          {technologies.length === 0 ? (
            <EmptyState
              icon={FiBox}
              title={t('market.noTechnologies')}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {technologies.map((tech, idx) => (
                <MarketTechCard key={tech._id || idx} tech={tech} index={idx} lang={lang} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Applications panel */}
      {activeTab === 'applications' && (
        <section className="container-page py-10 md:py-14">
          <SectionHeader
            eyebrow={t('market.tabs.applications')}
            title={t('market.tabs.applications')}
            align="left"
            className="mb-8"
          />
          {applications.length === 0 ? (
            <EmptyState
              icon={FiBox}
              title={t('market.noApplications')}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {applications.map((app, idx) => (
                <MarketAppCard
                  key={app._id || idx}
                  app={{ ...app, products: app.productIds || [] }}
                  index={idx}
                  lang={lang}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Products panel */}
      {activeTab === 'products' && (
        <section className="container-page py-10 md:py-14">
          <SectionHeader
            eyebrow={t('market.tabs.products')}
            title={t('market.tabs.products')}
            subtitle={
              products.length > 0
                ? t('market.productCount', { count: products.length })
                : ''
            }
            align="left"
            className="mb-8"
          />
          {products.length === 0 ? (
            <EmptyState
              icon={FiBox}
              title={t('market.noProducts')}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
              {products.map((product, idx) => (
                <ProductCard key={product._id} product={product} index={idx} />
              ))}
            </div>
          )}
          {products.length > 0 && (
            <div className="mt-10 text-center">
              <Link
                to={`/${lang}/products?market=${id}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-700 transition-colors"
              >
                {t('market.viewAllProducts')}
                <FiArrowRight size={14} />
              </Link>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default MarketDetail;