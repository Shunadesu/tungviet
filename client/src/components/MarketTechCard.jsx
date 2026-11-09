import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCpu,
  FiArrowDown,
  FiArrowUp,
  FiCheck,
  FiArrowRight,
  FiLayers,
  FiList,
  FiPackage,
  FiExternalLink,
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

const SUMMARY_LIMIT = 160;
const SPEC_PREVIEW_LIMIT = 4;

const formatSpecValue = (spec, lang) => {
  const raw =
    lang === 'en'
      ? (spec.valueEn && spec.valueEn.trim()) || spec.value || ''
      : spec.value || '';
  if (raw && spec.unit) return `${raw} ${spec.unit}`;
  return raw || spec.unit || '';
};

const MarketTechCard = ({
  tech,
  index = 0,
  lang = 'vi',
  onShowProducts,
}) => {
  const [expanded, setExpanded] = useState(false);

  const fullText = tech.description ? htmlToText(tech.description) : '';
  const isLong = fullText.length > SUMMARY_LIMIT;
  const summary = isLong ? `${fullText.slice(0, SUMMARY_LIMIT).trimEnd()}…` : fullText;

  const title = getLocalizedField(tech, lang, 'title', 'titleEn') || '';
  const specs = Array.isArray(tech.specifications) ? tech.specifications : [];
  const sortedSpecs = [...specs]
    .filter((s) => s && typeof s.key === 'string' && s.key.trim())
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const nestedApps = Array.isArray(tech.applications) ? tech.applications : [];
  const productCount = Number.isFinite(tech.productCount) ? tech.productCount : 0;
  const mainTrees = getSubDocMainTrees(tech);
  const productLines = getSubDocProductLines(tech);
  const linkInfo = resolveSubDocLink(tech, lang);

  // Bullet extraction: nếu description có dạng HTML <ul><li> thì htmlToText vẫn giữ được
  // các dòng riêng. Nếu là text thường, tự tách theo dòng/câu.
  const bullets = fullText
    ? fullText
        .split(/\n+|(?:^|\s)[•\-\*]\s+|(?<=[.!?])\s+(?=[A-ZĐÂĂÊÔƠƯÁÀẢÃẠẤẦẨẪẬẮẰẲẴẶẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌỐỒỔỖỘỚỜỞỠỢÚÙỦŨỤỨỪỬỮỰÝỲỶỸỴ])/)
        .map((s) => s.trim())
        .filter((s) => s.length >= 12 && s.length <= 220)
        .slice(0, 4)
    : [];

  const linkLabel = lang === 'en' ? 'Learn more' : 'Xem chi tiết';

  const renderLink = () => {
    if (!linkInfo) return null;
    const cls =
      'inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded';
    if (linkInfo.external) {
      return (
        <a href={linkInfo.to} target="_blank" rel="noopener noreferrer" className={cls}>
          {linkLabel}
          <FiExternalLink size={12} />
        </a>
      );
    }
    return (
      <Link to={linkInfo.to} className={cls}>
        {linkLabel}
        <FiArrowRight size={12} />
      </Link>
    );
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: Math.min(index, 6) * 0.05 }}
      className="group relative h-full flex flex-col rounded-xl bg-white border border-gray-100 overflow-hidden transition-all duration-300 hover:border-primary/40 hover:shadow-card-hover hover:-translate-y-0.5"
    >
      {/* Top accent bar */}
      <span
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary-400 to-primary-700 opacity-80 group-hover:opacity-100 transition-opacity"
      />

      {/* Header zone: icon + title + quick stats */}
      <div className="relative p-3.5 pb-2.5">
        <span
          aria-hidden="true"
          className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-primary-50 text-primary-700 ring-1 ring-primary-100"
        >
          #{String(index + 1).padStart(2, '0')}
        </span>

        <div className="flex items-start gap-2.5">
          {tech.imageUrl ? (
            <img
              src={tech.imageUrl}
              alt={title}
              loading="lazy"
              className="w-10 h-10 rounded-lg object-cover flex-shrink-0 ring-2 ring-primary-100 transition-all group-hover:ring-primary-300 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = placeholderProduct;
              }}
            />
          ) : (
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary-50 to-primary-100 text-primary ring-2 ring-primary-100 flex-shrink-0 transition-all group-hover:scale-105">
              <FiCpu size={17} />
            </span>
          )}

          <div className="flex-1 min-w-0 pr-9">
            <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
              {title}
            </h3>
          </div>
        </div>

        {/* Quick stats */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {specs.length > 0 && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
              <FiList size={9} />
              {lang === 'en' ? `${specs.length} specs` : `${specs.length} thông số`}
            </span>
          )}
          {nestedApps.length > 0 && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-accent-50 text-accent-700">
              <FiLayers size={9} />
              {lang === 'en' ? `${nestedApps.length} applications` : `${nestedApps.length} ứng dụng`}
            </span>
          )}
          {productCount > 0 && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary-50 text-primary-700">
              <FiPackage size={9} />
              {lang === 'en' ? `${productCount} products` : `${productCount} sản phẩm`}
            </span>
          )}
        </div>
      </div>

      {/* Body: summary or bullets */}
      {fullText && (
        <div className="px-3.5 pb-2 flex-1">
          {bullets.length >= 2 ? (
            <ul className="space-y-1.5">
              {bullets.map((b, i) => (
                <li
                  key={i}
                  className="flex items-start gap-1.5 text-[13px] text-slate-700 leading-relaxed"
                >
                  <span className="flex-shrink-0 mt-0.5 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-primary-50 text-primary">
                    <FiCheck size={9} />
                  </span>
                  <span className="break-words">{b}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-slate-600 leading-relaxed break-words line-clamp-3">
              {summary}
            </p>
          )}
        </div>
      )}

      {/* Compact spec preview */}
      {sortedSpecs.length > 0 && (
        <div className="px-3.5 pb-2">
          <dl className="grid grid-cols-2 gap-x-3 gap-y-1">
            {sortedSpecs.slice(0, SPEC_PREVIEW_LIMIT).map((spec, i) => (
              <div key={spec._id || i} className="min-w-0">
                <dt className="text-[10px] text-slate-400 truncate">{spec.key}</dt>
                <dd className="text-[12px] font-semibold text-slate-800 truncate">
                  {formatSpecValue(spec, lang) || '—'}
                </dd>
              </div>
            ))}
          </dl>
          {sortedSpecs.length > SPEC_PREVIEW_LIMIT && (
            <p className="mt-1 text-[10px] text-slate-400">
              {lang === 'en'
                ? `+${sortedSpecs.length - SPEC_PREVIEW_LIMIT} more specifications`
                : `+${sortedSpecs.length - SPEC_PREVIEW_LIMIT} thông số khác`}
            </p>
          )}
        </div>
      )}

      {/* Expand zone — full description + full spec table */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-3.5 pb-3 pt-2 border-t border-gray-100">
              {isLong && (
                <p className="text-[13px] text-slate-600 leading-relaxed break-words whitespace-pre-line mb-2">
                  {fullText}
                </p>
              )}
              {sortedSpecs.length > SPEC_PREVIEW_LIMIT && (
                <SpecificationsTable specs={sortedSpecs} lang={lang} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nested applications */}
      {nestedApps.length > 0 && (
        <div className="px-3.5 pb-2">
          <div className="flex items-center gap-1.5 mb-1.5">
            <FiLayers size={11} className="text-accent-600" />
            <span className="text-[10px] font-semibold uppercase tracking-wide text-accent-700">
              {lang === 'en' ? 'Applications' : 'Ứng dụng'}
            </span>
          </div>
          <ul className="space-y-1">
            {nestedApps.map((app, i) => {
              const appTitle =
                getLocalizedField(app, lang, 'title', 'titleEn') || '';
              const appCount = Number.isFinite(app.productCount) ? app.productCount : 0;
              return (
                <li
                  key={app._id || i}
                  className="flex items-center justify-between gap-2 px-2 py-1 rounded bg-slate-50 text-[12px] text-slate-700"
                >
                  <span className="truncate">{appTitle}</span>
                  {appCount > 0 && (
                    <span className="flex-shrink-0 text-[10px] font-medium text-slate-500">
                      {lang === 'en' ? `${appCount} products` : `${appCount} SP`}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Linked chips: cây ngành + danh mục sản phẩm */}
      {(mainTrees.length > 0 || productLines.length > 0) && (
        <div className="px-3.5 pb-2 flex flex-wrap gap-1.5">
          {mainTrees.map((mt) => (
            <Link
              key={`mt-${mt._id}`}
              to={`/${lang}/main-trees/${mt._id}`}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
            >
              <FiLayers size={9} />
              <span className="max-w-[120px] truncate">
                {getLocalizedField(mt, lang, 'name', 'nameEn')}
              </span>
            </Link>
          ))}
          {productLines.map((pl) => (
            <Link
              key={`pl-${pl._id}`}
              to={`/${lang}/categories/${pl._id}`}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
            >
              <FiPackage size={9} />
              <span className="max-w-[120px] truncate">
                {getLocalizedField(pl, lang, 'name', 'nameEn')}
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Footer: actions */}
      <div className="px-3.5 py-2.5 mt-auto border-t border-gray-100 bg-gray-50/50 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          {productCount > 0 && onShowProducts && (
            <button
              type="button"
              onClick={() => onShowProducts(tech)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            >
              {lang === 'en' ? 'View related products' : 'Xem sản phẩm liên quan'}
              <FiArrowRight size={12} />
            </button>
          )}
          {renderLink()}
        </div>

        {(isLong || sortedSpecs.length > SPEC_PREVIEW_LIMIT) && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            aria-expanded={expanded}
          >
            {expanded
              ? (lang === 'en' ? 'Collapse' : 'Thu gọn')
              : (lang === 'en' ? 'Read more' : 'Xem thêm')}
            {expanded ? <FiArrowUp size={12} /> : <FiArrowDown size={12} />}
          </button>
        )}
      </div>
    </motion.article>
  );
};

export default MarketTechCard;
