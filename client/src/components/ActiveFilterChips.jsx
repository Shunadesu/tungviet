import { useTranslation } from 'react-i18next';
import { FiLink2 } from 'react-icons/fi';
import FilterChip from './FilterChip';
import { getLocalizedField } from '../utils/i18nField';
import { useToast } from '../context/ToastContext';

/**
 * Renders one FilterChip per active filter value with a remove button.
 * Resolves `industries` / `category` / `market` values to their localized names
 * so the user sees "Cây ngành: Nhựa thông" instead of the raw ObjectId.
 *
 * `industries` and `market` are arrays (CSV in URL), each producing one chip
 * per selected id.
 */
const ActiveFilterChips = ({
  values,
  setParam,
  clearAll,
  getShareUrl,
  mainTrees = [],
  categories = [],
  marketTrees = [],
  softeningPointRanges = [],
}) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'en' : 'vi';
  const toast = useToast();

  const chips = [];
  const selectedIndustries = Array.isArray(values.industries) ? values.industries : [];
  const selectedMarkets = Array.isArray(values.market) ? values.market : [];

  selectedIndustries.forEach((id) => {
    const m = mainTrees.find((x) => x._id === id);
    chips.push({
      key: `industries-${id}`,
      label: `${t('nav.mainTreeMenuTitle')}: ${getLocalizedField(m || {}, lang, 'name', 'nameEn') || id}`,
      onRemove: () => {
        const next = selectedIndustries.filter((x) => x !== id);
        setParam('industries', next);
      },
    });
  });

  if (values.category) {
    const c = categories.find((x) => x._id === values.category);
    if (c) {
      chips.push({
        key: 'category',
        label: `${t('product.filter.productLine')}: ${getLocalizedField(c, lang, 'name', 'nameEn')}`,
        onRemove: () => setParam('category', ''),
      });
    }
  }

  selectedMarkets.forEach((id) => {
    const m = marketTrees.find((x) => x._id === id);
    chips.push({
      key: `market-${id}`,
      label: `${t('nav.marketTrees')}: ${getLocalizedField(m || {}, lang, 'title', 'titleEn') || id}`,
      onRemove: () => {
        const next = selectedMarkets.filter((x) => x !== id);
        setParam('market', next);
      },
    });
  });

  if (values.softeningPoint) {
    const range = softeningPointRanges.find((r) => r.value === values.softeningPoint);
    chips.push({
      key: 'softeningPoint',
      label: `${t('product.softeningPoint')}: ${range ? range.label : values.softeningPoint}`,
      onRemove: () => setParam('softeningPoint', ''),
    });
  }

  if (chips.length === 0 && !getShareUrl) return null;

  const handleCopyLink = async () => {
    if (!getShareUrl) return;
    const url = getShareUrl();
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for older browsers / non-https
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      toast.success(t('toast.copied'));
    } catch (err) {
      console.warn('[ActiveFilterChips] copy failed:', err);
      toast.error(t('toast.copyFailed'));
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-5">
      {chips.length > 0 && (
        <span className="text-xs text-gray-500">{t('product.filter.active')}:</span>
      )}
      {chips.map((chip) => (
        <FilterChip key={chip.key} label={chip.label} active onRemove={chip.onRemove} />
      ))}
      {chips.length > 0 && clearAll && (
        <button
          type="button"
          onClick={clearAll}
          className="text-xs text-primary hover:underline font-medium ml-1"
        >
          {t('product.filter.clearAll')}
        </button>
      )}
      {getShareUrl && (
        <button
          type="button"
          onClick={handleCopyLink}
          aria-label={t('common.copyLink')}
          className="ml-1 inline-flex items-center gap-1 text-xs text-slate-600 hover:text-primary font-medium px-2 py-1 rounded border border-gray-200 hover:border-primary transition-colors"
        >
          <FiLink2 size={12} />
          {t('common.copyLink')}
        </button>
      )}
    </div>
  );
};

export default ActiveFilterChips;