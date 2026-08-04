import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiCpu, FiPackage, FiFile, FiLayers } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import placeholderProduct from '../assets/placeholder-product.svg';
import {
  getMarketTitle,
  getMarketDescription,
  getMarketImage,
  getMarketTdsUrl,
} from '../utils/market';
import { htmlToText } from '../utils/html';

const MarketCard = ({ market, lang, index = 0 }) => {
  const { t } = useTranslation();

  const marketTitle = getMarketTitle(market, lang);
  const description = htmlToText(getMarketDescription(market, lang));

  const techCount =
    market.technologies?.filter((t) => t.isActive !== false).length ?? 0;
  const appCount =
    market.applications?.filter((a) => a.isActive !== false).length ?? 0;
  const hasTds = Boolean(getMarketTdsUrl(market));

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      className="card-elevated overflow-hidden flex flex-col h-full group"
    >
      <Link
        to={`/${lang}/markets/${market._id}`}
        className="flex flex-col h-full"
      >
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden bg-gray-50 flex-shrink-0">
          {getMarketImage(market) ? (
            <img
              src={market.imageUrl}
              alt={marketTitle}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = placeholderProduct;
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-100 via-primary-50 to-accent-50 flex items-center justify-center">
              <span className="text-5xl">🌍</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/10 to-transparent" />
          <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-sm text-[10px] font-semibold uppercase tracking-wider text-primary">
            <FiLayers size={10} />
            {t('market.applicationMarket')}
          </div>
          {hasTds && (
            <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-accent text-white text-[10px] font-semibold backdrop-blur-sm">
              <FiFile size={10} />
              TDS
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col p-5">
          <h3 className="text-base md:text-[17px] font-semibold text-slate-900 group-hover:text-primary transition-colors leading-snug line-clamp-2 min-h-[2.75rem]">
            {marketTitle}
          </h3>

          {/* Badges */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5 min-h-[28px]">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-50 text-primary text-[11px] font-medium">
              <FiCpu size={10} />
              {t('market.techsCount', { n: techCount })}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent-50 text-accent-700 text-[11px] font-medium">
              <FiPackage size={10} />
              {t('market.appsCount', { n: appCount })}
            </span>
            {hasTds && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium">
                TDS
              </span>
            )}
          </div>

          {/* Description */}
          <p className="mt-3 text-sm text-slate-600 leading-relaxed line-clamp-3">
            {description || (
              <span className="italic text-slate-400">
                {t('market.noDescription')}
              </span>
            )}
          </p>

          {/* Spacer + CTA */}
          <div className="flex-1" />
          <div className="mt-4 pt-4 border-t border-gray-100 inline-flex items-center justify-between text-sm font-semibold text-primary group-hover:text-primary-700 transition-colors">
            <span>{t('market.viewDetails')}</span>
            <FiArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-1"
            />
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

export default MarketCard;