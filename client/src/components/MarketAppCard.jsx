import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiPackage,
  FiArrowRight,
  FiLayers,
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

const MarketAppCard = ({ app, index = 0, lang = 'vi', onShowProducts }) => {
  // `app.productEntries` là mảng `{ productId }` — server đã populate product.
  const products = Array.isArray(app.productEntries)
    ? app.productEntries.map((entry) => entry?.productId).filter(Boolean)
    : [];

  const title = getLocalizedField(app, lang, 'title', 'titleEn') || '';
  const description = htmlToText(app.description || '');
  const productCount = Number.isFinite(app.productCount)
    ? app.productCount
    : products.length;
  const mainTrees = getSubDocMainTrees(app);
  const productLines = getSubDocProductLines(app);
  const linkInfo = resolveSubDocLink(app, lang);

  const previewProducts = products.slice(0, 3);

  const renderLink = () => {
    if (!linkInfo) return null;
    const label = lang === 'en' ? 'Learn more' : 'Tìm hiểu thêm';
    const cls =
      'inline-flex items-center gap-1 text-xs font-semibold text-accent-700 hover:text-accent-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded';
    if (linkInfo.external) {
      return (
        <a href={linkInfo.to} target="_blank" rel="noopener noreferrer" className={cls}>
          {label}
          <FiExternalLink size={11} />
        </a>
      );
    }
    return (
      <Link to={linkInfo.to} className={cls}>
        {label}
        <FiArrowRight size={11} />
      </Link>
    );
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.35, delay: Math.min(index, 8) * 0.04 }}
      className="group relative h-full bg-gradient-to-br from-accent-50/40 via-white to-white rounded-xl border border-accent-100 p-3.5 flex flex-col gap-2.5 transition-all duration-300 hover:border-accent-300 hover:shadow-card-hover hover:-translate-y-0.5 overflow-hidden"
    >
      <span
        aria-hidden="true"
        className="absolute top-3 right-3 inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full text-[10px] font-bold bg-accent text-white"
      >
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* Header: icon + title + product count */}
      <div className="flex items-start gap-2.5">
        {app.imageUrl ? (
          <img
            src={app.imageUrl}
            alt={title}
            loading="lazy"
            className="w-10 h-10 rounded-lg object-cover flex-shrink-0 ring-1 ring-accent-100 transition-all group-hover:ring-accent-300"
            onError={(e) => {
              e.currentTarget.src = placeholderProduct;
            }}
          />
        ) : (
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg ring-1 ring-accent-100 flex-shrink-0 bg-accent-50 text-accent-700">
            <FiPackage size={17} />
          </span>
        )}

        <div className="flex-1 min-w-0 pr-7">
          <h3 className="text-sm font-semibold text-slate-900 leading-snug mb-1 line-clamp-2">
            {title}
          </h3>
          {productCount > 0 && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-accent-50 text-accent-700">
              <FiPackage size={9} />
              {lang === 'en' ? `${productCount} products` : `${productCount} sản phẩm`}
            </span>
          )}
        </div>
      </div>

      {description && (
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 break-words">
          {description}
        </p>
      )}

      {/* Linked chips: cây ngành + danh mục sản phẩm */}
      {(mainTrees.length > 0 || productLines.length > 0) && (
        <div className="flex flex-wrap gap-1.5">
          {mainTrees.map((mt) => (
            <Link
              key={`mt-${mt._id}`}
              to={`/${lang}/main-trees/${mt._id}`}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
            >
              <FiLayers size={9} />
              <span className="max-w-[110px] truncate">
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
              <span className="max-w-[110px] truncate">
                {getLocalizedField(pl, lang, 'name', 'nameEn')}
              </span>
            </Link>
          ))}
        </div>
      )}

      {renderLink()}

      {products.length > 0 && (
        <div className="mt-auto pt-2.5 border-t border-accent-100/80">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex -space-x-2">
              {previewProducts.map((p, i) => (
                <img
                  key={p._id || i}
                  src={p.imageUrl || placeholderProduct}
                  alt={getLocalizedField(p, lang, 'name', 'nameEn')}
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
            <span className="text-[11px] text-gray-500 ml-auto truncate max-w-[110px]">
              {getLocalizedField(products[0], lang, 'name', 'nameEn')}
            </span>
          </div>
          {onShowProducts ? (
            <button
              type="button"
              onClick={() => onShowProducts(app)}
              className="inline-flex items-center gap-1 text-xs font-medium text-accent-700 hover:text-accent-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
            >
              {lang === 'en' ? 'View products for this application' : 'Xem sản phẩm ứng dụng'}
              <FiArrowRight size={11} />
            </button>
          ) : (
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
    </motion.article>
  );
};

export default MarketAppCard;
