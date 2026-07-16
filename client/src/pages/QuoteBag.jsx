import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTrash2, FiFileText, FiArrowRight } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { useQuoteBag } from '../context/QuoteBagContext';
import { SUPPORTED_LOCALES } from '../i18n';
import placeholderProduct from '../assets/placeholder-product.svg';

const QuoteBag = () => {
  const { t, i18n } = useTranslation();
  const lang = SUPPORTED_LOCALES.includes(i18n.language) ? i18n.language : 'vi';
  const { items, count, removeFromQuoteBag, clearQuoteBag } = useQuoteBag();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-8"
    >
      <SEO title={t('quote.bag')} description={t('quote.subtitle')} url={`/${lang}/quote`} />
      <div className="bg-primary text-white py-4">
        <div className="max-w-7xl mx-auto px-2 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">{t('quote.bag')}</h1>
            <p className="text-xs text-white/70">{t('quote.itemsCount', { n: count })}</p>
          </div>
          {count > 0 && (
            <button
              type="button"
              onClick={clearQuoteBag}
              className="text-xs flex items-center gap-1 text-white/80 hover:text-white"
            >
              <FiTrash2 size={12} />
              {t('quote.clear')}
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 py-4">
        {count === 0 ? (
          <div className="text-center py-16">
            <FiFileText size={56} className="mx-auto text-gray-300 mb-3" />
            <h2 className="text-base font-semibold text-gray-700 mb-1">{t('quote.bagEmpty')}</h2>
            <p className="text-xs text-gray-500 mb-4">{t('quote.bagEmptyHint')}</p>
            <Link to={`/${lang}/products`} className="btn-primary inline-block text-sm">
              {t('quote.browseProducts')}
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-2">
              {items.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-lg p-2 flex gap-3"
                >
                  <Link to={`/${lang}/products/${item._id}`} className="flex-shrink-0">
                    <img
                      src={item.imageUrl || placeholderProduct}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg bg-gray-100"
                      onError={(e) => { e.currentTarget.src = placeholderProduct; }}
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/${lang}/products/${item._id}`}>
                      <h3 className="text-sm font-medium line-clamp-2 hover:text-primary">{item.name}</h3>
                    </Link>
                    {item.softeningPoint && (
                      <p className="text-[10px] text-gray-500 mt-1">{item.softeningPoint}</p>
                    )}
                    {item.color && (
                      <p className="text-[10px] text-gray-500">{item.color}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromQuoteBag(item._id)}
                    className="text-gray-400 hover:text-red-500 p-1 self-start"
                    title={t('quote.remove')}
                  >
                    <FiTrash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-4 sticky top-16">
                <h2 className="text-sm font-semibold mb-2">{t('quote.itemsCount', { n: count })}</h2>
                <p className="text-xs text-gray-500 mb-3">
                  {t('quote.subtitle')}
                </p>
                <Link
                  to={`/${lang}/quote`}
                  className="btn-primary w-full text-center text-sm py-2.5 flex items-center justify-center gap-2"
                >
                  {t('quote.submit')}
                  <FiArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default QuoteBag;