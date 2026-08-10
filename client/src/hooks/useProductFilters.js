import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Hook quản lý filter state, đồng bộ với URL search params.
 * Trả về các giá trị filter hiện tại + hàm cập nhật.
 */
const useProductFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const values = useMemo(
    () => ({
      search: searchParams.get('q') || searchParams.get('search') || '',
      sort: searchParams.get('sort') || '',
      mainTree: searchParams.get('mainTree') || '',
      category: searchParams.get('category') || searchParams.get('productLine') || '',
      softeningPoint: searchParams.get('softeningPoint') || '',
      page: searchParams.get('page') || '',
    }),
    [searchParams]
  );

  const setParam = useCallback(
    (key, value) => {
      const next = new URLSearchParams(searchParams);
      // Reset category when mainTree changes
      if (key === 'mainTree' && value !== values.mainTree) {
        next.delete('category');
      }
      if (value === '' || value == null) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams, values.mainTree]
  );

  const setMultiParam = useCallback(
    (updates) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([k, v]) => {
        if (v === '' || v == null) next.delete(k);
        else next.set(k, v);
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
    return ['mainTree', 'category', 'softeningPoint'].filter(
      (k) => searchParams.get(k)
    ).length;
  }, [searchParams]);

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
