import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiFilter, FiRefreshCw } from 'react-icons/fi';
import FilterChip from './FilterChip';
import publicApi from '../api/publicApi';

/**
 * Sidebar filter cho trang sản phẩm: markets + softening point range.
 * Mobile: drawer full-screen.
 */
const ProductFilterSidebar = ({
  open,
  onClose,
  values,
  setParam,
  clearAll,
  activeCount,
}) => {
  const { t, i18n } = useTranslation();
  const [markets, setMarkets] = useState([]);
  const [loadingMarkets, setLoadingMarkets] = useState(true);

  useEffect(() => {
    setLoadingMarkets(true);
    publicApi
      .getMarkets({ lang: i18n.language, limit: 50 })
      .then((r) => setMarkets(r?.data?.data || []))
      .catch(() => setMarkets([]))
      .finally(() => setLoadingMarkets(false));
  }, [i18n.language]);

  const softeningRanges = [
    { value: '', label: t('product.filter.all') },
    { value: '<80', label: '< 80°C' },
    { value: '80-100', label: '80 – 100°C' },
    { value: '100-120', label: '100 – 120°C' },
    { value: '>120', label: '> 120°C' },
  ];

  const Panel = (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <FiFilter size={16} className="text-primary" />
          <h3 className="text-sm font-semibold text-slate-900">
            {t('product.filter.title')}
          </h3>
          {activeCount > 0 && (
            <span className="badge-primary !px-2 !py-0.5">{activeCount}</span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors md:hidden"
          aria-label="Close"
        >
          <FiX size={18} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-7 scrollbar-thin">
        {/* Markets */}
        <section>
          <h4 className="heading-eyebrow mb-3">{t('nav.markets')}</h4>
          {loadingMarkets ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton h-7 w-full" />
              ))}
            </div>
          ) : markets.length === 0 ? (
            <p className="text-xs text-gray-400">—</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {markets.map((m) => {
                const label = i18n.language === 'en' && m.nameEn ? m.nameEn : m.name;
                const active = values.market === m._id;
                return (
                  <FilterChip
                    key={m._id}
                    label={label}
                    active={active}
                    onClick={() =>
                      setParam('market', active ? '' : m._id)
                    }
                  />
                );
              })}
            </div>
          )}
        </section>

        {/* Softening point */}
        <section>
          <h4 className="heading-eyebrow mb-3">{t('product.softeningPoint')}</h4>
          <div className="flex flex-wrap gap-2">
            {softeningRanges.map((r) => {
              const active = values.softeningPoint === r.value;
              return (
                <FilterChip
                  key={r.value || 'all'}
                  label={r.label}
                  active={active}
                  onClick={() =>
                    setParam('softeningPoint', active ? '' : r.value)
                  }
                />
              );
            })}
          </div>
        </section>
      </div>

      {/* Footer */}
      {activeCount > 0 && (
        <div className="border-t border-gray-100 px-5 py-3">
          <button
            onClick={clearAll}
            className="w-full inline-flex items-center justify-center gap-2 text-sm font-medium text-gray-600 hover:text-primary transition-colors py-2"
          >
            <FiRefreshCw size={14} />
            {t('product.filter.clearAll')}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-72 lg:w-80 flex-shrink-0">
        <div className="sticky top-24 card overflow-hidden">{Panel}</div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              className="md:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="md:hidden fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl z-50"
            >
              {Panel}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductFilterSidebar;