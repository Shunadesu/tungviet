import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FiX,
  FiChevronRight,
  FiExternalLink,
  FiLayers,
  FiPackage,
  FiList,
} from 'react-icons/fi';
import placeholderProduct from '../assets/placeholder-product.svg';
import { htmlToText } from '../utils/html';
import { getLocalizedField } from '../utils/i18nField';
import {
  resolveSubDocLink,
  getSubDocMainTrees,
  getSubDocProductLines,
} from '../utils/subDocLink';
import SpecificationsTable from './SpecificationsTable';

/**
 * Modal chi tiết cho một sub-doc (công nghệ / ứng dụng) của thị trường.
 * Được mở khi click vào một dòng trong `MarketSubDocTable`.
 *
 * @param {object} props
 * @param {object|null} props.item - Sub-doc đang xem (null = đóng modal).
 * @param {'technology'|'application'} props.variant
 * @param {string} props.lang
 * @param {() => void} props.onClose
 * @param {(item: object) => void} props.onShowProducts
 */
const MarketSubDocModal = ({
  item,
  variant = 'technology',
  lang = 'vi',
  onClose,
  onShowProducts,
}) => {
  const { t } = useTranslation();
  const isTech = variant === 'technology';
  const isOpen = Boolean(item);

  /* Đóng bằng phím Escape + khoá cuộn trang khi modal mở. */
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  const title = item ? getLocalizedField(item, lang, 'title', 'titleEn') || '' : '';
  const descriptionText = item
    ? htmlToText(getLocalizedField(item, lang, 'description', 'descriptionEn'))
    : '';
  const specs = item && Array.isArray(item.specifications) ? item.specifications : [];
  const nestedApps =
    item && Array.isArray(item.applications) ? item.applications : [];
  const mainTrees = item ? getSubDocMainTrees(item) : [];
  const productLines = item ? getSubDocProductLines(item) : [];
  const linkInfo = item ? resolveSubDocLink(item, lang) : null;
  const productCount = item && Number.isFinite(item.productCount) ? item.productCount : 0;
  const products =
    item && Array.isArray(item.productEntries)
      ? item.productEntries.map((entry) => entry?.productId).filter(Boolean)
      : [];

  const linkLabel = lang === 'en' ? 'Learn more' : 'Tìm hiểu thêm';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="market-subdoc-modal-title"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl overflow-hidden max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Header ─────────────────────────────────────────────── */}
            <div className="relative bg-gradient-to-br from-primary/90 to-primary p-5 md:p-6 text-white flex items-start gap-4">
              <button
                type="button"
                onClick={onClose}
                aria-label={t('market.modal.close')}
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <FiX size={16} />
              </button>

              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={title}
                  loading="lazy"
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0 ring-2 ring-white/30 bg-white/10"
                  onError={(e) => {
                    e.currentTarget.src = placeholderProduct;
                  }}
                />
              ) : (
                <span className="w-16 h-16 rounded-xl bg-white/15 ring-2 ring-white/20 flex items-center justify-center flex-shrink-0">
                  {isTech ? <FiList size={22} /> : <FiLayers size={22} />}
                </span>
              )}

              <div className="min-w-0 pr-8">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/70 mb-1">
                  {isTech ? t('market.table.technology') : t('market.table.application')}
                </p>
                <h2
                  id="market-subdoc-modal-title"
                  className="text-lg md:text-xl font-bold leading-snug break-words"
                >
                  {title}
                </h2>
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  {productCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-[11px] font-semibold">
                      <FiPackage size={10} />
                      {lang === 'en' ? `${productCount} products` : `${productCount} sản phẩm`}
                    </span>
                  )}
                  {specs.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-[11px] font-semibold">
                      <FiList size={10} />
                      {lang === 'en' ? `${specs.length} specs` : `${specs.length} thông số`}
                    </span>
                  )}
                  {nestedApps.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-[11px] font-semibold">
                      <FiLayers size={10} />
                      {lang === 'en'
                        ? `${nestedApps.length} applications`
                        : `${nestedApps.length} ứng dụng`}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ── Body ───────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-5 md:p-6">
              {/* Mô tả */}
              {descriptionText ? (
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line break-words mb-5">
                  {descriptionText}
                </p>
              ) : (
                <p className="text-sm text-slate-400 italic mb-5">
                  {t('market.modal.noDescription')}
                </p>
              )}

              {/* Thông số kỹ thuật */}
              {specs.length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center gap-1.5 mb-2">
                    <FiList size={12} className="text-primary" />
                    <h3 className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                      {t('market.modal.specifications')}
                    </h3>
                  </div>
                  <SpecificationsTable specs={specs} lang={lang} />
                </div>
              )}

              {/* Ứng dụng lồng */}
              {nestedApps.length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center gap-1.5 mb-2">
                    <FiLayers size={12} className="text-accent-600" />
                    <h3 className="text-[11px] font-semibold uppercase tracking-wide text-accent-700">
                      {t('market.modal.applications')}
                    </h3>
                  </div>
                  <ul className="space-y-1.5">
                    {nestedApps.map((app, i) => {
                      const appTitle =
                        getLocalizedField(app, lang, 'title', 'titleEn') || '';
                      const appCount = Number.isFinite(app.productCount)
                        ? app.productCount
                        : 0;
                      return (
                        <li
                          key={app._id || i}
                          className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-gray-50 text-[13px] text-slate-700"
                        >
                          <span className="min-w-0 truncate break-words">{appTitle}</span>
                          {appCount > 0 && (
                            <span className="flex-shrink-0 text-[11px] font-medium text-slate-500">
                              {lang === 'en' ? `${appCount} products` : `${appCount} SP`}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Ngành / danh mục liên quan */}
              {(mainTrees.length > 0 || productLines.length > 0) && (
                <div className="mb-5 space-y-3">
                  {mainTrees.length > 0 && (
                    <div>
                      <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">
                        {t('market.modal.linkedIndustries')}
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {mainTrees.map((mt) => (
                          <Link
                            key={`mt-${mt._id}`}
                            to={`/${lang}/main-trees/${mt._id}`}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                          >
                            <FiLayers size={11} />
                            <span className="max-w-[180px] truncate">
                              {getLocalizedField(mt, lang, 'name', 'nameEn')}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  {productLines.length > 0 && (
                    <div>
                      <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">
                        {t('market.modal.linkedCategories')}
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {productLines.map((pl) => (
                          <Link
                            key={`pl-${pl._id}`}
                            to={`/${lang}/categories/${pl._id}`}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                          >
                            <FiPackage size={11} />
                            <span className="max-w-[180px] truncate">
                              {getLocalizedField(pl, lang, 'name', 'nameEn')}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Preview sản phẩm liên quan */}
              {products.length > 0 && (
                <div className="mb-1">
                  <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">
                    {t('market.table.products')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {products.slice(0, 6).map((p, i) => (
                      <Link
                        key={p._id || i}
                        to={`/${lang}/products/${p._id}`}
                        className="inline-flex items-center gap-2 px-2 py-1.5 rounded-lg border border-gray-100 bg-white hover:border-primary/40 transition-colors max-w-[240px]"
                      >
                        <img
                          src={p.imageUrl || placeholderProduct}
                          alt={getLocalizedField(p, lang, 'name', 'nameEn')}
                          loading="lazy"
                          className="w-7 h-7 rounded object-cover ring-1 ring-gray-100 flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = placeholderProduct;
                          }}
                        />
                        <span className="text-xs font-medium text-slate-700 truncate">
                          {getLocalizedField(p, lang, 'name', 'nameEn')}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Footer ────────────────────────────────────────────── */}
            <div className="flex items-center justify-between gap-3 flex-wrap px-5 md:px-6 py-3.5 border-t border-gray-100 bg-gray-50/60">
              {linkInfo ? (
                linkInfo.external ? (
                  <a
                    href={linkInfo.to}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-700 transition-colors"
                  >
                    {linkLabel}
                    <FiExternalLink size={12} />
                  </a>
                ) : (
                  <Link
                    to={linkInfo.to}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-700 transition-colors"
                  >
                    {linkLabel}
                    <FiChevronRight size={12} />
                  </Link>
                )
              ) : (
                <span />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center gap-1 bg-white border border-gray-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold hover:border-gray-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {t('market.modal.close')}
                </button>
                {productCount > 0 && onShowProducts && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onShowProducts(item);
                    }}
                    className="inline-flex items-center gap-1 bg-primary text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-primary-700 transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    <FiPackage size={12} />
                    {t('market.modal.relatedProducts')}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MarketSubDocModal;
