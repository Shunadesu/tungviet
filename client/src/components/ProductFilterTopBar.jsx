import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiChevronDown, FiCheck, FiFilter, FiX, FiSliders } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { SOFTENING_RANGES } from '../utils/softeningPoint';

/**
 * Thanh bộ lọc ngang cho trang sản phẩm — thay thế cột sidebar bên trái.
 *
 *   [Ngành hàng ▾] [Thị trường ▾] [Điểm làm mềm ▾] [Sắp xếp ▾]
 *
 * Ngành hàng và Thị trường là multi-select (CSV trong URL).
 * Điểm làm mềm và Sắp xếp là single-select.
 * Trên mobile, các dropdown gộp vào một nút "Bộ lọc" mở sheet phía dưới.
 */

const Dropdown = ({ label, summary, badge, open, onToggle, children, align = 'left' }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onToggle(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') onToggle(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onToggle]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => onToggle(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl border text-sm font-medium transition-all duration-200 whitespace-nowrap ${
          badge > 0
            ? 'border-primary bg-primary-50 text-primary'
            : 'border-gray-200 bg-white text-slate-700 hover:border-primary/50 hover:text-primary'
        }`}
      >
        <span className="text-slate-400 font-normal">{label}</span>
        <span className="max-w-[10rem] truncate">{summary}</span>
        {badge > 0 && (
          <span className="ml-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-semibold">
            {badge}
          </span>
        )}
        <FiChevronDown
          size={14}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-30 mt-2 w-64 max-h-72 overflow-y-auto scrollbar-thin bg-white rounded-xl border border-gray-100 shadow-xl p-1.5 ${
              align === 'right' ? 'right-0' : 'left-0'
            }`}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const OptionRow = ({ label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    role="option"
    aria-selected={active}
    className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-sm transition-colors ${
      active ? 'bg-primary-50 text-primary font-medium' : 'text-slate-700 hover:bg-gray-50'
    }`}
  >
    <span
      className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
        active ? 'bg-primary border-primary' : 'border-gray-300'
      }`}
    >
      {active && <FiCheck size={11} className="text-white" />}
    </span>
    <span className="truncate">{label}</span>
  </button>
);

