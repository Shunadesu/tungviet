import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiX } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import ProductLineCard from '../components/ProductLineCard';
import PageHero from '../components/PageHero';
import ProductFilterTopBar from '../components/ProductFilterTopBar';
import ActiveFilterChips from '../components/ActiveFilterChips';
import EmptyState from '../components/EmptyState';
import LoadMore from '../components/LoadMore';
import SEO from '../components/SEO';
import publicApi from '../api/publicApi';
import useProductFilters from '../hooks/useProductFilters';
import useDebounce from '../hooks/useDebounce';
import { getLocalizedField } from '../utils/i18nField';
import { filterBySofteningRange, SOFTENING_RANGES } from '../utils/softeningPoint';
import { SUPPORTED_LOCALES } from '../i18n';

/**
 * Số SKU tải về tối đa trong 1 lần gọi API. Khi catalog vượt ngưỡng này,
 * cần bổ sung endpoint `/public/product-lines` phía server (xem docs/PRODUCTS_PAGE_PLAN.md).
 */
const MAX_SKU_FETCH = 500;

const PAGE_SIZE = 12;

const ProductList = () => {
  const { t, i18n } = useTranslation();
  const lang = SUPPORTED_LOCALES.includes(i18n.language) ? i18n.language : 'vi';

  const { values, setParam, clearAll, activeCount, getShareUrl } = useProductFilters();

  const [productLines, setProductLines] = useState([]);
  const [skus, setSkus] = useState([]);
  const [totalSkus, setTotalSkus] = useState(0);
  const [mainTrees, setMainTrees] = useState([]);
  const [marketTrees, setMarketTrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const search = values.search;
  const sort = values.sort;

  // Local input state for debounced search
  const [searchInput, setSearchInput] = useState(search || '');
  const debouncedSearch = useDebounce(searchInput, 400);

  // Sync URL ?q=... → local input (e.g. when arriving from header search)
  useEffect(() => {
    setSearchInput(search || '');
  }, [search]);

  // Push debounced value → URL
  useEffect(() => {
    if (debouncedSearch !== search) {
      setParam('q', debouncedSearch);
    }
  }, [debouncedSearch]);

  // Fetch mainTrees + marketTrees cho bộ lọc và nhãn chip
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      publicApi.getMainTrees(lang).catch(() => null),
      publicApi.getMarketTrees({ lang }).catch(() => null),
    ]).then(([mtRes, mktRes]) => {
      if (cancelled) return;
      if (mtRes?.data?.data) setMainTrees(Array.isArray(mtRes.data.data) ? mtRes.data.data : []);
      if (mktRes?.data?.data) {
        const flat = Array.isArray(mktRes.data.data) ? mktRes.data.data : [];
        const tops = flat.filter((m) => !m.parent);
        setMarketTrees(tops.length ? tops : flat);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [lang]);

  /**
   * Fetch toàn bộ product line (danh mục sản phẩm) và toàn bộ SKU.
   *
   * Trang này hiển thị "sản phẩm chính" = product line, nên phải gom SKU về
   * nhóm để đếm. Vì vậy ta tải tất cả SKU (giới hạn MAX_SKU_FETCH) thay vì
   * phân trang ở mức SKU.
   */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([
      publicApi.getCategories({ lang }).catch(() => null),
      publicApi.getProducts({ lang, page: 1, limit: MAX_SKU_FETCH }).catch(() => null),
    ]).then(([plRes, skuRes]) => {
      if (cancelled) return;

      if (plRes?.data?.data) {
        const raw = plRes.data.data;
        setProductLines(Array.isArray(raw) ? raw : raw?.items || []);
      }

      if (skuRes?.data?.data) {
        const raw = skuRes.data.data;
        const items = Array.isArray(raw) ? raw : raw?.items || [];
        setSkus(items);
        const pg = skuRes.data?.pagination || skuRes.data?.data?.pagination;
        setTotalSkus(pg?.total ?? items.length);
      }
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [lang]);

  /**
   * Gom SKU theo product line, đồng thời áp dụng các bộ lọc ở mức SKU.
   *
   * - Ngành hàng / Thị trường: lọc ở server (đã hỗ trợ sẵn)? Không — ta tải
   *   toàn bộ SKU rồi lọc tại client để số đếm "sản phẩm chính" luôn khớp với
   *   bộ lọc đang chọn.
   * - Điểm làm mềm: so khớp theo khoảng số (server so khớp chuỗi chính xác).
   * - Tìm kiếm: khớp theo tên product line, tên SKU hoặc mã SKU.
   */
  const groups = useMemo(() => {
    const selectedIndustries = values.industries || [];
    const selectedMarkets = values.market || [];
    const q = search.trim().toLowerCase();

    // 1. Lọc SKU theo điểm làm mềm + thị trường + ngành hàng
    //    (Từ khoá KHÔNG lọc ở bước này — xem bước 5.)
    const filteredSkus = filterBySofteningRange(skus, values.softeningPoint).filter((sku) => {
      // Ngành hàng
      if (selectedIndustries.length > 0) {
        const skuIndustries = (sku.industries || []).map((i) =>
          String(typeof i === 'object' ? i._id : i)
        );
        if (!selectedIndustries.some((id) => skuIndustries.includes(String(id)))) {
          return false;
        }
      }

      // Thị trường
      if (selectedMarkets.length > 0) {
        const skuMarkets = (sku.marketIds || []).map((m) =>
          String(typeof m === 'object' ? m._id : m)
        );
        if (!selectedMarkets.some((id) => skuMarkets.includes(String(id)))) {
          return false;
        }
      }

      // Từ khoá
      if (q) {
        const skuName = `${sku.name || ''} ${sku.nameEn || ''}`.toLowerCase();
        const skuCode = (sku.productCode || '').toLowerCase();
        const lineNames = (Array.isArray(sku.productLines) ? sku.productLines : [])
          .map((l) => `${l?.name || ''} ${l?.nameEn || ''}`.toLowerCase())
          .join(' ');
        if (!skuName.includes(q) && !skuCode.includes(q) && !lineNames.includes(q)) {
          return false;
        }
      }

      return true;
    });

    // 2. Gom SKU theo product line
    const byLine = new Map();
    filteredSkus.forEach((sku) => {
      const lines = Array.isArray(sku.productLines) ? sku.productLines : [];
      lines.forEach((line) => {
        const lineId = String(typeof line === 'object' ? line._id : line);
        if (!lineId) return;
        if (!byLine.has(lineId)) byLine.set(lineId, []);
        byLine.get(lineId).push(sku);
      });
    });

    // 3. Ghép với thông tin product line đầy đủ (ảnh, mô tả, tên)
    let result = productLines
      .map((line) => {
        const lineSkus = byLine.get(String(line._id)) || [];
        const lineName = `${line.name || ''} ${line.nameEn || ''}`.toLowerCase();
        const nameMatched = q ? lineName.includes(q) : false;

        // Với từ khoá: SKU được tính vào nhóm khi tên/mã SKU khớp, HOẶC khi
        // tên product line khớp (lúc đó lấy toàn bộ SKU của nhóm).
        const countedSkus = q
          ? nameMatched
            ? lineSkus
            : lineSkus.filter(
                (s) =>
                  `${s.name || ''} ${s.nameEn || ''}`.toLowerCase().includes(q) ||
                  `${s.productCode || ''}`.toLowerCase().includes(q)
              )
          : lineSkus;

        return {
          line,
          skus: countedSkus,
          skuCount: countedSkus.length,
          // SKU mới nhất / nhiều view nhất — dùng cho sắp xếp
          newestAt: countedSkus.reduce(
            (max, s) => Math.max(max, new Date(s.createdAt || 0).getTime()),
            0
          ),
          maxViews: countedSkus.reduce((max, s) => Math.max(max, s.viewCount || 0), 0),
        };
      })
      // Chỉ giữ product line có ít nhất 1 SKU khớp bộ lọc
      .filter((g) => g.skuCount > 0);

    // 4. Lọc theo product line cụ thể (deep-link ?category=)
    if (values.category) {
      result = result.filter((g) => String(g.line._id) === String(values.category));
    }

    // 5. Sắp xếp
    const nameOf = (g) =>
      getLocalizedField(g.line, lang, 'name', 'nameEn') || '';
    switch (sort) {
      case 'name_asc':
        result.sort((a, b) => nameOf(a).localeCompare(nameOf(b)));
        break;
      case 'name_desc':
        result.sort((a, b) => nameOf(b).localeCompare(nameOf(a)));
        break;
      case 'newest':
        result.sort((a, b) => b.newestAt - a.newestAt);
        break;
      case 'popularity':
        result.sort((a, b) => b.maxViews - a.maxViews);
        break;
      default:
        result.sort((a, b) => {
          const orderDiff = (a.line.order || 0) - (b.line.order || 0);
          if (orderDiff !== 0) return orderDiff;
          return nameOf(a).localeCompare(nameOf(b));
        });
    }

    return result;
  }, [
    productLines,
    skus,
    values.industries,
    values.market,
    values.softeningPoint,
    values.category,
    search,
    sort,
    lang,
  ]);

  // Reset số lượng hiển thị khi danh sách thay đổi
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [groups.length, search, sort, values.industries, values.market, values.softeningPoint]);

  const visibleGroups = groups.slice(0, visibleCount);
  const hasMore = visibleCount < groups.length;

  const loadMore = () => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
    setTimeout(() => {
      window.scrollBy({ top: 200, behavior: 'smooth' });
    }, 80);
  };

  const clearSearch = () => {
    setSearchInput('');
    setParam('q', '');
  };

  const breadcrumb = useMemo(
    () => [
      { label: t('product.breadcrumbHome'), to: `/${lang}` },
      { label: t('nav.products') },
    ],
    [lang, t]
  );

  const heroTitle = search
    ? t('product.searchResultsFor', { q: search })
    : t('nav.products');
  const heroSubtitle = search
    ? t('product.searchResultsSubtitle')
    : t('product.productsSubtitle');

  // Cảnh báo khi catalog vượt giới hạn tải
  const truncated = totalSkus > skus.length && skus.length >= MAX_SKU_FETCH;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white min-h-screen"
    >
      <SEO
        title={heroTitle}
        description={t('seo.defaultDescription')}
        keywords={t('seo.defaultKeywords')}
        url={`/${lang}/products`}
        breadcrumb={breadcrumb}
      />

      <PageHero breadcrumb={breadcrumb} title={heroTitle} subtitle={heroSubtitle}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
          role="search"
          className="relative max-w-2xl w-full"
        >
          <FiSearch
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('common.search')}
            aria-label={t('common.search')}
            className="w-full pl-11 pr-12 py-3.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-card"
          />
          {searchInput && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label={t('common.clearSearch')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <FiX size={16} />
            </button>
          )}
        </form>
      </PageHero>

      <section className="container-page py-6 md:py-8">
        {/* Thanh bộ lọc ngang */}
        <ProductFilterTopBar
          values={values}
          setParam={setParam}
          mainTrees={mainTrees}
          marketTrees={marketTrees}
          sort={sort}
          onSortChange={(v) => setParam('sort', v)}
          activeCount={activeCount}
          resultCount={groups.length}
        />

        {/* Active filter chips */}
        <ActiveFilterChips
          values={values}
          setParam={setParam}
          clearAll={clearAll}
          getShareUrl={getShareUrl}
          mainTrees={mainTrees}
          categories={productLines}
          marketTrees={marketTrees}
          softeningPointRanges={SOFTENING_RANGES}
        />

        {truncated && (
          <p className="mb-5 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            {t('product.truncatedNotice', { shown: skus.length, total: totalSkus })}
          </p>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] skeleton rounded-xl" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <EmptyState
            icon={FiSearch}
            title={t('product.noResults')}
            description={search ? t('product.searchResultsSubtitle') : t('product.noResultsHint')}
            action={
              <button type="button" onClick={clearAll} className="btn-secondary">
                {t('product.filter.clearAll')}
              </button>
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {visibleGroups.map((group, index) => (
                <ProductLineCard
                  key={group.line._id}
                  productLine={group.line}
                  skuCount={group.skuCount}
                  index={index}
                  lang={lang}
                />
              ))}
            </div>
            <LoadMore
              hasMore={hasMore}
              loading={false}
              onLoad={loadMore}
              total={groups.length}
              shown={visibleGroups.length}
              label={t('product.loadMore')}
            />
          </>
        )}
      </section>
    </motion.div>
  );
};

export default ProductList;
