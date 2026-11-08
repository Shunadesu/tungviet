import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Parse a CSV URL parameter into an array of trimmed non-empty strings.
 */
const parseCsv = (raw) => {
  if (!raw) return [];
  return String(raw)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
};

/**
 * Serialize an array of values back to a CSV string. Returns null when empty
 * so we can delete the param from the URL entirely.
 */
const toCsv = (arr) => {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  const cleaned = arr.map((v) => String(v).trim()).filter(Boolean);
  return cleaned.length ? cleaned.join(',') : null;
};

/**
 * Hook quản lý bộ lọc của trang Thị trường, đồng bộ với URL search params.
 *
 * Khác với `useProductFilters` (dùng cho trang sản phẩm), hook này chỉ
 * phục vụ danh sách thị trường nên có bộ tham số riêng:
 *   - `q`           : từ khóa tìm kiếm (tên + mô tả)
 *   - `industries`  : CSV, multi-select MainTree (_id)
 *   - `featured`    : '1' = chỉ thị trường nổi bật
 *   - `hasProducts` : '1' = chỉ thị trường có ít nhất 1 sản phẩm
 *   - `sort`        : default | name_asc | name_desc | newest | most_products
 */
const useMarketFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const values = useMemo(
    () => ({
      search: searchParams.get('q') || searchParams.get('search') || '',
      industries: parseCsv(searchParams.get('industries')),
      featured: searchParams.get('featured') === '1',
      hasProducts: searchParams.get('hasProducts') === '1',
      sort: searchParams.get('sort') || '',
    }),
    [searchParams]
  );

  const setParam = useCallback(
    (key, value) => {
      const next = new URLSearchParams(searchParams);

      if (value === '' || value == null || value === false) {
        next.delete(key);
      } else if (Array.isArray(value)) {
        const csv = toCsv(value);
        if (csv) next.set(key, csv);
        else next.delete(key);
      } else if (value === true) {
        next.set(key, '1');
      } else {
        next.set(key, value);
      }

      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const setMultiParam = useCallback(
    (updates) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([k, v]) => {
        if (v === '' || v == null || v === false) {
          next.delete(k);
        } else if (Array.isArray(v)) {
          const csv = toCsv(v);
          if (csv) next.set(k, csv);
          else next.delete(k);
        } else if (v === true) {
          next.set(k, '1');
        } else {
          next.set(k, v);
        }
      });
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const clearAll = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  /**
   * Build a shareable URL from the current filter state.
   */
  const getShareUrl = useCallback(() => {
    const qs = searchParams.toString();
    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    return `${window.location.origin}${path}${qs ? `?${qs}` : ''}`;
  }, [searchParams]);

  const activeCount = useMemo(() => {
    let count = 0;
    if (values.industries.length > 0) count += 1;
    if (values.featured) count += 1;
    if (values.hasProducts) count += 1;
    return count;
  }, [values]);

  return {
    values,
    setParam,
    setMultiParam,
    clearAll,
    activeCount,
    getShareUrl,
  };
};

export default useMarketFilters;
