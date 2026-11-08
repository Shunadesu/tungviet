import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiBox, FiPackage, FiSend, FiStar } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { getLocalizedField } from '../utils/i18nField';
import { htmlToExcerpt } from '../utils/html';

/**
 * Card cho 1 thị trường ứng dụng.
 *
 * Bố cục dọc (giống ProductLineCard):
 *   - Ảnh rộng 16/9 ở trên, badge "Nổi bật" + badge số SP / số ứng dụng
 *   - Tên + mô tả ngắn + ngành hàng liên kết
 *   - Footer 2 nút: "Yêu cầu báo giá" (điều hướng tới form báo giá với
 *     context thị trường) và "Xem chi tiết".
 */
const GRADIENTS = [
  'from-sky-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-cyan-500 to-sky-600',
  'from-teal-500 to-cyan-600',
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-green-600',
];

const MarketCard = ({ market, index = 0, lang = 'vi' }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const name = getLocalizedField(market, lang, 'title', 'titleEn');
  const description = getLocalizedField(
    market,
    lang,
    'description',
    'descriptionEn'
  );
  const excerpt = htmlToExcerpt(description, 120);

  const detailUrl = `/${lang}/markets/${market._id}`;
  const quoteUrl = `/${lang}/quote?market=${market._id}`;

  const gradient = GRADIENTS[index % GRADIENTS.length];
  const productCount = Number.isFinite(market.productCount) ? market.productCount : 0;
  const appCount = Array.isArray(market.applications) ? market.applications.length : 0;

  // Ngành hàng liên kết (MainTree) — có thể là mảng.
  const industries = Array.isArray(market.industry)
    ? market.industry.filter(Boolean)
    : market.industry
      ? [market.industry]
      : [];
  const industryName = industries.length
    ? getLocalizedField(industries[0], lang, 'name', 'nameEn')
    : '';

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
        {market.imageUrl ? (
          <img
            src={market.imageUrl}
            alt={name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}
          >
            <FiBox size={28} className="text-white/50" />
          </div>
        )}

        {/* Badge nổi bật */}
        {market.isFeatured === true && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500 text-white text-[10px] font-semibold shadow-sm">
              <FiStar size={10} />
              {t('market.featuredBadge')}
            </span>
          </div>
        )}

        {/* Badge số sản phẩm / ứng dụng */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
          {productCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900/85 text-white text-[10px] font-semibold backdrop-blur-sm">
              <FiPackage size={10} />
              {t('market.productCount', { count: productCount })}
            </span>
          )}
          {appCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900/85 text-white text-[10px] font-semibold backdrop-blur-sm">
              {t('market.appsCount', { n: appCount })}
            </span>
          )}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <span className="inline-flex items-center gap-1 text-white text-xs font-semibold">
            {t('market.viewDetails')}
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

        {industryName && (
          <p className="mt-1.5 inline-flex w-fit items-center rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-medium text-primary">
            {industryName}
          </p>
        )}

        <div className="mt-2.5 min-h-[2.5rem] flex items-start">
          {excerpt ? (
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{excerpt}</p>
          ) : (
            <p className="text-xs text-slate-400 italic">{t('market.noDescription')}</p>
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
            title={t('market.requestQuote')}
          >
            <FiSend size={12} />
            {t('market.requestQuote')}
          </button>

          <Link
            to={detailUrl}
            className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium py-2.5 rounded-lg border border-slate-200 text-slate-700 hover:border-primary hover:text-primary transition-colors"
          >
            <FiBox size={12} />
            {t('market.viewDetails')}
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default MarketCard;
