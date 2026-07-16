import axiosClient from './axiosClient';

export const adminApi = {
  // Auth
  login: (data) => axiosClient.post('/auth/login', data),

  // Upload
  uploadImage: (payload) => {
    let fd;
    if (payload instanceof FormData) {
      fd = payload;
    } else {
      fd = new FormData();
      fd.append('file', payload);
    }
    return axiosClient.post('/admin/upload', fd, {
      transformRequest: (data, headers) => {
        if (typeof FormData !== 'undefined' && data instanceof FormData) {
          // Let the browser set the proper multipart boundary.
          if (headers) delete headers['Content-Type'];
        }
        return data;
      },
    });
  },
  uploadPDF: (payload) => {
    let fd;
    if (payload instanceof FormData) {
      fd = payload;
    } else {
      fd = new FormData();
      fd.append('file', payload);
    }
    return axiosClient.post('/admin/upload/pdf', fd, {
      transformRequest: (data, headers) => {
        if (typeof FormData !== 'undefined' && data instanceof FormData) {
          if (headers) delete headers['Content-Type'];
        }
        return data;
      },
    });
  },

  // Products
  getProducts: (params) => axiosClient.get('/admin/products', { params }),
  getProduct: (id) => axiosClient.get(`/admin/products/${id}`),
  createProduct: (data) => axiosClient.post('/admin/products', data),
  updateProduct: (id, data) => axiosClient.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => axiosClient.delete(`/admin/products/${id}`),
  deleteProducts: (ids) => axiosClient.post('/admin/products/batch-delete', { ids }),
  uploadTDS: (id, file) => {
    const fd = new FormData();
    fd.append('file', file);
    return axiosClient.post(`/admin/products/${id}/upload-tds`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getProductsForSelect: () => axiosClient.get('/admin/products/select'),

  // Categories
  getCategories: () => axiosClient.get('/admin/categories'),
  getCategory: (id) => axiosClient.get(`/admin/categories/${id}`),
  createCategory: (data) => axiosClient.post('/admin/categories', data),
  updateCategory: (id, data) => axiosClient.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => axiosClient.delete(`/admin/categories/${id}`),
  deleteCategories: (ids) => axiosClient.post('/admin/categories/batch-delete', { ids }),

  // Markets
  getMarkets: (params) => axiosClient.get('/admin/markets', { params }),
  getMarket: (id) => axiosClient.get(`/admin/markets/${id}`),
  createMarket: (data) => axiosClient.post('/admin/markets', data),
  updateMarket: (id, data) => axiosClient.put(`/admin/markets/${id}`, data),
  deleteMarket: (id) => axiosClient.delete(`/admin/markets/${id}`),
  restoreMarket: (id) => axiosClient.post(`/admin/markets/${id}/restore`),
  addProductsToMarket: (id, productIds) => axiosClient.post(`/admin/markets/${id}/products`, { productIds }),
  removeProductsFromMarket: (id, productIds) => axiosClient.delete(`/admin/markets/${id}/products`, { data: { productIds } }),

  // Orders
  getOrders: (params) => axiosClient.get('/admin/orders', { params }),
  getOrder: (id) => axiosClient.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, status) => axiosClient.put(`/admin/orders/${id}/status`, { status }),
  deleteOrder: (id) => axiosClient.delete(`/admin/orders/${id}`),

  // Stats
  getStats: () => axiosClient.get('/admin/orders/stats'),

  // Site config (logo, banner, footer)
  getSiteConfig: () => axiosClient.get('/admin/site-config'),
  uploadLogo: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return axiosClient.post('/admin/site-config/logo/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  clearLogo: () => axiosClient.delete('/admin/site-config/logo'),
  updateFooter: (data) => axiosClient.put('/admin/site-config/footer', data),

  // Hero slides (homepage slider)
  addHeroSlide: (data) => axiosClient.post('/admin/site-config/hero-slides', data),
  updateHeroSlide: (id, data) =>
    axiosClient.put(`/admin/site-config/hero-slides/${id}`, data),
  deleteHeroSlide: (id) =>
    axiosClient.delete(`/admin/site-config/hero-slides/${id}`),
  reorderHeroSlides: (order) =>
    axiosClient.post('/admin/site-config/hero-slides/reorder', { order }),

  // About page
  addAboutSlide: (data) => axiosClient.post('/admin/site-config/about-slides', data),
  updateAboutSlide: (id, data) =>
    axiosClient.put(`/admin/site-config/about-slides/${id}`, data),
  deleteAboutSlide: (id) =>
    axiosClient.delete(`/admin/site-config/about-slides/${id}`),
  reorderAboutSlides: (order) =>
    axiosClient.post('/admin/site-config/about-slides/reorder', { order }),
  updateAbout: (data) => axiosClient.put('/admin/site-config/about', data),
  updateFastFacts: (data) => axiosClient.put('/admin/site-config/fast-facts', data),
  updateCoreValues: (data) => axiosClient.put('/admin/site-config/core-values', data),

  // SEO & Favicon
  updateSeo: (data) => axiosClient.put('/admin/site-config/seo', data),
  uploadFavicon: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return axiosClient.post('/admin/site-config/favicon', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Floating contacts
  updateFloatingContacts: (data) => axiosClient.put('/admin/site-config/floating-contacts', data),

  // Members (Board of Directors)
  getMembers: () => axiosClient.get('/admin/members'),
  getMember: (id) => axiosClient.get(`/admin/members/${id}`),
  createMember: (data) => axiosClient.post('/admin/members', data),
  updateMember: (id, data) => axiosClient.put(`/admin/members/${id}`, data),
  deleteMember: (id) => axiosClient.delete(`/admin/members/${id}`),
  reorderMembers: (order) => axiosClient.post('/admin/members/reorder', { order }),

  // Locations
  getLocations: () => axiosClient.get('/admin/locations'),
  getLocation: (id) => axiosClient.get(`/admin/locations/${id}`),
  createLocation: (data) => axiosClient.post('/admin/locations', data),
  updateLocation: (id, data) => axiosClient.put(`/admin/locations/${id}`, data),
  deleteLocation: (id) => axiosClient.delete(`/admin/locations/${id}`),
  reorderLocations: (order) => axiosClient.post('/admin/locations/reorder', { order }),

  // Leadership
  getLeadership: () => axiosClient.get('/admin/leadership'),
  getLeadershipMember: (id) => axiosClient.get(`/admin/leadership/${id}`),
  createLeadership: (data) => axiosClient.post('/admin/leadership', data),
  updateLeadership: (id, data) => axiosClient.put(`/admin/leadership/${id}`, data),
  deleteLeadership: (id) => axiosClient.delete(`/admin/leadership/${id}`),
  reorderLeadership: (order) => axiosClient.post('/admin/leadership/reorder', { order }),

  // Quote Section
  getQuoteSection: () => axiosClient.get('/admin/quote-section'),
  updateQuoteSection: (data) => axiosClient.put('/admin/quote-section', data),
  getQuoteSubmissions: (params) => axiosClient.get('/admin/quote-section/submissions', { params }),
  updateQuoteSubmission: (id, data) => axiosClient.put(`/admin/quote-section/submissions/${id}`, data),

  // Partners
  getPartners: (params) => axiosClient.get('/admin/partners', { params }),
  createPartner: (data) => axiosClient.post('/admin/partners', data),
  updatePartner: (id, data) => axiosClient.put(`/admin/partners/${id}`, data),
  deletePartner: (id) => axiosClient.delete(`/admin/partners/${id}`),
  reorderPartners: (order) => axiosClient.post('/admin/partners/reorder', { order }),

  // Posts
  getPosts: (params) => axiosClient.get('/admin/posts', { params }),
  getPost: (id) => axiosClient.get(`/admin/posts/${id}`),
  createPost: (data) => axiosClient.post('/admin/posts', data),
  updatePost: (id, data) => axiosClient.put(`/admin/posts/${id}`, data),
  deletePost: (id) => axiosClient.delete(`/admin/posts/${id}`),
  reorderPosts: (order) => axiosClient.post('/admin/posts/reorder', { order }),
};

export default adminApi;
