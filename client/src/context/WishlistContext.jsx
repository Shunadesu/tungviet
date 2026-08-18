import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const STORAGE_KEY = 'wishlist';

const WishlistContext = createContext(null);

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

export const WishlistProvider = ({ children }) => {
  const [items, setItems] = useState(() => readStorage());

  useEffect(() => {
    writeStorage(items);
  }, [items]);

  const addToWishlist = useCallback((product) => {
    if (!product || !product._id) return;
    setItems((prev) => {
      if (prev.some((it) => it._id === product._id)) return prev;
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
        tdsUrl: product.tdsUrl || null,
      };
      return [...prev, minimal];
    });
  }, []);

  const removeFromWishlist = useCallback((productId) => {
    setItems((prev) => prev.filter((it) => it._id !== productId));
  }, []);

  const clearWishlist = useCallback(() => {
    setItems([]);
  }, []);

  const isInWishlist = useCallback(
    (productId) => items.some((it) => it._id === productId),
    [items]
  );

  const toggleWishlist = useCallback(
    (product) => {
      if (!product || !product._id) return null;
      setItems((prev) => {
        if (prev.some((it) => it._id === product._id)) {
          return prev.filter((it) => it._id !== product._id);
        }
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
            tdsUrl: product.tdsUrl || null,
          },
        ];
      });
      return !items.some((it) => it._id === product._id);
    },
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      count: items.length,
      addToWishlist,
      removeFromWishlist,
      clearWishlist,
      isInWishlist,
      toggleWishlist,
    }),
    [items, addToWishlist, removeFromWishlist, clearWishlist, isInWishlist, toggleWishlist]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return ctx;
};
