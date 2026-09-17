import axiosClient from './axiosClient';

const resolveLang = (lang) => {
  if (lang) return lang;
  try {
    const stored = localStorage.getItem('locale');
    if (stored === 'vi' || stored === 'en') return stored;
  } catch (_) {}
  const path = window.location?.pathname || '';
  const seg = path.split('/').filter(Boolean)[0];
  if (seg === 'vi' || seg === 'en') return seg;
  return undefined;
};

export const publicApi = {
  // Home aggregation
  getHome: (lang) => axiosClient.get('/public/home', { params: { lang: resolveLang(lang) } }),

  // Stats
  getStats: () => axiosClient.get('/public/stats'),

  // Unified search
  search: (params) => {
    const { lang, ...rest } = params || {};
    return axiosClient.get('/public/search', { params: { lang: resolveLang(lang), ...rest } });
  },

  // Products
  getProducts: (params) => {
    const { lang, ...rest } = params || {};
    return axiosClient.get('/public/products', { params: { lang: resolveLang(lang), ...rest } });
  },
  getProduct: (id, lang) => axiosClient.get(`/public/products/${id}`, { params: { lang: resolveLang(lang) } }),
  incrementView: (id) => axiosClient.post(`/public/products/${id}/view`),
  getProductColumns: (lang) => axiosClient.get('/public/product-columns', { params: { lang: resolveLang(lang) } }),
  getFeaturedProducts: (params) => {
    const { lang, ...rest } = params || {};
    return axiosClient.get('/public/products/featured', { params: { lang: resolveLang(lang), ...rest } });
  },
  getPopularProducts: (params) => {
    const { lang, ...rest } = params || {};
    return axiosClient.get('/public/products/popular', { params: { lang: resolveLang(lang), ...rest } });
  },
  getNewProducts: (params) => {
    const { lang, ...rest } = params || {};
    return axiosClient.get('/public/products/new', { params: { lang: resolveLang(lang), ...rest } });
  },
  getRelatedProducts: (id, params) => {
    const { lang, ...rest } = params || {};
    return axiosClient.get(`/public/products/related/${id}`, { params: { lang: resolveLang(lang), ...rest } });
  },
  getProductsBulk: (ids, lang) =>
    axiosClient.get('/public/products/bulk', {
      params: { lang: resolveLang(lang), ids: Array.isArray(ids) ? ids.join(',') : ids },
    }),

  // Categories / Industries / Markets
  getCategories: (params) => {
    const { lang, ...rest } = params || {};
    return axiosClient.get('/public/categories', { params: { lang: resolveLang(lang), ...rest } });
  },
  getCategory: (id, lang) => axiosClient.get(`/public/categories/${id}`, { params: { lang: resolveLang(lang) } }),
  getMainTrees: (lang) => axiosClient.get('/public/main-trees', { params: { lang: resolveLang(lang) } }),
  getMainTree: (id, lang) => axiosClient.get(`/public/main-trees/${id}`, { params: { lang: resolveLang(lang) } }),
  getMarketTrees: (params) => {
    const { lang, ...rest } = params || {};
    return axiosClient.get('/public/market-trees', { params: { lang: resolveLang(lang), ...rest } });
  },
  getMarketTree: (id, lang) => axiosClient.get(`/public/market-trees/${id}`, { params: { lang: resolveLang(lang) } }),
  getFeaturedMarkets: (params) => {
    const { lang, ...rest } = params || {};
    return axiosClient.get('/public/markets/featured', { params: { lang: resolveLang(lang), ...rest } });
  },
  getMarketsGrouped: (lang) =>
    axiosClient.get('/public/markets/grouped', { params: { lang: resolveLang(lang) } }),

  // Site config + content
  getSiteConfig: (lang) => axiosClient.get('/public/site-config', { params: { lang: resolveLang(lang) } }),
  getMembers: () => axiosClient.get('/public/members'),
  getLocations: () => axiosClient.get('/public/locations'),
  getLeadership: () => axiosClient.get('/public/leadership'),
  getQuoteSection: () => axiosClient.get('/public/quote-section'),
  getPartners: (type) => axiosClient.get('/public/partners', { params: { type } }),
  getPosts: (params) => axiosClient.get('/public/posts', { params }),
  getPost: (slug) => axiosClient.get(`/public/posts/${slug}`),
  getPostCategories: () => axiosClient.get('/public/post-categories'),
  submitQuote: (data) => axiosClient.post('/client/quote-section', data),
};

export default publicApi;
