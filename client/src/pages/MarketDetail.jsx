import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiArrowLeft, FiBox, FiArrowRight } from 'react-icons/fi';
import publicApi from '../api/publicApi';
import { getLocalizedField } from '../utils/i18nField';
import { SUPPORTED_LOCALES } from '../i18n';
import PageHero from '../components/PageHero';
import RelatedProducts from '../components/RelatedProducts';

const MarketDetail = () => {
  const { t } = useTranslation();
  const { id, lang: urlLang } = useParams();
  const lang = SUPPORTED_LOCALES.includes(urlLang) ? urlLang : 'vi';
  const [market, setMarket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    document.title = `${t('common.loading')} | Tungviet`;
    publicApi
      .getMarketTree(id, lang)
      .then((r) => {
        const data = r.data?.data;
        if (!data) {
          setNotFound(true);
        } else {
          setMarket(data);
          const name = getLocalizedField(data, lang, 'name', 'nameEn');
          document.title = `${name} | ${t('market.title')}`;
        }
      })
      .catch((err) => {
        if (err?.response?.status === 404) setNotFound(true);
        console.warn('[MarketDetail] getMarketTree failed:', err);
      })
      .finally(() => setLoading(false));
    return () => {
      document.title = t('seo.defaultTitle');
    };
  }, [id, lang, t]);

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

  const name = getLocalizedField(market, lang, 'name', 'nameEn');
  const description = getLocalizedField(
    market,
    lang,
    'description',
    'descriptionEn'
  );

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
        <section className="container-page -mt-6 mb-10">
          <div className="rounded-2xl overflow-hidden shadow-lg aspect-video bg-gray-100">
            <img
              src={market.imageUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
        </section>
      )}

      <section className="container-page pb-12 md:pb-16">
        <Link
          to={`/${lang}/markets`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-6 transition-colors"
        >
          <FiArrowLeft size={14} />
          {t('market.backToList')}
        </Link>

        {/* MainTree crumb */}
        {market.mainTree && (
          <div className="mb-6 text-sm text-gray-500">
            <span className="font-medium">{t('nav.mainTrees')}: </span>
            <Link
              to={`/${lang}/products?mainTree=${market.mainTree._id}`}
              className="text-primary hover:underline"
            >
              {getLocalizedField(market.mainTree, lang, 'name', 'nameEn')}
            </Link>
          </div>
        )}

        {/* Description */}
        {description && (
          <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed mb-10">
            <p>{description}</p>
          </div>
        )}

        {/* CTA: xem sản phẩm trong ngành này */}
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
            <Link
              to={`/${lang}/products?mainTree=${market.mainTree._id}`}
              className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-sm"
            >
              {t('common.viewAll')}
              <FiArrowRight size={14} />
            </Link>
          </div>
        )}
      </section>

      {/* Related products (same mainTree) */}
      <RelatedProducts
        currentProduct={{ _id: market._id, mainTree: market.mainTree?._id }}
        limit={4}
      />
    </div>
  );
};

export default MarketDetail;
