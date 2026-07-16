import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFile, FiFileText } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LOCALES } from '../i18n';
import { useQuoteBag } from '../context/QuoteBagContext';
import placeholderProduct from '../assets/placeholder-product.svg';

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="card group"
    >
      <Link to={`/${lang}/products/${product._id}`}>
        <div className="relative overflow-hidden rounded-lg mb-2">
          <img
            src={product.imageUrl || placeholderProduct}
            alt={product.name}
            className="w-full h-40 object-cover bg-gray-100 transition-transform duration-300 group-hover:scale-105"
            onError={(e) => { e.currentTarget.src = placeholderProduct; }}
          />
          {product.tdsUrl && (
            <div className="absolute top-2 right-2 bg-accent text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <FiFile size={10} />
              TDS
            </div>
          )}
        </div>
      </Link>

      <div className="p-2">
        <Link to={`/${lang}/products/${product._id}`}>
          <h3 className="text-sm font-medium text-gray-800 line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Specifications */}
        <div className="flex flex-wrap gap-1 mt-2">
          {product.softeningPoint && (
            <span className="text-[9px] px-1.5 py-0.5 bg-orange-50 text-orange-600 rounded">
              {product.softeningPoint}
            </span>
          )}
          {product.color && (
            <span className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
              {product.color}
            </span>
          )}
        </div>

        {/* Benefits preview */}
        {product.benefits && product.benefits.length > 0 && (
          <p className="text-[10px] text-gray-400 mt-1.5 line-clamp-1">
            {product.benefits[0]}
          </p>
        )}

        <button
          type="button"
          onClick={handleAdd}
          disabled={inBag}
          className={`mt-2 w-full text-[10px] flex items-center justify-center gap-1 py-1.5 rounded transition-colors ${
            inBag
              ? 'bg-green-50 text-green-600 cursor-default'
              : 'bg-primary-50 text-primary hover:bg-primary-100'
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