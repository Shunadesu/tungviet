import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFile, FiFileText, FiArrowRight, FiHeart } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LOCALES } from '../i18n';
import { useQuoteBag } from '../context/QuoteBagContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { useToast } from '../context/ToastContext';
import placeholderProduct from '../assets/placeholder-product.svg';

const MAX_COMPARE = 4;

const ProductCard = ({ product, index = 0 }) => {
  const { lang: urlLang } = useParams();
  const lang = SUPPORTED_LOCALES.includes(urlLang) ? urlLang : 'vi';
  const { t } = useTranslation();
  const { addToQuoteBag, isInBag } = useQuoteBag();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { toggleCompare, isInCompare } = useCompare();
  const toast = useToast();
  const inBag = isInBag(product._id);
  const wished = isInWishlist(product._id);
  const compared = isInCompare(product._id);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToQuoteBag(product);
  };

  const handleWish = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const result = toggleWishlist(product);
    if (result === true) toast.success(t('toast.addedToWishlist'));
    else if (result === false) toast.info(t('toast.removedFromWishlist'));
  };

  const handleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const result = toggleCompare(product);
    if (result === 'max') {
      toast.error(t('common.maxCompareItems', { max: 4 }));
      return;
    }
    if (result) toast.success(t('toast.addedToCompare'));
    else toast.info(t('toast.removedFromCompare'));
  };

  const priceLabel = product.priceVisible === false
    ? t('product.contactUs')
    : typeof product.price === 'number' && product.price > 0
      ? new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'vi-VN', {
          style: 'currency',
          currency: 'VND',
          maximumFractionDigits: 0,
        }).format(product.price)
      : null;

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

        {/* Top-right action cluster: heart + compare + TDS */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
          {product.tdsUrl && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-accent text-white text-[10px] font-semibold backdrop-blur-sm">
              <FiFile size={10} />
              TDS
            </span>
          )}
          <button
            type="button"
            onClick={handleWish}
            aria-label={wished ? t('wishlist.remove') : t('wishlist.add')}
            aria-pressed={wished}
            className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur border shadow-sm transition-all ${
              wished
                ? 'bg-rose-500 text-white border-rose-500 hover:bg-rose-600'
                : 'bg-white/90 text-slate-600 border-white/50 hover:text-rose-500'
            }`}
          >
            <FiHeart size={14} className={wished ? 'fill-current' : ''} />
          </button>
          <label
            onClick={(e) => e.stopPropagation()}
            className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur border shadow-sm cursor-pointer transition-all ${
              compared
                ? 'bg-primary text-white border-primary'
                : 'bg-white/90 text-slate-600 border-white/50 hover:text-primary'
            }`}
            title={t('compare.add')}
          >
            <input
              type="checkbox"
              checked={compared}
              onChange={handleCompare}
              aria-label={t('compare.add')}
              className="sr-only"
            />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              {compared ? (
                <polyline points="20 6 9 17 4 12" />
              ) : (
                <>
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </>
              )}
            </svg>
          </label>
        </div>

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
