import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Parse a CSV URL parameter into an array of trimmed non-empty strings.
 * Returns [] for empty/missing values.
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
 * Hook quản lý filter state, đồng bộ với URL search params.
 * Trả về các giá trị filter hiện tại + hàm cập nhật.
 *
 * Multiple-value params (`industries`, `market`) are stored as comma-separated
 * strings so the URL stays readable and shareable.
 */
const useProductFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const values = useMemo(
    () => ({
      search: searchParams.get('q') || searchParams.get('search') || '',
      sort: searchParams.get('sort') || '',
      industries: parseCsv(searchParams.get('industries')),
      category: searchParams.get('category') || searchParams.get('productLine') || '',
      market: parseCsv(searchParams.get('market')),
      softeningPoint: searchParams.get('softeningPoint') || '',
      page: searchParams.get('page') || '',
    }),
    [searchParams]
  );

  const setParam = useCallback(
    (key, value) => {
      const next = new URLSearchParams(searchParams);

      // Reset productLine when the industries list changes (still a sensible
      // UX — if you swap industries, the previous productLine may not apply)
      if (key === 'industries') {
        const newList = Array.isArray(value) ? value : parseCsv(value);
        const oldCsv = toCsv(values.industries);
        const newCsv = toCsv(newList);
        if (oldCsv !== newCsv) {
          next.delete('category');
        }
      }

      if (value === '' || value == null) {
        next.delete(key);
      } else if (Array.isArray(value)) {
        const csv = toCsv(value);
        if (csv) next.set(key, csv);
        else next.delete(key);
      } else {
        next.set(key, value);
      }
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams, values.industries]
  );

  const setMultiParam = useCallback(
    (updates) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([k, v]) => {
        if (v === '' || v == null) {
          next.delete(k);
        } else if (Array.isArray(v)) {
          const csv = toCsv(v);
          if (csv) next.set(k, csv);
          else next.delete(k);
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
   * Strips the `page` param so the recipient always lands on page 1.
   */
  const getShareUrl = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.delete('page');
    const qs = params.toString();
    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    return `${window.location.origin}${path}${qs ? `?${qs}` : ''}`;
  }, [searchParams]);

  const activeCount = useMemo(() => {
    let count = 0;
    if (values.industries.length > 0) count += 1;
    if (values.category) count += 1;
    if (values.market.length > 0) count += 1;
    if (values.softeningPoint) count += 1;
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

export default useProductFilters;