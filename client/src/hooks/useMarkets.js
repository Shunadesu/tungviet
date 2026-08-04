import { useEffect, useMemo, useState, useCallback } from 'react';
import publicApi from '../api/publicApi';

const PAGE_SIZE = 9;

const sortMarkets = (list, sort) => {
  const copy = [...list];
  if (sort === 'name_asc') {
    copy.sort((a, b) =>
      (a.name || '').localeCompare(b.name || '', undefined, {
        sensitivity: 'base',
      }),
    );
  } else if (sort === 'newest') {
    copy.sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime(),
    );
  }
  return copy;
};

const filterMarkets = (list, query) => {
  const q = (query || '').trim().toLowerCase();
  if (!q) return list;
  return list.filter((m) => {
    const fields = [m.name, m.nameEn];
    return fields.some((f) => String(f || '').toLowerCase().includes(q));
  });
};

const useMarkets = ({ lang, initialSearch = '', initialSort = '' } = {}) => {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    publicApi
      .getMarkets({ lang, limit: 100 })
      .then((res) => {
        if (cancelled) return;
        setAll(res?.data?.data || []);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('[useMarkets] error:', err);
        setError(err);
        setAll([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [lang]);

  const filtered = useMemo(
    () => sortMarkets(filterMarkets(all, search), sort),
    [all, search, sort],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  // Clamp page when filtered/total changes
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const updateSearch = useCallback((value) => {
    setSearch(value);
    setPage(1);
  }, []);

  const updateSort = useCallback((value) => {
    setSort(value);
    setPage(1);
  }, []);

  return {
    markets: paged,
    total: filtered.length,
    totalPages,
    page,
    pageSize: PAGE_SIZE,
    loading,
    error,
    search,
    sort,
    setSearch: updateSearch,
    setSort: updateSort,
    setPage,
  };
};

export default useMarkets;