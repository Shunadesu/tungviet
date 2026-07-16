import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { FiChevronRight, FiFile, FiDownload } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import SectionHeader from '../components/SectionHeader';
import SEO from '../components/SEO';
import publicApi from '../api/publicApi';
import { SUPPORTED_LOCALES } from '../i18n';
import { sanitizeHtml } from '../utils/sanitize';
import placeholderProduct from '../assets/placeholder-product.svg';

const Markets = () => {
  const { t, i18n } = useTranslation();
  const lang = SUPPORTED_LOCALES.includes(i18n.language) ? i18n.language : 'vi';

  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarkets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const fetchMarkets = async () => {
    try {
      const res = await publicApi.getMarkets({ lang, limit: 50 });
      setMarkets(res?.data?.data || []);
    } catch (error) {
      console.error('[Markets] error:', error);
      setMarkets([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen"
    >
      <SEO
        title={t('market.title')}
        description={t('market.subtitle')}
        url={`/${lang}/markets`}
      />

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <nav className="flex items-center gap-1 text-xs text-gray-500">
            <Link to={`/${lang}`} className="hover:text-primary">
              {t('market.breadcrumbHome')}
            </Link>
            <FiChevronRight size={12} />
            <span className="text-gray-700">{t('market.breadcrumbMarkets')}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 py-6">
        <SectionHeader
          title={t('market.title')}
          subtitle={t('market.subtitle')}
        />

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : markets.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>{t('market.noMarkets')}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {markets.map((market, index) => (
              <MarketSection key={market._id} market={market} lang={lang} index={index} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const MarketSection = ({ market, lang, index }) => {
  const { t } = useTranslation();
  const hasProducts = market.selectedProducts && market.selectedProducts.length > 0;
  const description = market.description ? sanitizeHtml(market.description) : '';

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-sm border overflow-hidden"
    >
      {/* Header */}
      <div className="relative">
        {market.imageUrl ? (
          <img
            src={market.imageUrl}
            alt={market.title}
            className="w-full h-48 object-cover"
            onError={(e) => { e.currentTarget.src = placeholderProduct; }}
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-r from-primary-100 to-primary-50 flex items-center justify-center">
            <span className="text-4xl">🌍</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
          <div className="p-4 text-white flex-1">
            <h2 className="text-xl font-semibold">{market.title}</h2>
          </div>
          {market.tdsUrl && (
            <a
              href={market.tdsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-3 right-3 flex items-center gap-1.5 bg-accent text-white text-xs px-3 py-1.5 rounded-lg hover:bg-accent-dark transition-colors"
            >
              <FiDownload size={14} />
              {t('market.downloadTds')}
            </a>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Description */}
        {description && (
          <div
            className="mb-4 prose prose-sm max-w-none text-gray-600"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}

        {/* Technologies */}
        {market.technologies && market.technologies.length > 0 && (
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
              {t('market.technologies')}
            </h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {market.technologies.filter((tt) => tt.isActive !== false).map((tech, i) => {
                const techTitle = lang === 'en' && tech.titleEn ? tech.titleEn : tech.title;
                const techDesc = lang === 'en' && tech.descriptionEn ? sanitizeHtml(tech.descriptionEn) : sanitizeHtml(tech.description);
                const techProducts = tech.products?.filter((p) => p.isActive !== false) || [];
                return (
                  <div key={i} className="bg-primary-50/50 rounded-lg p-3 border border-primary-100">
                    <div className="flex items-start gap-2 mb-2">
                      {tech.imageUrl ? (
                        <img
                          src={tech.imageUrl}
                          alt={techTitle}
                          className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                          onError={(e) => { e.currentTarget.src = placeholderProduct; }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-primary flex-shrink-0 text-xs font-bold">
                          {techTitle?.charAt(0)?.toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-800">{techTitle}</h4>
                        {techProducts.length > 0 && (
                          <span className="text-[10px] text-primary">
                            {t('market.productCount', { count: techProducts.length })}
                          </span>
                        )}
                      </div>
                    </div>
                    {techDesc && (
                      <div
                        className="text-[10px] text-gray-500 line-clamp-2 prose prose-xs max-w-none"
                        dangerouslySetInnerHTML={{ __html: techDesc }}
                      />
                    )}
                    {techProducts.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {techProducts.slice(0, 3).map((product, pi) => (
                          <span key={pi} className="text-[9px] px-1.5 py-0.5 bg-white text-gray-600 rounded border">
                            {product.name || product.nameEn}
                          </span>
                        ))}
                        {techProducts.length > 3 && (
                          <span className="text-[9px] px-1.5 py-0.5 text-gray-400">
                            +{techProducts.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Applications */}
        {market.applications && market.applications.length > 0 && (
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
              {t('market.applications')}
            </h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {market.applications.filter((a) => a.isActive !== false).map((app, i) => {
                const appTitle = lang === 'en' && app.titleEn ? app.titleEn : app.title;
                const appBenefits = lang === 'en' && app.benefitsEn
                  ? sanitizeHtml(app.benefitsEn)
                  : sanitizeHtml(app.benefits);
                const appProducts = app.products?.filter((p) => p.isActive !== false) || [];
                return (
                  <div key={i} className="bg-green-50/50 rounded-lg p-3 border border-green-100">
                    <div className="flex items-start gap-2 mb-2">
                      {app.imageUrl ? (
                        <img
                          src={app.imageUrl}
                          alt={appTitle}
                          className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                          onError={(e) => { e.currentTarget.src = placeholderProduct; }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0 text-xs font-bold">
                          {appTitle?.charAt(0)?.toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-800">{appTitle}</h4>
                        {appProducts.length > 0 && (
                          <span className="text-[10px] text-green-600">
                            {t('market.productCount', { count: appProducts.length })}
                          </span>
                        )}
                      </div>
                    </div>
                    {appBenefits && (
                      <div
                        className="text-[10px] text-gray-500 line-clamp-3 mb-2 prose prose-xs max-w-none"
                        dangerouslySetInnerHTML={{ __html: appBenefits }}
                      />
                    )}
                    {appProducts.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {appProducts.slice(0, 3).map((product, pi) => (
                          <span key={pi} className="text-[9px] px-1.5 py-0.5 bg-white text-gray-600 rounded border">
                            {product.name || product.nameEn}
                          </span>
                        ))}
                        {appProducts.length > 3 && (
                          <span className="text-[9px] px-1.5 py-0.5 text-gray-400">
                            +{appProducts.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TDS Download Button */}
        {market.tdsUrl && (
          <div className="mb-4">
            <a
              href={market.tdsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm px-4 py-2 bg-accent-50 text-accent rounded-lg hover:bg-accent-100 transition-colors"
            >
              <FiFile size={16} />
              {t('market.downloadTds')} (PDF)
            </a>
          </div>
        )}

        {/* Products */}
        {hasProducts ? (
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
              {t('market.products')} ({market.selectedProducts.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {market.selectedProducts.map((product) => (
                <MarketProductCard key={product._id} product={product} lang={lang} />
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">
            {t('market.noProducts')}
          </p>
        )}
      </div>
    </motion.section>
  );
};

const MarketProductCard = ({ product, lang }) => {
  return (
    <div className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <Link to={`/${lang}/products/${product._id}`}>
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-24 object-cover"
            onError={(e) => { e.currentTarget.src = placeholderProduct; }}
          />
        ) : (
          <div className="w-full h-24 bg-gray-200 flex items-center justify-center text-2xl">
            📦
          </div>
        )}
        <div className="p-2">
          <h4 className="text-xs font-medium line-clamp-2">{product.name}</h4>
        </div>
      </Link>
      <div className="px-2 pb-2 flex gap-1 flex-wrap">
        {product.softeningPoint && (
          <span className="text-[9px] px-1 py-0.5 bg-orange-50 text-orange-600 rounded">
            {product.softeningPoint}
          </span>
        )}
        {product.tdsUrl && (
          <a
            href={product.tdsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-[9px] px-1 py-0.5 bg-accent-50 text-accent rounded flex items-center gap-0.5"
          >
            <FiFile size={8} />
            TDS
          </a>
        )}
      </div>
    </div>
  );
};

export default Markets;