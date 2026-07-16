import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const STORAGE_KEY = 'quoteBag';

const QuoteBagContext = createContext(null);

const readStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((it) => it && it._id) : [];
  } catch {
    return [];
  }
};

const writeStorage = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
};

export const QuoteBagProvider = ({ children }) => {
  const [items, setItems] = useState(() => readStorage());

  useEffect(() => {
    writeStorage(items);
  }, [items]);

  const addToQuoteBag = useCallback((product) => {
    if (!product || !product._id) return;
    setItems((prev) => {
      if (prev.some((it) => it._id === product._id)) return prev;
      const minimal = {
        _id: product._id,
        name: product.name,
        imageUrl: product.imageUrl || null,
        softeningPoint: product.softeningPoint || null,
        acidValue: product.acidValue || null,
        color: product.color || null,
        tdsUrl: product.tdsUrl || null,
      };
      return [...prev, minimal];
    });
  }, []);

  const removeFromQuoteBag = useCallback((productId) => {
    setItems((prev) => prev.filter((it) => it._id !== productId));
  }, []);

  const clearQuoteBag = useCallback(() => {
    setItems([]);
  }, []);

  const isInBag = useCallback(
    (productId) => items.some((it) => it._id === productId),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      count: items.length,
      addToQuoteBag,
      removeFromQuoteBag,
      clearQuoteBag,
      isInBag,
    }),
    [items, addToQuoteBag, removeFromQuoteBag, clearQuoteBag, isInBag]
  );

  return <QuoteBagContext.Provider value={value}>{children}</QuoteBagContext.Provider>;
};

export const useQuoteBag = () => {
  const ctx = useContext(QuoteBagContext);
  if (!ctx) {
    throw new Error('useQuoteBag must be used within QuoteBagProvider');
  }
  return ctx;
};