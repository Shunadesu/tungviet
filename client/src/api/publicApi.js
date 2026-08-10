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
  getProducts: (params) => {
    const { lang, ...rest } = params || {};
    return axiosClient.get('/public/products', { params: { lang: resolveLang(lang), ...rest } });
  },
  getProduct: (id, lang) => axiosClient.get(`/public/products/${id}`, { params: { lang: resolveLang(lang) } }),
  incrementView: (id) => axiosClient.post(`/public/products/${id}/view`),
  getProductColumns: (lang) => axiosClient.get('/public/product-columns', { params: { lang: resolveLang(lang) } }),
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