const ProductFilterTopBar = ({
  values,
  setParam,
  mainTrees = [],
  marketTrees = [],
  sort,
  onSortChange,
  activeCount = 0,
  resultCount = 0,
}) => {
  const { t } = useTranslation();
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const selectedIndustries = Array.isArray(values.industries) ? values.industries : [];
  const selectedMarkets = Array.isArray(values.market) ? values.market : [];

  const industryName = (id) => {
    const m = mainTrees.find((x) => x._id === id);
    return m?.nameEn || m?.name || id;
  };
  const marketName = (id) => {
    const m = marketTrees.find((x) => x._id === id);
    return m?.titleEn || m?.title || id;
  };

  const toggleMulti = (key, id) => {
    const current = key === 'industries' ? selectedIndustries : selectedMarkets;
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id];
    setParam(key, next);
  };

  const industrySummary =
    selectedIndustries.length === 0
      ? t('product.filter.all')
      : selectedIndustries.length === 1
        ? industryName(selectedIndustries[0])
        : t('product.filter.selectedCount', { n: selectedIndustries.length });

  const marketSummary =
    selectedMarkets.length === 0
      ? t('product.filter.all')
      : selectedMarkets.length === 1
        ? marketName(selectedMarkets[0])
        : t('product.filter.selectedCount', { n: selectedMarkets.length });

  const softeningRange = SOFTENING_RANGES.find((r) => r.value === values.softeningPoint);
  const softeningSummary = softeningRange?.label || t('product.filter.all');

  const panels = {
    industries: (
      <>
        <OptionRow
          label={t('product.filter.all')}
          active={selectedIndustries.length === 0}
          onClick={() => setParam('industries', [])}
        />
        {mainTrees.map((m) => (
          <OptionRow
            key={m._id}
            label={m.nameEn || m.name || m._id}
            active={selectedIndustries.includes(m._id)}
            onClick={() => toggleMulti('industries', m._id)}
          />
        ))}
      </>
    ),
    markets: (
      <>
        <OptionRow
          label={t('product.filter.all')}
          active={selectedMarkets.length === 0}
          onClick={() => setParam('market', [])}
        />
        {marketTrees.map((m) => (
          <OptionRow
            key={m._id}
            label={m.titleEn || m.title || m._id}
            active={selectedMarkets.includes(m._id)}
            onClick={() => toggleMulti('market', m._id)}
          />
        ))}
      </>
    ),
    softening: (
      <>
        <OptionRow
          label={t('product.filter.all')}
          active={!values.softeningPoint}
          onClick={() => setParam('softeningPoint', '')}
        />
        {SOFTENING_RANGES.filter((r) => r.value).map((r) => (
          <OptionRow
            key={r.value}
            label={r.label}
            active={values.softeningPoint === r.value}
            onClick={() => setParam('softeningPoint', r.value)}
          />
        ))}
      </>
    ),
  };

  const desktopBar = (
    <div className="hidden md:flex items-center gap-2.5 flex-wrap">
      <Dropdown
        label={t('product.filter.mainTree')}
        summary={industrySummary}
        badge={selectedIndustries.length}
        open={openMenu === 'industries'}
        onToggle={(v) => setOpenMenu(v ? 'industries' : null)}
      >
        {panels.industries}
      </Dropdown>

      <Dropdown
        label={t('nav.marketTrees')}
        summary={marketSummary}
        badge={selectedMarkets.length}
        open={openMenu === 'markets'}
        onToggle={(v) => setOpenMenu(v ? 'markets' : null)}
      >
        {panels.markets}
      </Dropdown>

      <Dropdown
        label={t('product.softeningPoint')}
        summary={softeningSummary}
        badge={values.softeningPoint ? 1 : 0}
        open={openMenu === 'softening'}
        onToggle={(v) => setOpenMenu(v ? 'softening' : null)}
      >
        {panels.softening}
      </Dropdown>

      <div className="h-6 w-px bg-gray-200 mx-1" />

      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
        aria-label={t('product.sort.title')}
        className="h-10 text-sm border border-gray-200 rounded-xl px-3 pr-8 bg-white text-slate-700 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 cursor-pointer"
      >
        <option value="">{t('product.sort.default')}</option>
        <option value="name_asc">{t('product.sort.nameAsc')}</option>
        <option value="name_desc">{t('product.sort.nameDesc')}</option>
        <option value="newest">{t('product.sort.newest')}</option>
        <option value="popularity">{t('product.sort.popular')}</option>
      </select>
    </div>
  );

  return (
    <>
      {/* Thanh bộ lọc */}
      <div className="sticky top-16 md:top-20 z-30 -mx-4 px-4 py-3 bg-white/90 backdrop-blur border-b border-gray-100 mb-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            {/* Mobile: nút mở sheet bộ lọc */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="md:hidden inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-slate-700 hover:border-primary hover:text-primary transition-colors"
            >
              <FiSliders size={14} />
              {t('product.filter.title')}
              {activeCount > 0 && (
                <span className="ml-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-semibold">
                  {activeCount}
                </span>
              )}
            </button>
            {desktopBar}
          </div>

          <p className="text-sm text-slate-600 whitespace-nowrap">
            <span className="font-semibold text-slate-900">{resultCount}</span>{' '}
            {t('product.mainProductsCount', { n: resultCount })}
          </p>
        </div>
      </div>

      {/* Mobile: sheet bộ lọc */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="md:hidden fixed inset-x-0 bottom-0 max-h-[85vh] bg-white rounded-t-2xl shadow-2xl z-50 flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <FiFilter size={16} className="text-primary" />
                  <h3 className="text-sm font-semibold text-slate-900">
                    {t('product.filter.title')}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label={t('common.close')}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                >
                  <FiX size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 scrollbar-thin">
                <div>
                  <h4 className="heading-eyebrow mb-2">{t('product.filter.mainTree')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {mainTrees.map((m) => (
                      <button
                        key={m._id}
                        type="button"
                        onClick={() => toggleMulti('industries', m._id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          selectedIndustries.includes(m._id)
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-slate-700 border-gray-200'
                        }`}
                      >
                        {m.nameEn || m.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="heading-eyebrow mb-2">{t('nav.marketTrees')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {marketTrees.map((m) => (
                      <button
                        key={m._id}
                        type="button"
                        onClick={() => toggleMulti('market', m._id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          selectedMarkets.includes(m._id)
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-slate-700 border-gray-200'
                        }`}
                      >
                        {m.titleEn || m.title}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="heading-eyebrow mb-2">{t('product.softeningPoint')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {SOFTENING_RANGES.filter((r) => r.value).map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setParam('softeningPoint', r.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          values.softeningPoint === r.value
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-slate-700 border-gray-200'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 px-5 py-3">
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="w-full btn-primary"
                >
                  {t('product.filter.apply')}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductFilterTopBar;
