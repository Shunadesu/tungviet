import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFile, FiFileText, FiArrowRight } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LOCALES } from '../i18n';
import { useQuoteBag } from '../context/QuoteBagContext';
import placeholderProduct from '../assets/placeholder-product.svg';

const formatPrice = (price) => {
  if (typeof price !== 'number' || price <= 0) return null;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(price);
};

const ProductCard = ({ product, index = 0 }) => {
  const { lang: urlLang } = useParams();
  const lang = SUPPORTED_LOCALES.includes(urlLang) ? urlLang : 'vi';
  const { t } = useTranslation();
  const { addToQuoteBag, isInBag } = useQuoteBag();
  const inBag = isInBag(product._id);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToQuoteBag(product);
  };

  const priceLabel = product.priceVisible === false
    ? t('product.contactUs')
    : formatPrice(product.price);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      className="group card-elevated overflow-hidden flex flex-col h-full"
    >
      <Link
        to={`/${lang}/products/${product._id}`}
        className="relative block aspect-[4/3] overflow-hidden bg-gray-50 flex-shrink-0"
      >
        <img
          src={product.imageUrl || placeholderProduct}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = placeholderProduct;
          }}
        />

        {product.productCode && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-900/85 text-white text-[10px] font-mono font-semibold backdrop-blur-sm">
              {product.productCode}
            </span>
          </div>
        )}

        {product.tdsUrl && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-accent text-white text-[10px] font-semibold backdrop-blur-sm">
              <FiFile size={10} />
              TDS
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <span className="inline-flex items-center gap-1 text-white text-xs font-semibold">
            {t('product.viewDetails')}
            <FiArrowRight size={12} />
          </span>
        </div>
      </Link>

      <div className="flex-1 flex flex-col p-5">
        <Link
          to={`/${lang}/products/${product._id}`}
          className="block text-[15px] font-semibold text-slate-900 hover:text-primary transition-colors leading-snug line-clamp-2 min-h-[2.75rem]"
        >
          {product.name}
        </Link>

        <div className="mt-3 min-h-[28px] flex items-start">
          {(product.softeningPoint || product.color) && (
            <div className="flex flex-wrap gap-1.5">
              {product.softeningPoint && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 text-[11px] font-medium">
                  {product.softeningPoint}
                </span>
              )}
              {product.color && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                  {product.color}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="mt-2 min-h-[24px]">
          {priceLabel && (
            <div className="text-sm">
              {product.priceVisible === false ? (
                <span className="text-primary font-medium">{priceLabel}</span>
              ) : (
                <span className="text-slate-900 font-semibold">{priceLabel}</span>
              )}
            </div>
          )}
        </div>

        <div className="flex-1" />

        <button
          type="button"
          onClick={handleAdd}
          disabled={inBag}
          className={`w-full inline-flex items-center justify-center gap-1.5 text-xs font-medium py-2.5 rounded-lg transition-all duration-200 ${
            inBag
              ? 'bg-primary-50 text-primary-700 cursor-default'
              : 'bg-slate-900 text-white hover:bg-primary active:scale-[0.98]'
          }`}
          title={t('product.requestQuote')}
        >
          <FiFileText size={12} />
          {inBag ? t('product.addedToQuote') : t('product.requestQuote')}
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;