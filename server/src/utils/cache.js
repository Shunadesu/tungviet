import NodeCache from 'node-cache';

const cache = new NodeCache({
  stdTTL: 60,
  checkperiod: 120,
});

export const cacheKeys = {
  publicCategories: (params) => `public:categories:${JSON.stringify(params || {})}`,
  publicProducts: (query) => `public:products:${JSON.stringify(query || {})}`,
  publicSiteConfig: () => 'public:site-config:singleton',
  publicMarkets: (query) => `public:markets:${JSON.stringify(query || {})}`,
};

export const cacheStore = {
  get(key) {
    return cache.get(key);
  },
  set(key, value, ttlSeconds) {
    return cache.set(key, value, ttlSeconds);
  },
  del(key) {
    return cache.del(key);
  },
  delByPrefix(prefix) {
    const keys = cache.keys().filter((k) => k.startsWith(prefix));
    if (keys.length) cache.del(keys);
    return keys.length;
  },
};

export const TTL = {
  PUBLIC_CATEGORIES: 300,
  PUBLIC_PRODUCTS: 60,
  PUBLIC_MARKETS: 120,
};

export const invalidatePublicCache = () => {
  cacheStore.delByPrefix('public:');
};