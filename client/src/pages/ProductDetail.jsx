import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiChevronRight, FiFile, FiDownload, FiFileText, FiCheck } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import placeholderProduct from '../assets/placeholder-product.svg';
import { useQuoteBag } from '../context/QuoteBagContext';
import publicApi from '../api/publicApi';
import { SUPPORTED_LOCALES } from '../i18n';
import { sanitizeHtml } from '../utils/sanitize';

const ProductDetail = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const lang = SUPPORTED_LOCALES.includes(i18n.language) ? i18n.language : 'vi';

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [added, setAdded] = useState(false);

  const { addToQuoteBag } = useQuoteBag();

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, lang]);

  const fetchProduct = async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const res = await publicApi.getProduct(id, lang);
      const data = res.data?.data;
      if (!data) {
        setNotFound(true);
      } else {
        setProduct(data);
      }
    } catch (error) {
      console.error('Error:', error);
      if (error.response?.status === 404) setNotFound(true);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-xl font-semibold text-gray-800 mb-2">{t('product.notFound')}</h1>
        <Link to={`/${lang}/products`} className="btn-primary text-sm">
          {t('quote.browseProducts')}
        </Link>
      </div>
    );
  }

  const safeDescription = product.description ? sanitizeHtml(product.description) : '';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-8"
    >
      <SEO
        title={product.name}
        description={(product.description || `${product.name} - Zuna Tungviet`).replace(/<[^>]*>/g, '').slice(0, 200)}
        keywords={`${product.name}, rosin, resin, industrial, Zuna Tungviet`}
        url={`/${lang}/products/${product._id}`}
        type="product"
      />

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-2 py-2">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Link to={`/${lang}`} className="hover:text-primary">{t('product.breadcrumbHome')}</Link>
            <FiChevronRight size={12} />
            <Link to={`/${lang}/products`} className="hover:text-primary">{t('product.breadcrumbProducts')}</Link>
            <FiChevronRight size={12} />
            <span className="text-primary truncate max-w-[200px]">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 py-4">
        <div className="bg-white rounded-lg overflow-hidden shadow-sm">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Image */}
            <div className="relative">
              <img
                src={product.imageUrl || placeholderProduct}
                alt={product.name}
                className="w-full h-64 md:h-80 lg:h-96 object-cover bg-gray-100"
                onError={(e) => { e.currentTarget.src = placeholderProduct; }}
              />
              {product.tdsUrl && (
                <a
                  href={product.tdsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-accent text-white text-xs px-3 py-1.5 rounded-lg hover:bg-accent-dark transition-colors"
                >
                  <FiDownload size={14} />
                  {t('product.downloadTds')}
                </a>
              )}
            </div>

            {/* Info */}
            <div className="p-4 md:p-6">
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">{product.name}</h1>

              {/* Specifications */}
              {(product.softeningPoint || product.acidValue || product.color) && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    {t('product.specifications')}
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {product.softeningPoint && (
                      <div>
                        <p className="text-[10px] text-gray-400">{t('product.softeningPoint')}</p>
                        <p className="text-sm font-medium">{product.softeningPoint}</p>
                      </div>
                    )}
                    {product.acidValue && (
                      <div>
                        <p className="text-[10px] text-gray-400">{t('product.acidValue')}</p>
                        <p className="text-sm font-medium">{product.acidValue}</p>
                      </div>
                    )}
                    {product.color && (
                      <div>
                        <p className="text-[10px] text-gray-400">{t('product.color')}</p>
                        <p className="text-sm font-medium">{product.color}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Benefits */}
              {product.benefits && product.benefits.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    {t('product.benefits')}
                  </h3>
                  <ul className="space-y-1">
                    {product.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <FiCheck size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Applications */}
              {product.applications && product.applications.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    {t('product.applications')}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {product.applications.map((app, i) => (
                      <span
                        key={i}
                        className="text-xs px-2.5 py-1 bg-primary-50 text-primary rounded-full"
                      >
                        {app}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {safeDescription && (
                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    {t('product.description')}
                  </h3>
                  <div
                    className="text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: safeDescription }}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 border-t flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleAddToQuote}
                  className={`flex-1 min-w-[160px] flex items-center justify-center gap-2 text-sm py-2.5 rounded-lg transition-colors ${
                    added ? 'bg-green-600 text-white' : 'btn-primary'
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
                    </>
                  )}
                </button>
                {product.tdsUrl && (
                  <a
                    href={product.tdsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-w-[160px] flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm py-2.5 rounded-lg transition-colors"
                  >
                    <FiFile size={16} />
                    {t('product.downloadTds')} (PDF)
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductDetail;