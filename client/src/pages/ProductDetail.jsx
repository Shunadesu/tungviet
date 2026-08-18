import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiChevronRight,
  FiDownload,
  FiCheck,
  FiArrowRight,
  FiFileText,
  FiHeart,
} from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import ProductGallery from '../components/ProductGallery';
import RelatedProducts from '../components/RelatedProducts';
import PageHero from '../components/PageHero';
import { useQuoteBag } from '../context/QuoteBagContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import publicApi from '../api/publicApi';
import { SUPPORTED_LOCALES } from '../i18n';
import { sanitizeHtml } from '../utils/sanitize';
import { htmlToText } from '../utils/html';
import { getLocalizedField } from '../utils/i18nField';

const LEGACY_COLUMNS = [
  { key: 'softeningPoint', name: 'Điểm làm mềm', nameEn: 'Softening Point', order: 1 },
  { key: 'acidValue', name: 'Chỉ số axit', nameEn: 'Acid Value', order: 2 },
  { key: 'color', name: 'Màu sắc', nameEn: 'Color', order: 3 },
];

const ProductDetail = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const lang = SUPPORTED_LOCALES.includes(i18n.language) ? i18n.language : 'vi';

  const [product, setProduct] = useState(null);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [added, setAdded] = useState(false);

  const { addToQuoteBag } = useQuoteBag();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const toast = useToast();

  useEffect(() => {
    fetchProduct();
    // Fire-and-forget: increment view counter once per product detail open
    publicApi.incrementView(id).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, lang]);

  const fetchProduct = async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const [productResult, columnsResult] = await Promise.allSettled([
        publicApi.getProduct(id, lang),
        publicApi.getProductColumns(lang),
      ]);

      if (productResult.status === 'rejected') {
        const error = productResult.reason;
        console.error('Error loading product:', error);
        if (error.response?.status === 404) setNotFound(true);
        return;
      }

      const data = productResult.value.data?.data;
      if (!data) {
        setNotFound(true);
      } else {
        setProduct(data);
      }

      if (columnsResult.status === 'fulfilled') {
        setColumns(
          Array.isArray(columnsResult.value.data?.data)
            ? columnsResult.value.data.data
            : LEGACY_COLUMNS
        );
      } else {
        console.warn('Product columns could not be loaded; rendering product without dynamic specifications.');
        setColumns(LEGACY_COLUMNS);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddToQuote = () => {
    if (!product) return;
    addToQuoteBag(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    const result = toggleWishlist(product);
    if (result === true) toast.success(t('toast.addedToWishlist'));
    else if (result === false) toast.info(t('toast.removedFromWishlist'));
  };

  const wished = product ? isInWishlist(product._id) : false;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-2xl font-semibold text-slate-900 mb-3">
          {t('product.notFound')}
        </h1>
        <Link to={`/${lang}/products`} className="btn-primary">
          {t('quote.browseProducts')}
        </Link>
      </div>
    );
  }

  const safeDescription = product.description ? sanitizeHtml(product.description) : '';
  const dynamicAttributes = columns
    .filter((column) => column.isActive !== false)
    .map((column) => {
      const value =
        product.attributes?.[column.key] ?? product[column.key];
      return {
        column,
        value:
          value === null || value === undefined
            ? ''
            : String(value).trim(),
      };
    })
    .filter(({ value }) => value);

  const galleryImages = [product.imageUrl, ...(product.images || [])].filter(Boolean);
  const priceLabel = product.priceVisible === false
    ? t('product.contactUs')
    : typeof product.price === 'number' && product.price > 0
      ? new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'vi-VN', {
          style: 'currency',
          currency: 'VND',
          maximumFractionDigits: 0,
        }).format(product.price)
      : null;

  const breadcrumb = [
    { label: t('product.breadcrumbHome'), to: `/${lang}` },
    { label: t('product.breadcrumbProducts'), to: `/${lang}/products` },
  ];
  // Product may belong to multiple industries; surface the first one in the
  // breadcrumb to keep the path short and predictable.
  const primaryIndustry = Array.isArray(product.industries) && product.industries.length > 0
    ? product.industries[0]
    : null;
  if (primaryIndustry && primaryIndustry._id) {
    breadcrumb.push({
      label: getLocalizedField(primaryIndustry, lang, 'name', 'nameEn'),
      to: `/${lang}/main-trees/${primaryIndustry._id}`,
    });
  }
  if (product.productLine && product.productLine._id) {
    breadcrumb.push({
      label: getLocalizedField(product.productLine, lang, 'name', 'nameEn'),
      to: `/${lang}/categories/${product.productLine._id}`,
    });
  }
  breadcrumb.push({ label: product.name });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white"
    >
      <SEO
        title={product.name}
        description={htmlToText(
          getLocalizedField(product, lang, 'description', 'descriptionEn') || `${product.name} -  Tungviet`
        ).slice(0, 200)}
        keywords={`${product.name}, rosin, resin, industrial,  Tungviet`}
        url={`/${lang}/products/${product._id}`}
        type="product"
      />

      <PageHero
        breadcrumb={breadcrumb}
        title={product.name}
        subtitle={product.shortDescription || t('product.requestQuoteSubtitle')}
      />

      <section className="container-page py-12 md:py-16 pb-24 md:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Gallery - 3 cols */}
          <div className="lg:col-span-3">
            <ProductGallery images={galleryImages} name={product.name} tdsUrl={product.tdsUrl} />
          </div>

          {/* Info - 2 cols */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Product code + price + target audience */}
            <div className="card p-5 bg-gradient-to-br from-slate-50 to-white border border-slate-100">
              <div className="flex flex-wrap items-start justify-between gap-3">
                {product.productCode ? (
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-gray-500 font-medium mb-0.5">
                      {t('product.productCode')}
                    </div>
                    <div className="font-mono text-base font-semibold text-slate-900">
                      {product.productCode}
                    </div>
                  </div>
                ) : null}
                {priceLabel && (
                  <div className="text-right">
                    <div className="text-[11px] uppercase tracking-wider text-gray-500 font-medium mb-0.5">
                      {product.priceVisible === false ? t('product.contactUs') : t('product.price')}
                    </div>
                    <div className={`text-base font-semibold ${product.priceVisible === false ? 'text-primary' : 'text-slate-900'}`}>
                      {priceLabel}
                    </div>
                  </div>
                )}
              </div>
              {product.targetAudience && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="text-[11px] uppercase tracking-wider text-gray-500 font-medium mb-1">
                    {t('product.targetAudience')}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{product.targetAudience}</p>
                </div>
              )}
            </div>

            {/* Specifications card */}
            {dynamicAttributes.length > 0 && (
              <div className="card p-5">
                <h3 className="heading-eyebrow mb-4">
                  {t('product.specifications')}
                </h3>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {dynamicAttributes.map(({ column, value }) => (
                    <div key={column._id || column.key} className="border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                      <dt className="text-[11px] uppercase tracking-wider text-gray-500 font-medium mb-0.5">
                        {lang === 'en' ? (column.nameEn || column.name) : column.name}
                      </dt>
                      <dd className="text-sm font-semibold text-slate-900">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Benefits */}
            {product.benefits && product.benefits.length > 0 && (
              <div className="card p-5">
                <h3 className="heading-eyebrow mb-4">{t('product.benefits')}</h3>
                <ul className="space-y-2.5">
                  {product.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-100 text-primary flex items-center justify-center mt-0.5">
                        <FiCheck size={12} />
                      </span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Applications */}
            {product.applications && product.applications.length > 0 && (
              <div className="card p-5">
                <h3 className="heading-eyebrow mb-4">{t('product.applications')}</h3>
                <div className="flex flex-wrap gap-2">
                  {product.applications.map((app, i) => (
                    <span
                      key={i}
                      className="badge-primary !text-xs"
                    >
                      {app}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="card p-5 bg-gradient-to-br from-primary-50/60 to-white">
              <div className="flex items-stretch gap-2">
                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  aria-label={wished ? t('wishlist.remove') : t('wishlist.add')}
                  aria-pressed={wished}
                  className={`shrink-0 inline-flex items-center justify-center w-12 rounded-xl border transition-all active:scale-[0.97] ${
                    wished
                      ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                      : 'bg-white border-gray-200 text-slate-600 hover:border-rose-300 hover:text-rose-600'
                  }`}
                >
                  <FiHeart size={18} className={wished ? 'fill-current' : ''} />
                </button>
                <button
                  type="button"
                  onClick={handleAddToQuote}
                  className={`flex-1 inline-flex items-center justify-center gap-2 font-medium py-3 rounded-xl transition-all duration-200 active:scale-[0.98] ${
                    added
                      ? 'bg-primary text-white'
                      : 'bg-slate-900 text-white hover:bg-primary'
                  }`}
                >
                  {added ? (
                    <>
                      <FiCheck size={16} />
                      {t('product.addedToQuote')}
                    </>
                  ) : (
                    <>
                      <FiFileText size={16} />
                      {t('product.requestQuote')}
                      <FiArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
              {product.tdsUrl && (
                <a
                  href={product.tdsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 w-full inline-flex items-center justify-center gap-2 text-sm font-medium text-slate-700 hover:text-primary py-2 transition-colors"
                >
                  <FiDownload size={14} />
                  {t('product.downloadTds')} (PDF)
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {safeDescription && (
          <div className="mt-12 md:mt-16 max-w-4xl">
            <div className="flex items-center gap-3 mb-5">
              <span className="heading-eyebrow">{t('product.description')}</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>
            <div
              className="prose prose-slate max-w-none text-slate-700 leading-relaxed prose-headings:text-slate-900 prose-a:text-primary"
              dangerouslySetInnerHTML={{ __html: safeDescription }}
            />
          </div>
        )}
      </section>

      <RelatedProducts currentProduct={product} />

      {/* Sticky mobile CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur border-t border-gray-200 px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-500 truncate">{product.name}</div>
            <div className="text-sm font-semibold text-slate-900 truncate">
              {priceLabel || t('product.contactUs')}
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddToQuote}
            className={`inline-flex items-center justify-center gap-2 font-medium py-3 px-5 rounded-xl transition-all duration-200 active:scale-[0.98] ${
              added ? 'bg-primary text-white' : 'bg-slate-900 text-white hover:bg-primary'
            }`}
          >
            {added ? (
              <FiCheck size={16} />
            ) : (
              <>
                <FiFileText size={16} />
                {t('product.requestQuote')}
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductDetail;