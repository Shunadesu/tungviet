import NodeCache from 'node-cache';

const cache = new NodeCache({
  stdTTL: 60,
  checkperiod: 120,
});

export const cacheKeys = {
  publicCategories: (params) => `public:categories:${JSON.stringify(params || {})}`,
  publicProducts: (query) => `public:products:${JSON.stringify(query || {})}`,
  publicProductsBulk: (ids = [], locale = 'vi') =>
    `public:products:bulk:${locale}:${[...ids].sort().join(',')}`,
  publicProductsFeatured: (limit, locale) =>
    `public:products:featured:${locale}:${limit}`,
  publicProductsPopular: (limit, locale) =>
    `public:products:popular:${locale}:${limit}`,
  publicProductsNew: (limit, locale) =>
    `public:products:new:${locale}:${limit}`,
  publicProductsRelated: (id, limit, locale) =>
    `public:products:related:${locale}:${id}:${limit}`,
  publicMarkets: (query) => `public:markets:${JSON.stringify(query || {})}`,
  publicMarketsFeatured: (limit, locale) =>
    `public:markets:featured:${locale}:${limit}`,
  publicMarketsGrouped: (locale) => `public:markets:grouped:${locale}`,
  publicMainTrees: (locale) => `public:main-trees:${locale}`,
  publicMainTreesWithCount: (locale) => `public:main-trees:count:${locale}`,
  publicPosts: (params) => `public:posts:${JSON.stringify(params || {})}`,
  publicPartners: (params) => `public:partners:${JSON.stringify(params || {})}`,
  publicMembers: (locale) => `public:members:${locale}`,
  publicLocations: (locale) => `public:locations:${locale}`,
  publicQuoteSection: (locale) => `public:quote-section:${locale}`,
  publicHome: (locale) => `public:home:${locale}`,
  publicStats: () => `public:stats:singleton`,
  publicSiteConfig: () => 'public:site-config:singleton',
  publicSearch: (q, locale) => `public:search:${locale}:${q}`,
  publicProductColumns: (locale = 'vi') => `public:product-columns:${locale}`,
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
  keys() {
    return cache.keys();
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
  PUBLIC_PRODUCTS_PRECOMPUTED: 120,
  PUBLIC_MARKETS: 120,
  PUBLIC_MARKETS_GROUPED: 300,
  PUBLIC_MAIN_TREES: 300,
  PUBLIC_POSTS: 120,
  PUBLIC_PARTNERS: 300,
  PUBLIC_MEMBERS: 300,
  PUBLIC_LOCATIONS: 300,
  PUBLIC_QUOTE_SECTION: 300,
  PUBLIC_HOME: 60,
  PUBLIC_STATS: 300,
  PUBLIC_SEARCH: 120,
  PUBLIC_PRODUCT_COLUMNS: 300,
};

export const invalidatePublicCache = () => {
  cacheStore.delByPrefix('public:');
};

export const invalidateProductsCache = () => {
  cacheStore.delByPrefix('public:products:');
};

export const invalidateHomeCache = () => {
  cacheStore.delByPrefix('public:home:');
};

export const invalidateProductColumnsCache = () => {
  cacheStore.delByPrefix('public:product-columns:');
};