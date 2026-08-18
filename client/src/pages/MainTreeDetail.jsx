import { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiArrowRight, FiBox, FiGrid } from 'react-icons/fi';
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

const PAGE_SIZE = 12;

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const stripHtml = (html) => (html ? sanitizeHtml(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '');

const MainTreeDetail = () => {
  const { t } = useTranslation();
  const { id, lang: urlLang } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const lang = SUPPORTED_LOCALES.includes(urlLang) ? urlLang : 'vi';
  const page = Math.max(1, parseInt(searchParams.get('page'), 10) || 1);

  const [mainTree, setMainTree] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
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
    document.title = `${t('common.loading')} | Tungviet`;

    Promise.all([
      publicApi.getMainTree(id, lang).catch(() => null),
      publicApi.getCategories({ lang, mainTree: id }).catch(() => null),
      publicApi.getProducts({ lang, industries: id, page, limit: PAGE_SIZE }).catch(() => null),
    ])
      .then(([treeRes, catsRes, prodsRes]) => {
        if (!mounted) return;
        const tree = treeRes?.data?.data;
        if (!tree) {
          setNotFound(true);
          return;
        }
        setMainTree(tree);
        setSubCategories(Array.isArray(catsRes?.data?.data) ? catsRes.data.data : []);
        const items = Array.isArray(prodsRes?.data?.data) ? prodsRes.data.data : [];
        const pg = prodsRes?.data?.pagination || { page, total: items.length, pages: 1 };
        if (isFirstPage) setProducts(items);
        else setProducts((prev) => [...prev, ...items]);
        setPagination(pg);
        const name = getLocalizedField(tree, lang, 'name', 'nameEn');
        document.title = `${name} | Tungviet`;
      })
      .catch((err) => {
        console.warn('[MainTreeDetail] fetch failed:', err);
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

  if (notFound || !mainTree) {
    return (
      <div className="container-page py-16 md:py-24 text-center">
        <SEO
          title={t('mainTree.notFound')}
          description={t('mainTree.subtitle')}
          url={`/${lang}/main-trees/${id}`}
        />
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-50 text-primary mb-4">
          <FiBox size={28} />
        </div>
        <h1 className="text-2xl font-semibold text-slate-900 mb-3">
          {t('mainTree.notFound')}
        </h1>
        <Link
          to={`/${lang}/main-trees`}
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-medium"
        >
          ← {t('mainTree.backToList')}
        </Link>
      </div>
    );
  }

  const name = getLocalizedField(mainTree, lang, 'name', 'nameEn');
  const description = getLocalizedField(mainTree, lang, 'description', 'descriptionEn');
  const descriptionText = stripHtml(description);
  const seoDescription = descriptionText.slice(0, 160) || t('mainTree.subtitle');

  return (
    <div className="bg-white">
      <SEO
        title={`${name} | ${t('mainTree.title')}`}
        description={seoDescription}
        keywords={t('seo.defaultKeywords')}
        url={`/${lang}/main-trees/${id}`}
      />

      <PageHero
        title={name}
        subtitle={descriptionText || undefined}
        breadcrumb={[
          { label: t('mainTree.breadcrumbHome'), to: `/${lang}` },
          { label: t('mainTree.breadcrumbMainTrees'), to: `/${lang}/main-trees` },
          { label: name },
        ]}
      />

      {mainTree.imageUrl && (
        <section className="container-page -mt-6 mb-10">
          <div className="rounded-2xl overflow-hidden shadow-lg aspect-video bg-gray-100">
            <img
              src={mainTree.imageUrl}
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
        to={`/${lang}/main-trees`}
        className="container-page inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-6 transition-colors"
      >
        <FiArrowLeft size={14} />
        {t('mainTree.backToList')}
      </Link>

      {subCategories.length > 0 && (
        <section className="bg-slate-50/60 py-12 md:py-16 mb-10">
          <div className="container-page">
            <SectionHeader
              eyebrow={t('mainTree.subCategoriesEyebrow')}
              title={t('mainTree.subCategories')}
              align="center"
              className="mb-8"
            />
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5"
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-80px' }}
            >
              {subCategories.map((cat) => {
                const catName = getLocalizedField(cat, lang, 'name', 'nameEn');
                const catDesc = stripHtml(
                  getLocalizedField(cat, lang, 'description', 'descriptionEn')
                );
                return (
                  <motion.div key={cat._id} variants={itemVariants}>
                    <Link
                      to={`/${lang}/categories/${cat._id}`}
                      className="group block h-full bg-white rounded-2xl p-6 border border-gray-100 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-50 text-primary mb-4 ring-1 ring-inset ring-primary-100 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[6deg]">
                        <FiGrid size={20} />
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mb-1">
                        {catName}
                      </h4>
                      {catDesc && (
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {catDesc}
                        </p>
                      )}
                      <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                        {t('common.viewAll')}
                        <FiArrowRight
                          size={12}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>
      )}

      <section className="container-page py-10 md:py-12">
        <div className="flex items-end justify-between mb-6 md:mb-8 gap-3 flex-wrap">
          <SectionHeader
            eyebrow={t('mainTree.title')}
            title={t('mainTree.productsInMainTree')}
            className="mb-0"
          />
          {products.length > 0 && (
            <Link
              to={`/${lang}/products?industries=${id}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-700 transition-colors whitespace-nowrap"
            >
              {t('mainTree.viewAllProducts')}
              <FiArrowRight size={14} />
            </Link>
          )}
        </div>

        {products.length === 0 ? (
          <EmptyState
            icon={FiBox}
            title={t('home.featuredEmpty', 'Chưa có sản phẩm trong ngành hàng này')}
            description={t('home.featuredEmptyDesc', 'Vui lòng quay lại sau.')}
          />
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product, idx) => (
                <ProductCard key={product._id} product={product} index={idx} />
              ))}
            </div>
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

export default MainTreeDetail;