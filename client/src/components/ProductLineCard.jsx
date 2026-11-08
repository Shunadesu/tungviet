import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiBox, FiFileText, FiLayers } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { getLocalizedField } from '../utils/i18nField';
import { htmlToExcerpt } from '../utils/html';
import placeholderProduct from '../assets/placeholder-product.svg';

/**
 * Card cho 1 "sản phẩm chính" (tức là 1 Product line / danh mục sản phẩm).
 * Bấm vào card sẽ điều hướng tới trang chi tiết, nơi liệt kê các SKU bên trong.
 */
const ProductLineCard = ({ productLine, skuCount = 0, index = 0, lang = 'vi' }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const name = getLocalizedField(productLine, lang, 'name', 'nameEn');
  const description = getLocalizedField(
    productLine,
    lang,
    'description',
    'descriptionEn'
  );
  const excerpt = htmlToExcerpt(description, 120);

  const detailUrl = `/${lang}/categories/${productLine._id}`;
  const quoteUrl = `/${lang}/quote?line=${productLine._id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      className="group card-elevated overflow-hidden flex flex-col h-full"
    >
      <Link
        to={detailUrl}
        className="relative block aspect-[16/9] overflow-hidden bg-gray-50 flex-shrink-0"
      >
        <img
          src={productLine.imageUrl || placeholderProduct}
          alt={name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = placeholderProduct;
          }}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900/85 text-white text-[10px] font-semibold backdrop-blur-sm">
            <FiLayers size={10} />
            {t('product.skuCount', { n: skuCount })}
          </span>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <span className="inline-flex items-center gap-1 text-white text-xs font-semibold">
            {t('product.viewDetails')}
            <FiArrowRight size={12} />
          </span>
        </div>
      </Link>

      <div className="flex-1 flex flex-col p-4">
        <Link
          to={detailUrl}
          className="block text-[15px] font-semibold text-slate-900 hover:text-primary transition-colors leading-snug line-clamp-2"
        >
          {name}
        </Link>

        <div className="mt-2.5 min-h-[2.5rem] flex items-start">
          {excerpt ? (
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{excerpt}</p>
          ) : (
            <p className="text-xs text-slate-400 italic">{t('product.noDescription')}</p>
          )}
        </div>

        <div className="flex-1" />

        <div className="mt-5 pt-3.5 border-t border-gray-100 flex items-center gap-2.5">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate(quoteUrl);
            }}
            className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium py-2.5 rounded-lg bg-slate-900 text-white hover:bg-primary active:scale-[0.98] transition-all duration-200"
            title={t('product.requestQuote')}
          >
            <FiFileText size={12} />
            {t('product.requestQuote')}
          </button>

          <Link
            to={detailUrl}
            className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium py-2.5 rounded-lg border border-slate-200 text-slate-700 hover:border-primary hover:text-primary transition-colors"
          >
            <FiBox size={12} />
            {t('product.viewDetails')}
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductLineCard;
