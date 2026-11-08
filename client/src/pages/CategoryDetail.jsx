import { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiArrowLeft, FiArrowRight, FiBox, FiLayers } from 'react-icons/fi';
import publicApi from '../api/publicApi';
import { getLocalizedField } from '../utils/i18nField';
import { SUPPORTED_LOCALES } from '../i18n';
import PageHero from '../components/PageHero';
import Skeleton from '../components/Skeleton';
import SkuTable from '../components/SkuTable';
import EmptyState from '../components/EmptyState';
import SectionHeader from '../components/SectionHeader';
import SEO from '../components/SEO';
import { sanitizeHtml } from '../utils/sanitize';
import { htmlToText } from '../utils/html';

/** Số SKU tối đa tải về cho 1 product line. */
const MAX_SKU_FETCH = 500;

const CategoryDetail = () => {
  const { t } = useTranslation();
  const { id, lang: urlLang } = useParams();
  const [searchParams] = useSearchParams();
  const lang = SUPPORTED_LOCALES.includes(urlLang) ? urlLang : 'vi';
  const page = Math.max(1, parseInt(searchParams.get('page'), 10) || 1);

  const [category, setCategory] = useState(null);
  const [mainTree, setMainTree] = useState(null);
  const [skus, setSkus] = useState([]);
  const [totalSkus, setTotalSkus] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    Promise.all([publicApi.getCategory(id, lang).catch(() => null)])
      .then(async ([catRes]) => {
        if (!mounted) return;
        const cat = catRes?.data?.data;
        if (!cat) {
          setNotFound(true);
          return;
        }
        setCategory(cat);

        // `cat.mainTree` đã được populate sẵn từ server (object, không phải id)
        const mt = cat.mainTree && typeof cat.mainTree === 'object' ? cat.mainTree : null;
        if (mt) setMainTree(mt);

        const prodsRes = await publicApi
          .getProducts({ lang, productLine: id, page: 1, limit: MAX_SKU_FETCH })
          .catch(() => null);

        if (!mounted) return;

        const raw = prodsRes?.data?.data;
        const items = Array.isArray(raw) ? raw : raw?.items || [];
        setSkus(items);
        const pg = prodsRes?.data?.pagination || prodsRes?.data?.data?.pagination;
        setTotalSkus(pg?.total ?? items.length);

        const name = getLocalizedField(cat, lang, 'name', 'nameEn');
        document.title = `${name} | Tungviet`;
      })
      .catch((err) => {
        console.warn('[CategoryDetail] fetch failed:', err);
        if (mounted) setNotFound(true);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
      document.title = t('seo.defaultTitle');
    };
  }, [id, lang, page, t]);

  if (loading) {
    return <Skeleton.CategoryDetail />;
  }

  if (notFound || !category) {
    return (
      <div className="container-page py-16 md:py-24 text-center">
        <SEO
          title={t('category.notFound')}
          description={t('category.subtitle')}
          url={`/${lang}/categories/${id}`}
        />
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-50 text-primary mb-4">
          <FiBox size={28} />
        </div>
        <h1 className="text-2xl font-semibold text-slate-900 mb-3">
          {t('category.notFound')}
        </h1>
        <Link
          to={`/${lang}/products`}
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-medium"
        >
          ← {t('common.viewAll')} {t('nav.products')}
        </Link>
      </div>
    );
  }

  const name = getLocalizedField(category, lang, 'name', 'nameEn');
  const description = getLocalizedField(category, lang, 'description', 'descriptionEn');
  const descriptionText = htmlToText(description);
  const seoDescription = descriptionText.slice(0, 160) || t('category.subtitle');
  const mainTreeName = mainTree
    ? getLocalizedField(mainTree, lang, 'name', 'nameEn')
    : null;

  const breadcrumb = [
    { label: t('category.breadcrumbHome'), to: `/${lang}` },
    { label: t('nav.mainTreeMenuTitle'), to: `/${lang}/main-trees` },
  ];
  if (mainTree) {
    breadcrumb.push({
      label: mainTreeName,
      to: `/${lang}/main-trees/${mainTree._id}`,
    });
  }
  breadcrumb.push({ label: name });

  const skuCount = skus.length;

  return (
    <div className="bg-white">
      <SEO
        title={`${name} | ${t('category.title')}`}
        description={seoDescription}
        keywords={t('seo.defaultKeywords')}
        url={`/${lang}/categories/${id}`}
        breadcrumb={breadcrumb}
      />

      <PageHero
        title={name}
        subtitle={descriptionText || undefined}
        breadcrumb={breadcrumb}
      >
        {skuCount > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold">
            <FiLayers size={12} />
            {t('product.skuCount', { n: skuCount })}
          </span>
        )}
      </PageHero>

      {category.imageUrl && (
        <section className="container-page -mt-4 mb-8">
          <div className="max-w-3xl mx-auto rounded-xl overflow-hidden shadow-card aspect-banner bg-gray-100">
            <img
              src={category.imageUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
        </section>
      )}

      {description && (
        <section className="container-page mb-8">
          <div
            className="prose prose-base max-w-none text-slate-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }}
          />
        </section>
      )}

      <Link
        to={mainTree ? `/${lang}/main-trees/${mainTree._id}` : `/${lang}/main-trees`}
        className="container-page inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-6 transition-colors"
      >
        <FiArrowLeft size={14} />
        {mainTree ? mainTreeName : t('category.backToList')}
      </Link>

      <section className="container-page py-8 md:py-10">
        <div className="flex items-end justify-between mb-6 md:mb-8 gap-3 flex-wrap">
          <SectionHeader
            eyebrow={t('category.title')}
            title={t('category.skuList')}
            className="mb-0"
          />
          {skuCount > 0 && (
            <Link
              to={`/${lang}/products?category=${id}${mainTree ? `&industries=${mainTree._id}` : ''}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-700 transition-colors whitespace-nowrap"
            >
              {t('category.viewAll')}
              <FiArrowRight size={14} />
            </Link>
          )}
        </div>

        {skus.length === 0 ? (
          <EmptyState
            icon={FiBox}
            title={t('category.noProducts')}
            description={t('mainTree.noSubCategoriesHint')}
          />
        ) : (
          <SkuTable skus={skus} lang={lang} />
        )}

        {totalSkus > skus.length && (
          <p className="mt-5 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            {t('product.truncatedNotice', { shown: skus.length, total: totalSkus })}
          </p>
        )}
      </section>
    </div>
  );
};

export default CategoryDetail;
