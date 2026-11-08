import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';
import publicApi from '../api/publicApi';
import { getLocalizedField } from '../utils/i18nField';
import { SUPPORTED_LOCALES } from '../i18n';
import PageHero from '../components/PageHero';
import MarketCard from '../components/MarketCard';
import MarketFilterTopBar from '../components/MarketFilterTopBar';
import ActiveFilterChips from '../components/ActiveFilterChips';
import EmptyState from '../components/EmptyState';
import LoadMore from '../components/LoadMore';
import Skeleton from '../components/Skeleton';
import SEO from '../components/SEO';
import { htmlToText } from '../utils/html';
import { buildItemListJsonLd } from '../utils/jsonLd';
import useMarketFilters from '../hooks/useMarketFilters';
import useDebounce from '../hooks/useDebounce';

/**
 * Số thị trường hiển thị mỗi lần bấm "Xem thêm".
 */
const PAGE_SIZE = 9;

const Markets = () => {
  const { t, i18n } = useTranslation();
  const { lang: urlLang } = useParams();
  const lang = SUPPORTED_LOCALES.includes(urlLang) ? urlLang : 'vi';
  const isEN = i18n.language === 'en';

  const { values, setParam, clearAll, activeCount, getShareUrl } = useMarketFilters();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const search = values.search;
  const sort = values.sort;

  // Ô tìm kiếm: state cục bộ + debounce để không ghi URL mỗi ký tự.
  const [searchInput, setSearchInput] = useState(search || '');
  const debouncedSearch = useDebounce(searchInput, 400);

  useEffect(() => {
    setSearchInput(search || '');
  }, [search]);

  useEffect(() => {
    if (debouncedSearch !== search) {
      setParam('q', debouncedSearch);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    publicApi
      .getMarketTrees({ lang })
      .then((res) => {
        if (cancelled) return;
        setItems(Array.isArray(res.data?.data) ? res.data.data : []);
      })
      .catch((err) => console.warn('[Markets] fetch failed:', err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [lang]);

  /**
   * Danh sách ngành hàng (MainTree) dùng cho bộ lọc — gom từ `market.industry[]`
   * vì API đã populate sẵn, không cần gọi thêm endpoint.
   */
  const industryOptions = useMemo(() => {
    const map = new Map();
    items.forEach((m) => {
      const list = Array.isArray(m.industry) ? m.industry : m.industry ? [m.industry] : [];
      list.filter(Boolean).forEach((ind) => {
        const id = String(ind._id || ind);
        if (!id || map.has(id)) return;
        map.set(id, { _id: id, name: ind.name || '', nameEn: ind.nameEn || '' });
      });
    });
    return Array.from(map.values()).sort((a, b) =>
      (a.name || a.nameEn || '').localeCompare(b.name || b.nameEn || '')
    );
  }, [items]);

  const filtered = useMemo(() => {
    const q = (search || '').trim().toLowerCase();
    const selectedIndustries = (values.industries || []).map(String);

    let result = items.filter((m) => {
      // Từ khóa: tên + mô tả
      if (q) {
        const title = getLocalizedField(m, lang, 'title', 'titleEn') || '';
        const desc = getLocalizedField(m, lang, 'description', 'descriptionEn') || '';
        if (!title.toLowerCase().includes(q) && !desc.toLowerCase().includes(q)) {
          return false;
        }
      }

      // Ngành hàng
      if (selectedIndustries.length > 0) {
        const ids = (Array.isArray(m.industry) ? m.industry : m.industry ? [m.industry] : [])
          .filter(Boolean)
          .map((ind) => String(ind._id || ind));
        if (!selectedIndustries.some((id) => ids.includes(id))) return false;
      }

      // Chỉ thị trường nổi bật
      if (values.featured && m.isFeatured !== true) return false;

      // Chỉ thị trường có sản phẩm
      if (values.hasProducts && !(Number(m.productCount) > 0)) return false;

      return true;
    });

    const nameOf = (m) => getLocalizedField(m, lang, 'title', 'titleEn') || '';
    switch (sort) {
      case 'name_asc':
        result.sort((a, b) => nameOf(a).localeCompare(nameOf(b)));
        break;
      case 'name_desc':
        result.sort((a, b) => nameOf(b).localeCompare(nameOf(a)));
        break;
      case 'newest':
        result.sort((a, b) => {
          const at = new Date(a.createdAt || 0).getTime();
          const bt = new Date(b.createdAt || 0).getTime();
          if (bt !== at) return bt - at;
          return nameOf(a).localeCompare(nameOf(b));
        });
        break;
      case 'most_products':
        result.sort((a, b) => (Number(b.productCount) || 0) - (Number(a.productCount) || 0));
        break;
      default:
        result.sort((a, b) => {
          const featuredDiff = (b.isFeatured === true ? 1 : 0) - (a.isFeatured === true ? 1 : 0);
          if (featuredDiff !== 0) return featuredDiff;
          const orderDiff = (a.order || 0) - (b.order || 0);
          if (orderDiff !== 0) return orderDiff;
          return nameOf(a).localeCompare(nameOf(b));
        });
    }

    return result;
  }, [items, search, sort, lang, values.industries, values.featured, values.hasProducts]);

  // Reset số lượng hiển thị khi danh sách thay đổi
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filtered.length, search, sort, values.industries, values.featured, values.hasProducts]);

  const visibleMarkets = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const loadMore = () => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
    setTimeout(() => {
      window.scrollBy({ top: 200, behavior: 'smooth' });
    }, 80);
  };

  const itemListJsonLd = useMemo(
    () => buildItemListJsonLd(filtered, { lang }),
    [filtered, lang]
  );

  const breadcrumb = useMemo(
    () => [
      { label: t('market.breadcrumbHome'), to: `/${lang}` },
      { label: t('market.breadcrumbMarkets') },
    ],
    [lang, t]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white min-h-screen"
    >
      <SEO
        title={t('market.title')}
        description={t('market.subtitle') || htmlToText(t('market.title'))}
        keywords={
          isEN
            ? 'markets, applications, rosin, resin, Tungviet'
            : 'thị trường, ứng dụng, rosin, nhựa, Tungviet'
        }
        url={`/${lang}/markets`}
        type="website"
        breadcrumb={breadcrumb}
        jsonLd={itemListJsonLd}
      />

      <PageHero
        title={t('market.title')}
        subtitle={t('market.subtitle')}
        breadcrumb={breadcrumb}
      />

      <section className="container-page py-6 md:py-8">
        {/* Thanh bộ lọc ngang */}
        <MarketFilterTopBar
          values={values}
          setParam={setParam}
          industries={industryOptions}
          sort={sort}
          onSortChange={(v) => setParam('sort', v)}
          activeCount={activeCount}
          resultCount={filtered.length}
          searchInput={searchInput}
          onSearchInputChange={setSearchInput}
          onSearchSubmit={() => setParam('q', searchInput)}
        />

        {/* Active filter chips */}
        <ActiveFilterChips
          mode="market"
          values={values}
          setParam={setParam}
          clearAll={clearAll}
          getShareUrl={getShareUrl}
          mainTrees={industryOptions}
        />

        {loading ? (
          <Skeleton.Markets />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={FiSearch}
            title={t('market.noResults')}
            description={t('market.noResultsHint')}
            action={
              <button type="button" onClick={clearAll} className="btn-secondary">
                {t('market.filter.clearAll')}
              </button>
            }
          />
        ) : (
          <>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-4">
              {t('market.allMarkets')}
              <span className="ml-2 text-sm font-medium text-slate-500">
                ({filtered.length})
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {visibleMarkets.map((m, index) => (
                <MarketCard key={m._id} market={m} index={index} lang={lang} />
              ))}
            </div>
            <LoadMore
              hasMore={hasMore}
              loading={false}
              onLoad={loadMore}
              total={filtered.length}
              shown={visibleMarkets.length}
              label={t('market.loadMore')}
            />
          </>
        )}
      </section>
    </motion.div>
  );
};

export default Markets;
