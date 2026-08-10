import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { useCompare } from '../context/CompareContext';
import placeholderProduct from '../assets/placeholder-product.svg';

/**
 * Sticky bar that surfaces the user's current compare selection.
 * Hidden when count === 0. On desktop appears as a horizontal bar at the bottom;
 * on mobile keeps the same layout but smaller paddings.
 */
const CompareFloatingBar = () => {
  const { t } = useTranslation();
  const { items, count, removeFromCompare, clearCompare, maxItems } = useCompare();

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 24, stiffness: 220 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-3xl"
          role="region"
          aria-label={t('compare.viewCompare')}
        >
          <div className="bg-white border border-gray-200 shadow-2xl rounded-2xl px-3 py-3 md:px-4 md:py-3 flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary text-xs font-bold shrink-0">
              {count}/{maxItems}
            </span>

            <div className="flex-1 flex items-center gap-2 overflow-x-auto">
              {items.map((it) => (
                <div
                  key={it._id}
                  className="relative shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-lg bg-gray-50 border border-gray-200 overflow-hidden group"
                >
                  <img
                    src={it.imageUrl || placeholderProduct}
                    alt={it.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = placeholderProduct;
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeFromCompare(it._id)}
                    aria-label={t('compare.remove')}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                  >
                    <FiX size={10} />
                  </button>
                </div>
              ))}
              {Array.from({ length: maxItems - count }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-lg border border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-xs"
                  aria-hidden
                >
                  +
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={clearCompare}
                className="text-xs text-gray-500 hover:text-rose-600 transition-colors hidden md:inline"
              >
                {t('wishlist.clearAll')}
              </button>
              <Link
                to="/products/compare"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary text-white text-xs md:text-sm font-semibold rounded-full hover:bg-primary-600 active:scale-95 transition-all shadow-md"
              >
                {t('compare.viewCompare')}
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CompareFloatingBar;
