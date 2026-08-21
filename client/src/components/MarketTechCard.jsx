import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCpu, FiArrowDown, FiArrowUp, FiZap, FiCheck, FiArrowRight } from 'react-icons/fi';
import placeholderProduct from '../assets/placeholder-product.svg';
import { htmlToText } from '../utils/html';
import { resolveSubDocLink } from '../utils/subDocLink';

const SUMMARY_LIMIT = 180;

const MarketTechCard = ({ tech, index = 0, lang = 'vi' }) => {
  const [expanded, setExpanded] = useState(false);

  const fullText = tech.description ? htmlToText(tech.description) : '';
  const isLong = fullText.length > SUMMARY_LIMIT;
  const summary = isLong ? `${fullText.slice(0, SUMMARY_LIMIT).trimEnd()}…` : fullText;

  const isAccent = false; // giữ prop nếu sau này muốn tone khác
  void isAccent;

  // Bullet extraction: nếu description có dạng HTML <ul><li> thì htmlToText vẫn giữ được
  // các dòng riêng. Nếu là text thường, tự tách theo dòng/câu.
  const bullets = fullText
    ? fullText
        .split(/\n+|(?:^|\s)[•\-\*]\s+|(?<=[.!?])\s+(?=[A-ZĐÂĂÊÔƠƯÁÀẢÃẠẤẦẨẪẬẮẰẲẴẶẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌỐỒỔỖỘỚỜỞỠỢÚÙỦŨỤỨỪỬỮỰÝỲỶỸỴ])/)
        .map((s) => s.trim())
        .filter((s) => s.length >= 12 && s.length <= 220)
        .slice(0, 4)
    : [];

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: Math.min(index, 6) * 0.05 }}
      className="group relative h-full flex flex-col rounded-2xl bg-white border border-gray-100 overflow-hidden transition-all duration-300 hover:border-primary/40 hover:shadow-card-hover hover:-translate-y-0.5"
    >
      {/* Top accent bar */}
      <span
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary-400 to-primary-700 opacity-80 group-hover:opacity-100 transition-opacity"
      />

      {/* Header zone: number + icon + title */}
      <div className="relative p-5 pb-4">
        <span
          aria-hidden="true"
          className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-primary-50 text-primary-700 ring-1 ring-primary-100"
        >
          <FiZap size={9} />
          #{String(index + 1).padStart(2, '0')}
        </span>

        <div className="flex items-start gap-4">
          {tech.imageUrl ? (
            <img
              src={tech.imageUrl}
              alt={tech.title}
              loading="lazy"
              className="w-16 h-16 rounded-2xl object-cover flex-shrink-0 ring-2 ring-primary-100 transition-all group-hover:ring-primary-300 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = placeholderProduct;
              }}
            />
          ) : (
            <span className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 text-primary ring-2 ring-primary-100 flex-shrink-0 transition-all group-hover:scale-105">
              <FiCpu size={26} />
            </span>
          )}

          <div className="flex-1 min-w-0 pr-12">
            <span className="inline-block text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/70 mb-1">
              {lang === 'en' ? 'Technology' : 'Công nghệ'}
            </span>
            <h3 className="text-lg font-bold text-slate-900 leading-snug line-clamp-2">
              {tech.title}
            </h3>
          </div>
        </div>
      </div>

      {/* Body: summary or bullets */}
      {fullText && (
        <div className="px-5 pb-2 flex-1">
          {bullets.length >= 2 ? (
            <ul className="space-y-2">
              {bullets.map((b, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-slate-700 leading-relaxed"
                >
                  <span className="flex-shrink-0 mt-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary-50 text-primary">
                    <FiCheck size={10} />
                  </span>
                  <span className="break-words">{b}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-600 leading-relaxed break-words">
              {summary}
            </p>
          )}
        </div>
      )}

      {/* Expand zone */}
      <AnimatePresence initial={false}>
        {expanded && isLong && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-3 pt-1 border-t border-gray-100">
              <p className="text-sm text-slate-600 leading-relaxed break-words whitespace-pre-line">
                {fullText}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer: chips (related product count) + toggle + link */}
      <div className="px-5 py-3 mt-auto border-t border-gray-100 bg-gray-50/50 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-xs text-slate-500 min-w-0">
          {Array.isArray(tech.products) && tech.products.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white ring-1 ring-gray-200 text-slate-600 font-medium">
              {tech.products.length}{' '}
              {lang === 'en' ? 'related products' : 'sản phẩm liên quan'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {(() => {
            const linkInfo = resolveSubDocLink(tech, lang);
            if (linkInfo) {
              const label = lang === 'en' ? 'Learn more' : 'Xem chi tiết';
              if (linkInfo.external) {
                return (
                  <a
                    href={linkInfo.to}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                  >
                    {label}
                    <FiArrowRight size={12} />
                  </a>
                );
              }
              return (
                <Link
                  to={linkInfo.to}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                >
                  {label}
                  <FiArrowRight size={12} />
                </Link>
              );
            }
            return null;
          })()}

          {isLong && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              aria-expanded={expanded}
            >
              {expanded
                ? (lang === 'en' ? 'Collapse' : 'Thu gọn')
                : (lang === 'en' ? 'Read more' : 'Xem thêm')}
              {expanded ? <FiArrowUp size={12} /> : <FiArrowDown size={12} />}
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
};

export default MarketTechCard;