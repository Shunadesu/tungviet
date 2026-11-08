import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiDownload, FiFileText, FiArrowRight } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { useQuoteBag } from '../context/QuoteBagContext';
import { useToast } from '../context/ToastContext';
import placeholderProduct from '../assets/placeholder-product.svg';

/**
 * Bảng danh sách SKU của một "sản phẩm chính" (product line).
 *
 * Mỗi dòng là 1 SKU (product) với mã sản phẩm riêng. Desktop hiển thị dạng
 * bảng, mobile chuyển sang dạng card xếp dọc.
 */
const formatPrice = (product, lang) => {
  if (product.priceVisible === false) return null;
  if (typeof product.price !== 'number' || product.price <= 0) return null;
  return new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(product.price);
};

const SkuTable = ({ skus = [], lang = 'vi' }) => {
  const { t } = useTranslation();
  const { addToQuoteBag, isInBag } = useQuoteBag();
  const toast = useToast();

  const handleAdd = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addToQuoteBag(product);
    toast.success(t('toast.addedToQuoteBag'));
  };

  if (!skus.length) return null;

  return (
    <div className="w-full">
      {/* ── Desktop: bảng ─────────────────────────────────────────────── */}
      <div className="hidden md:block overflow-x-auto scrollbar-thin">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500 py-3 pr-3">
                {t('product.skuCode')}
              </th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500 py-3 px-3">
                {t('product.skuName')}
              </th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500 py-3 px-3 whitespace-nowrap">
                {t('product.softeningPoint')}
              </th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500 py-3 px-3 whitespace-nowrap">
                {t('product.acidValue')}
              </th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500 py-3 px-3 whitespace-nowrap">
                {t('product.color')}
              </th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500 py-3 px-3 whitespace-nowrap">
                {t('product.price')}
              </th>
              <th className="text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500 py-3 pl-3">
                {t('product.skuActions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {skus.map((sku, index) => {
              const inBag = isInBag(sku._id);
              const priceLabel = formatPrice(sku, lang);
              return (
                <motion.tr
                  key={sku._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index, 8) * 0.04, duration: 0.28 }}
                  className="border-b border-gray-100 hover:bg-slate-50/70 transition-colors"
                >
                  <td className="py-3 pr-3 align-middle">
                    <Link
                      to={`/${lang}/products/${sku._id}`}
                      className="inline-flex items-center gap-2.5 min-w-0 group"
                    >
                      <img
                        src={sku.imageUrl || placeholderProduct}
                        alt={sku.name}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = placeholderProduct;
                        }}
                        className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                      />
                      <span className="font-mono text-xs font-semibold text-slate-900 group-hover:text-primary transition-colors">
                        {sku.productCode || '—'}
                      </span>
                    </Link>
                  </td>
                  <td className="py-3 px-3 align-middle">
                    <Link
                      to={`/${lang}/products/${sku._id}`}
                      className="text-sm text-slate-800 hover:text-primary transition-colors font-medium line-clamp-2 block"
                    >
                      {sku.name}
                    </Link>
                  </td>
                  <td className="py-3 px-3 align-middle text-xs text-slate-600 whitespace-nowrap">
                    {sku.softeningPoint || '—'}
                  </td>
                  <td className="py-3 px-3 align-middle text-xs text-slate-600 whitespace-nowrap">
                    {sku.acidValue || '—'}
                  </td>
                  <td className="py-3 px-3 align-middle text-xs text-slate-600 whitespace-nowrap">
                    {sku.color || '—'}
                  </td>
                  <td className="py-3 px-3 align-middle text-xs font-semibold text-slate-900 whitespace-nowrap">
                    {priceLabel || (
                      <span className="font-normal text-primary">
                        {t('product.contactUs')}
                      </span>
                    )}
                  </td>
                  <td className="py-3 pl-3 align-middle">
                    <div className="flex items-center justify-end gap-2">
                      {sku.tdsUrl && (
                        <a
                          href={sku.tdsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={t('product.downloadTds')}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-accent/10 text-accent hover:bg-accent hover:text-white transition-colors"
                        >
                          <FiDownload size={11} />
                          TDS
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleAdd(e, sku)}
                        disabled={inBag}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                          inBag
                            ? 'bg-primary-50 text-primary-700 cursor-default'
                            : 'bg-slate-900 text-white hover:bg-primary'
                        }`}
                      >
                        <FiFileText size={11} />
                        {inBag ? t('product.addedToQuote') : t('product.requestQuote')}
                      </button>
                      <Link
                        to={`/${lang}/products/${sku._id}`}
                        aria-label={t('product.viewDetails')}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-primary hover:bg-primary-50 transition-colors"
                      >
                        <FiArrowRight size={13} />
                      </Link>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Mobile: card ───────────────────────────────────────────────── */}
      <div className="md:hidden space-y-3">
        {skus.map((sku, index) => {
          const inBag = isInBag(sku._id);
          const priceLabel = formatPrice(sku, lang);
          return (
            <motion.div
              key={sku._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index, 8) * 0.04, duration: 0.28 }}
              className="border border-gray-100 rounded-xl p-3.5 bg-white"
            >
              <div className="flex items-start gap-3">
                <Link
                  to={`/${lang}/products/${sku._id}`}
                  className="w-14 h-14 rounded-lg object-cover bg-gray-100 flex-shrink-0 overflow-hidden"
                >
                  <img
                    src={sku.imageUrl || placeholderProduct}
                    alt={sku.name}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = placeholderProduct;
                    }}
                    className="w-full h-full object-cover"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <span className="inline-block font-mono text-[11px] font-semibold text-primary bg-primary-50 px-1.5 py-0.5 rounded">
                    {sku.productCode || '—'}
                  </span>
                  <Link
                    to={`/${lang}/products/${sku._id}`}
                    className="block text-sm font-medium text-slate-900 hover:text-primary transition-colors line-clamp-2 mt-1"
                  >
                    {sku.name}
                  </Link>
                </div>
              </div>

              {(sku.softeningPoint || sku.acidValue || sku.color) && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {sku.softeningPoint && (
                    <span className="text-[11px] text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md">
                      {t('product.softeningPoint')}: {sku.softeningPoint}
                    </span>
                  )}
                  {sku.acidValue && (
                    <span className="text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                      {t('product.acidValue')}: {sku.acidValue}
                    </span>
                  )}
                  {sku.color && (
                    <span className="text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                      {t('product.color')}: {sku.color}
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs font-semibold text-slate-900">
                  {priceLabel || (
                    <span className="font-normal text-primary">{t('product.contactUs')}</span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  {sku.tdsUrl && (
                    <a
                      href={sku.tdsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-accent/10 text-accent"
                    >
                      <FiDownload size={11} />
                      TDS
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={(e) => handleAdd(e, sku)}
                    disabled={inBag}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium ${
                      inBag
                        ? 'bg-primary-50 text-primary-700 cursor-default'
                        : 'bg-slate-900 text-white hover:bg-primary'
                    }`}
                  >
                    <FiFileText size={11} />
                    {inBag ? t('product.addedToQuote') : t('product.requestQuote')}
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default SkuTable;
