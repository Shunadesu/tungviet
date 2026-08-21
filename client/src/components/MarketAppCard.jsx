import { motion } from 'framer-motion';
import { FiPackage, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import placeholderProduct from '../assets/placeholder-product.svg';
import { htmlToText } from '../utils/html';
import { resolveSubDocLink } from '../utils/subDocLink';

const MarketAppCard = ({ app, index = 0, lang }) => {
  const entries = Array.isArray(app.productEntries)
    ? app.productEntries
        .map((entry) => ({
          product: entry.productId,
            application: Array.isArray(entry.productId?.applications)
              ? entry.productId.applications[entry.applicationIndex] || null
              : null,
        }))
        .filter((e) => e.product)
    : [];
  const products = entries.map((e) => e.product).filter(Boolean);
  const previewProducts = products.slice(0, 3);

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.35, delay: Math.min(index, 8) * 0.04 }}
      className="group relative h-full bg-gradient-to-br from-accent-50/40 via-white to-white rounded-2xl border border-accent-100 p-5 flex flex-col gap-4 transition-all duration-300 hover:border-accent-300 hover:shadow-card-hover hover:-translate-y-0.5 overflow-hidden"
    >
      <span
        aria-hidden="true"
        className="absolute top-3 right-3 inline-flex items-center justify-center min-w-[26px] h-[26px] px-2 rounded-full text-[11px] font-bold bg-accent text-white"
      >
        {String(index + 1).padStart(2, '0')}
      </span>

      <div className="flex items-start gap-4">
        {app.imageUrl ? (
          <img
            src={app.imageUrl}
            alt={app.title}
            loading="lazy"
            className="w-14 h-14 rounded-2xl object-cover flex-shrink-0 ring-1 ring-accent-100 transition-all group-hover:ring-accent-300"
            onError={(e) => {
              e.currentTarget.src = placeholderProduct;
            }}
          />
        ) : (
          <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl ring-1 ring-accent-100 flex-shrink-0 bg-accent-50 text-accent-700">
            <FiPackage size={22} />
          </span>
        )}

        <div className="flex-1 min-w-0 pr-8">
          <h3 className="text-base font-semibold text-slate-900 leading-snug mb-1 line-clamp-2">
            {app.title}
          </h3>
        </div>
      </div>

      {(app.description || app.descriptionEn) && (
        <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 break-words">
          {htmlToText(app.description || app.descriptionEn)}
        </p>
      )}

      {(() => {
        const linkInfo = resolveSubDocLink(app, lang);
        if (linkInfo) {
          const label = lang === 'en' ? 'Learn more' : 'Tìm hiểu thêm';
          if (linkInfo.external) {
            return (
              <a
                href={linkInfo.to}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-accent-700 hover:text-accent-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded self-start"
              >
                {label}
                <FiArrowRight size={11} />
              </a>
            );
          }
          return (
            <Link
              to={linkInfo.to}
              className="inline-flex items-center gap-1 text-xs font-semibold text-accent-700 hover:text-accent-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded self-start"
            >
              {label}
              <FiArrowRight size={11} />
            </Link>
          );
        }
        return null;
      })()}

      {previewProducts.length > 0 && (
        <div className="mt-auto pt-3 border-t border-accent-100/80">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex -space-x-2">
              {previewProducts.map((p, i) => (
                <img
                  key={p._id || i}
                  src={p.imageUrl || placeholderProduct}
                  alt={p.name}
                  loading="lazy"
                  className="w-6 h-6 rounded-full object-cover ring-2 ring-white"
                  onError={(e) => {
                    e.currentTarget.src = placeholderProduct;
                  }}
                />
              ))}
            </div>
            {products.length > previewProducts.length && (
              <span className="text-[11px] text-accent-700 font-medium">
                +{products.length - previewProducts.length}
              </span>
            )}
            <span className="text-[11px] text-gray-500 ml-auto">
              {products.length} {lang === 'en' ? 'products' : 'sản phẩm'}
            </span>
          </div>
          {products.length > 0 && (
            <Link
              to={`/${lang}/products/${products[0]._id}`}
              className="inline-flex items-center gap-1 text-xs font-medium text-accent-700 hover:text-accent-800 transition-colors"
            >
              {lang === 'en' ? 'Explore product' : 'Xem sản phẩm'}
              <FiArrowRight size={11} />
            </Link>
          )}
        </div>
      )}

      {entries.length > 0 && entries.some((e) => e.application) && (
        <div className="flex flex-wrap gap-1.5">
          {entries
            .filter((e) => e.application)
            .slice(0, 3)
            .map((e, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-50 text-slate-700 border border-slate-200"
              >
                {e.application.imageUrl ? (
                  <img
                    src={e.application.imageUrl}
                    alt=""
                    className="w-3 h-3 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : null}
                <span className="truncate max-w-[120px]">
                  {e.application.title || e.application.titleEn}
                </span>
              </span>
            ))}
          {entries.filter((e) => e.application).length > 3 && (
            <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-50 text-slate-500">
              +{entries.filter((e) => e.application).length - 3}
            </span>
          )}
        </div>
      )}
    </motion.article>
  );
};

export default MarketAppCard;
