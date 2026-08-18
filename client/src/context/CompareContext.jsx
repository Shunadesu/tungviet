import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const STORAGE_KEY = 'compare';
export const MAX_COMPARE = 4;

const CompareContext = createContext(null);

const readStorage = () => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((it) => it && it._id).slice(0, MAX_COMPARE) : [];
  } catch {
    return [];
  }
};

const writeStorage = (items) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
};

export const CompareProvider = ({ children, onMaxReached }) => {
  const [items, setItems] = useState(() => readStorage());

  useEffect(() => {
    writeStorage(items);
  }, [items]);

  const addToCompare = useCallback(
    (product) => {
      if (!product || !product._id) return { ok: false, reason: 'invalid' };
      let result = { ok: true };
      setItems((prev) => {
        if (prev.some((it) => it._id === product._id)) {
          result = { ok: false, reason: 'duplicate' };
          return prev;
        }
        if (prev.length >= MAX_COMPARE) {
          result = { ok: false, reason: 'max' };
          return prev;
        }
        const minimal = {
          _id: product._id,
          name: product.name,
          nameEn: product.nameEn,
          imageUrl: product.imageUrl || null,
          productCode: product.productCode || '',
          mainTree: product.mainTree || product.industries?.[0] || null,
          productLine: product.productLine || null,
          softeningPoint: product.softeningPoint || null,
          acidValue: product.acidValue || null,
          color: product.color || null,
          price: product.price || 0,
          priceVisible: product.priceVisible !== false,
          benefits: product.benefits || [],
          applications: product.applications || [],
          targetAudience: product.targetAudience || '',
          tdsUrl: product.tdsUrl || null,
        };
        return [...prev, minimal];
      });
      return result;
    },
    []
  );

  const removeFromCompare = useCallback((productId) => {
    setItems((prev) => prev.filter((it) => it._id !== productId));
  }, []);

  const clearCompare = useCallback(() => {
    setItems([]);
  }, []);

  const isInCompare = useCallback(
    (productId) => items.some((it) => it._id === productId),
    [items]
  );

  const toggleCompare = useCallback((product) => {
    if (!product || !product._id) return null;
    let added = null;
    setItems((prev) => {
      if (prev.some((it) => it._id === product._id)) {
        added = false;
        return prev.filter((it) => it._id !== product._id);
      }
      if (prev.length >= MAX_COMPARE) {
        added = 'max';
        return prev;
      }
      added = true;
      return [
        ...prev,
        {
          _id: product._id,
          name: product.name,
          nameEn: product.nameEn,
          imageUrl: product.imageUrl || null,
          productCode: product.productCode || '',
          softeningPoint: product.softeningPoint || null,
          acidValue: product.acidValue || null,
          color: product.color || null,
          benefits: product.benefits || [],
          applications: product.applications || [],
        },
      ];
    });
    return added;
  }, []);

  const value = useMemo(
    () => ({
      items,
      count: items.length,
      maxItems: MAX_COMPARE,
      addToCompare,
      removeFromCompare,
      clearCompare,
      isInCompare,
      toggleCompare,
    }),
    [items, addToCompare, removeFromCompare, clearCompare, isInCompare, toggleCompare]
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
};

export const useCompare = () => {
  const ctx = useContext(CompareContext);
  if (!ctx) {
    throw new Error('useCompare must be used within CompareProvider');
  }
  return ctx;
};
