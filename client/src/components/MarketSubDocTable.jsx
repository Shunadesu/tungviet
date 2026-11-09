import { useTranslation } from 'react-i18next';
import { FiChevronRight, FiCpu, FiLayers } from 'react-icons/fi';
import placeholderProduct from '../assets/placeholder-product.svg';
import { htmlToExcerpt } from '../utils/html';
import { getLocalizedField } from '../utils/i18nField';

/**
 * Bảng dùng chung cho hai tab "Công nghệ" và "Ứng dụng" của trang chi tiết
 * thị trường. Mỗi dòng là một sub-doc (technology / application) của
 * `MarketTree`; click vào dòng sẽ mở modal chi tiết.
 *
 * @param {object} props
 * @param {Array<object>} props.items - Danh sách sub-doc.
 * @param {'technology'|'application'} props.variant - Loại sub-doc.
 * @param {string} props.lang - Mã ngôn ngữ ('vi' | 'en').
 * @param {(item: object) => void} props.onSelect - Mở modal chi tiết.
 */
const MarketSubDocTable = ({
  items = [],
  variant = 'technology',
  lang = 'vi',
  onSelect,
}) => {
  const { t } = useTranslation();
  const isTech = variant === 'technology';

  const titleLabel = isTech ? t('market.table.technology') : t('market.table.application');
  const Icon = isTech ? FiCpu : FiLayers;
  const iconTone = isTech
    ? 'bg-primary-50 text-primary ring-primary-100'
    : 'bg-accent-50 text-accent ring-accent-100';

  const columns = [
    { id: 'index', label: t('market.table.index'), className: 'w-14' },
    { id: 'name', label: titleLabel },
    { id: 'description', label: t('market.table.description') },
    ...(isTech
      ? [
          { id: 'specifications', label: t('market.table.specifications'), className: 'w-28' },
          { id: 'applications', label: t('market.table.applicationCount'), className: 'w-40' },
        ]
      : []),
    { id: 'products', label: t('market.table.products'), className: 'w-24' },
    { id: 'action', label: t('market.table.action'), className: 'w-24' },
  ];

  const renderNameCell = (item) => {
    const title = getLocalizedField(item, lang, 'title', 'titleEn') || '';
    return (
      <div className="flex items-center gap-2.5 min-w-0">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={title}
            loading="lazy"
            className="w-9 h-9 rounded-lg object-cover flex-shrink-0 ring-1 ring-gray-100"
            onError={(e) => {
              e.currentTarget.src = placeholderProduct;
            }}
          />
        ) : (
          <span
            className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ring-1 flex-shrink-0 ${iconTone}`}
          >
            <Icon size={16} />
          </span>
        )}
        <span className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 break-words">
          {title}
        </span>
      </div>
    );
  };

  const renderSpecCell = (item) => {
    const specs = Array.isArray(item.specifications) ? item.specifications : [];
    if (specs.length === 0) {
      return <span className="text-xs text-slate-300">—</span>;
    }
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
        {lang === 'en' ? `${specs.length} specs` : `${specs.length} thông số`}
      </span>
    );
  };

  const renderApplicationsCell = (item) => {
    const apps = Array.isArray(item.applications) ? item.applications : [];
    if (apps.length === 0) {
      return <span className="text-xs text-slate-300">—</span>;
    }
    const names = apps
      .map((app) => getLocalizedField(app, lang, 'title', 'titleEn'))
      .filter(Boolean);
    return (
      <div className="min-w-0">
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-accent-50 text-accent-700 mb-1">
          {lang === 'en' ? `${apps.length} applications` : `${apps.length} ứng dụng`}
        </span>
        <p className="text-[11px] text-slate-500 leading-snug line-clamp-2 break-words">
          {names.join(' · ')}
        </p>
      </div>
    );
  };

  const renderProductsCell = (item) => {
    const count = Number.isFinite(item.productCount) ? item.productCount : 0;
    if (count <= 0) {
      return <span className="text-xs text-slate-300">—</span>;
    }
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary-50 text-primary-700">
        {lang === 'en' ? `${count} products` : `${count} sản phẩm`}
      </span>
    );
  };

  const renderCell = (item, columnId, index) => {
    switch (columnId) {
      case 'index':
        return (
          <span className="inline-flex items-center justify-center min-w-[26px] h-[22px] px-1.5 rounded bg-primary-50 text-[10px] font-bold text-primary-700">
            {String(index + 1).padStart(2, '0')}
          </span>
        );
      case 'name':
        return renderNameCell(item);
      case 'description': {
        const desc = htmlToExcerpt(
          getLocalizedField(item, lang, 'description', 'descriptionEn'),
          90
        );
        return desc ? (
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 break-words">
            {desc}
          </p>
        ) : (
          <span className="text-xs text-slate-300">—</span>
        );
      }
      case 'specifications':
        return renderSpecCell(item);
      case 'applications':
        return renderApplicationsCell(item);
      case 'products':
        return renderProductsCell(item);
      case 'action':
        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(item);
            }}
            className="inline-flex items-center gap-0.5 text-xs font-semibold text-primary whitespace-nowrap
                       hover:text-primary-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
          >
            {t('market.table.details')}
            <FiChevronRight size={12} />
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white">
      <table className="w-full min-w-[720px] text-left border-collapse">
        <thead>
          <tr className="bg-gray-50/80">
            {columns.map((col) => (
              <th
                key={col.id}
                scope="col"
                className={`px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap ${
                  col.className || ''
                }`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr
              key={item._id || index}
              onClick={() => onSelect?.(item)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect?.(item);
                }
              }}
              className="border-t border-gray-100 hover:bg-primary-50/40 transition-colors cursor-pointer
                         focus:outline-none focus-visible:bg-primary-50/60"
            >
              {columns.map((col) => (
                <td
                  key={col.id}
                  className="px-3 py-3 align-top text-slate-700"
                >
                  {renderCell(item, col.id, index)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MarketSubDocTable;
