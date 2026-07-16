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
  getCategories: (lang) => axiosClient.get('/public/categories', { params: { lang: resolveLang(lang) } }),
  getCategory: (id, lang) => axiosClient.get(`/public/categories/${id}`, { params: { lang: resolveLang(lang) } }),
  getMarkets: (params) => {
    const { lang, ...rest } = params || {};
    return axiosClient.get('/public/markets', { params: { lang: resolveLang(lang), ...rest } });
  },
  getMarket: (id, lang) => axiosClient.get(`/public/markets/${id}`, { params: { lang: resolveLang(lang) } }),
  getSiteConfig: (lang) => axiosClient.get('/public/site-config', { params: { lang: resolveLang(lang) } }),
  getMembers: () => axiosClient.get('/public/members'),
  getLocations: () => axiosClient.get('/public/locations'),
  getLeadership: () => axiosClient.get('/public/leadership'),
  getQuoteSection: () => axiosClient.get('/public/quote-section'),
  getPartners: (type) => axiosClient.get('/public/partners', { params: { type } }),
  getPosts: (params) => axiosClient.get('/public/posts', { params }),
  getPost: (slug) => axiosClient.get(`/public/posts/${slug}`),
  getPost: (slug) => axiosClient.get(`/public/posts/${slug}`),
  submitQuote: (data) => axiosClient.post('/client/quote-section', data),
};

export default publicApi;