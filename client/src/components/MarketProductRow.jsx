import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFileText, FiArrowRight, FiFile } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LOCALES } from '../i18n';
import { useQuoteBag } from '../context/QuoteBagContext';
import { getLocalizedField } from '../utils/i18nField';
import placeholderProduct from '../assets/placeholder-product.svg';

/**
 * Dòng sản phẩm gọn dùng cho tab "Sản phẩm" tại trang chi tiết Thị trường.
 * Hiển thị: ảnh, mã SKU, tên, thông số nổi bật, ngành/danh mục, giá và CTA.
 */
const MarketProductRow = ({ product, index = 0 }) => {
  const { lang: urlLang } = useParams();
  const lang = SUPPORTED_LOCALES.includes(urlLang) ? urlLang : 'vi';
  const { t } = useTranslation();
  const { addToQuoteBag, isInBag } = useQuoteBag();

  const inBag = isInBag(product._id);
  const name = getLocalizedField(product, lang, 'name', 'nameEn');
  const industries = Array.isArray(product.industries) ? product.industries : [];
  const productLines = Array.isArray(product.productLines) ? product.productLines : [];

  const priceLabel =
    product.priceVisible === false
      ? t('product.contactUs')
      : typeof product.price === 'number' && product.price > 0
        ? new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0,
          }).format(product.price)
        : null;

  const specChips = [
    product.softeningPoint
      ? { key: 'softeningPoint', label: product.softeningPoint, tone: 'orange' }
      : null,
    product.acidValue
      ? { key: 'acidValue', label: product.acidValue, tone: 'slate' }
      : null,
    product.color
      ? { key: 'color', label: product.color, tone: 'slate' }
      : null,
  ].filter(Boolean);

  const toneClass = {
    orange: 'bg-orange-50 text-orange-700',
    slate: 'bg-slate-100 text-slate-700',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 10) * 0.03, duration: 0.3 }}
      className="group flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl transition-all duration-250 hover:border-primary/40 hover:shadow-card"
    >
      {/* Thumbnail */}
      <Link
        to={`/${lang}/products/${product._id}`}
        className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0"
      >
        <img
          src={product.imageUrl || placeholderProduct}
          alt={name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = placeholderProduct;
          }}
        />
      </Link>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          {product.productCode && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-900/85 text-white">
              {product.productCode}
            </span>
          )}
          {product.tdsUrl && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-accent text-white">
              <FiFile size={9} />
              TDS
            </span>
          )}
          {specChips.map((chip) => (
            <span
              key={chip.key}
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${toneClass[chip.tone]}`}
            >
              {chip.label}
            </span>
          ))}
        </div>

        <Link
          to={`/${lang}/products/${product._id}`}
          className="block mt-1 text-sm font-semibold text-slate-900 hover:text-primary transition-colors line-clamp-1"
        >
          {name}
        </Link>

        {(industries.length > 0 || productLines.length > 0) && (
          <div className="mt-1 flex items-center gap-1.5 flex-wrap text-[10px] text-slate-500">
            {industries.slice(0, 2).map((ind) => (
              <span key={ind._id} className="truncate max-w-[140px]">
                {getLocalizedField(ind, lang, 'name', 'nameEn')}
              </span>
            ))}
            {industries.length > 0 && productLines.length > 0 && (
              <span className="text-slate-300">·</span>
            )}
            {productLines.slice(0, 2).map((pl) => (
              <span key={pl._id} className="truncate max-w-[140px]">
                {getLocalizedField(pl, lang, 'name', 'nameEn')}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Price + CTA */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {priceLabel && (
          <div className="hidden sm:block text-right">
            <div
              className={`text-sm font-semibold ${
                product.priceVisible === false ? 'text-primary' : 'text-slate-900'
              }`}
            >
              {priceLabel}
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => addToQuoteBag(product)}
          disabled={inBag}
          className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-all duration-200 whitespace-nowrap ${
            inBag
              ? 'bg-primary-50 text-primary-700 cursor-default'
              : 'bg-slate-900 text-white hover:bg-primary active:scale-[0.98]'
          }`}
          title={t('product.requestQuote')}
        >
          <FiFileText size={12} />
          <span className="hidden md:inline">
            {inBag ? t('product.addedToQuote') : t('product.requestQuote')}
          </span>
          <span className="md:hidden">
            {inBag ? t('product.addedToQuote') : t('product.requestQuote')}
          </span>
        </button>
        <Link
          to={`/${lang}/products/${product._id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-700 transition-colors whitespace-nowrap"
        >
          {t('product.viewDetails')}
          <FiArrowRight size={12} />
        </Link>
      </div>
    </motion.div>
  );
};

export default MarketProductRow;
