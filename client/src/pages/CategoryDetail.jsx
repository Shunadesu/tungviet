import { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiArrowRight, FiBox } from 'react-icons/fi';
import publicApi from '../api/publicApi';
import { getLocalizedField } from '../utils/i18nField';
import { SUPPORTED_LOCALES } from '../i18n';
import PageHero from '../components/PageHero';
import ProductCard from '../components/ProductCard';
import EmptyState from '../components/EmptyState';
import SectionHeader from '../components/SectionHeader';
import LoadMore from '../components/LoadMore';
import SEO from '../components/SEO';
import { sanitizeHtml } from '../utils/sanitize';
import { htmlToText } from '../utils/html';

const PAGE_SIZE = 24;

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const CategoryDetail = () => {
  const { t } = useTranslation();
  const { id, lang: urlLang } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const lang = SUPPORTED_LOCALES.includes(urlLang) ? urlLang : 'vi';
  const page = Math.max(1, parseInt(searchParams.get('page'), 10) || 1);

  const [category, setCategory] = useState(null);
  const [mainTree, setMainTree] = useState(null);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let mounted = true;
    const isFirstPage = page === 1;
    if (isFirstPage) setLoading(true);
    else setLoadingMore(true);

    Promise.all([publicApi.getCategory(id, lang).catch(() => null)])
      .then(async ([catRes]) => {
        if (!mounted) return;
        const cat = catRes?.data?.data;
        if (!cat) {
          setNotFound(true);
          return;
        }
        setCategory(cat);

        const mainTreeId = cat.mainTree;
        const [mtRes, prodsRes] = await Promise.all([
          mainTreeId
            ? publicApi.getMainTree(mainTreeId, lang).catch(() => null)
            : Promise.resolve(null),
          publicApi
            .getProducts({ lang, category: id, page, limit: PAGE_SIZE })
            .catch(() => null),
        ]);

        if (!mounted) return;
        if (mtRes?.data?.data) setMainTree(mtRes.data.data);
        const items = Array.isArray(prodsRes?.data?.data) ? prodsRes.data.data : [];
        const pg = prodsRes?.data?.pagination || { page, total: items.length, pages: 1 };
        if (isFirstPage) setProducts(items);
        else setProducts((prev) => [...prev, ...items]);
        setPagination(pg);

        const name = getLocalizedField(cat, lang, 'name', 'nameEn');
        document.title = `${name} | Tungviet`;
      })
      .catch((err) => {
        console.warn('[CategoryDetail] fetch failed:', err);
        if (mounted) setNotFound(true);
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
          setLoadingMore(false);
        }
      });

    return () => {
      mounted = false;
      document.title = t('seo.defaultTitle');
    };
  }, [id, lang, page, t]);

  const loadMore = () => {
    if (pagination.page < pagination.pages) {
      const next = new URLSearchParams(searchParams);
      next.set('page', String(pagination.page + 1));
      setSearchParams(next);
      setTimeout(() => {
        window.scrollBy({ top: 200, behavior: 'smooth' });
      }, 80);
    }
  };

  const hasMore = pagination.page < pagination.pages;

  if (loading) {
    return (
      <div className="container-page py-16 md:py-24 text-center">
        <div className="inline-block w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-sm text-gray-500">{t('common.loading')}</p>
      </div>
    );
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

  return (
    <div className="bg-white">
      <SEO
        title={`${name} | ${t('category.title')}`}
        description={seoDescription}
        keywords={t('seo.defaultKeywords')}
        url={`/${lang}/categories/${id}`}
      />

      <PageHero
        title={name}
        subtitle={descriptionText || undefined}
        breadcrumb={breadcrumb}
      />

      {category.imageUrl && (
        <section className="container-page -mt-6 mb-10">
          <div className="rounded-2xl overflow-hidden shadow-lg aspect-video bg-gray-100">
            <img
              src={category.imageUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
        </section>
      )}

      {description && (
        <section className="container-page mb-10 md:mb-12">
          <div
            className="prose prose-lg max-w-none text-slate-700 leading-relaxed"
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

      <section className="container-page py-10 md:py-12">
        <div className="flex items-end justify-between mb-6 md:mb-8 gap-3 flex-wrap">
          <SectionHeader
            eyebrow={t('category.title')}
            title={t('category.productsInCategory')}
            className="mb-0"
          />
          {products.length > 0 && (
            <Link
              to={`/${lang}/products?category=${id}${mainTree ? `&mainTree=${mainTree._id}` : ''}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-700 transition-colors whitespace-nowrap"
            >
              {t('category.viewAll')}
              <FiArrowRight size={14} />
            </Link>
          )}
        </div>

        {products.length === 0 ? (
          <EmptyState
            icon={FiBox}
            title={t('category.noProducts')}
            description={t('mainTree.noSubCategoriesHint')}
          />
        ) : (
          <>
            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {products.map((product, idx) => (
                <motion.div key={product._id} variants={itemVariants}>
                  <ProductCard product={product} index={idx} />
                </motion.div>
              ))}
            </motion.div>
            <LoadMore
              hasMore={hasMore}
              loading={loadingMore}
              onLoad={loadMore}
              total={pagination.total}
              shown={products.length}
              label={t('product.loadMore')}
            />
          </>
        )}
      </section>
    </div>
  );
};

export default CategoryDetail;
