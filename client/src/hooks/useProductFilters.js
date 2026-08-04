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
      market: searchParams.get('market') || '',
      category: searchParams.get('category') || '',
      softeningPoint: searchParams.get('softeningPoint') || '',
    }),
    [searchParams]
  );

  const setParam = useCallback(
    (key, value) => {
      const next = new URLSearchParams(searchParams);
      if (value === '' || value == null) {
        next.delete(key);
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

  const activeCount = useMemo(() => {
    return ['market', 'category', 'softeningPoint'].filter(
      (k) => searchParams.get(k)
    ).length;
  }, [searchParams]);

  return {
    values,
    setParam,
    setMultiParam,
    clearAll,
    activeCount,
  };
};

export default useProductFilters;