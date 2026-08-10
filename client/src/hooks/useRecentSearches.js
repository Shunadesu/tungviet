import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'recentSearches';
const MAX_ITEMS = 6;

const readStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((it) => typeof it === 'string').slice(0, MAX_ITEMS) : [];
  } catch {
    return [];
  }
};

const writeStorage = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
  } catch {
    /* ignore */
  }
};

/**
 * Persist the user's recent search terms (most recent first, deduped, capped).
 */
export const useRecentSearches = () => {
  const [recents, setRecents] = useState(readStorage);

  // Keep multiple tabs in sync
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) setRecents(readStorage());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const addRecent = useCallback((term) => {
    const cleaned = (term || '').trim();
    if (!cleaned) return;
    setRecents((prev) => {
      const next = [cleaned, ...prev.filter((t) => t.toLowerCase() !== cleaned.toLowerCase())].slice(0, MAX_ITEMS);
      writeStorage(next);
      return next;
    });
  }, []);

  const removeRecent = useCallback((term) => {
    setRecents((prev) => {
      const next = prev.filter((t) => t !== term);
      writeStorage(next);
      return next;
    });
  }, []);

  const clearRecents = useCallback(() => {
    setRecents([]);
    writeStorage([]);
  }, []);

  return { recents, addRecent, removeRecent, clearRecents };
};

export default useRecentSearches;
