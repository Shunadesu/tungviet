import axiosClient from './axiosClient';

const isFormData = (value) =>
  typeof FormData !== 'undefined' && value instanceof FormData;

const toUploadFormData = (payload) => {
  if (isFormData(payload)) {
    const file = payload.get('file');
    if (!(file instanceof Blob)) {
      throw new TypeError('Vui lòng chọn file hợp lệ');
    }
    return payload;
  }

  if (!(payload instanceof Blob)) {
    throw new TypeError('Vui lòng chọn file hợp lệ');
  }

  const formData = new FormData();
  formData.append('file', payload, payload.name || 'upload');
  return formData;
};

const postUpload = (url, payload) => axiosClient.post(url, toUploadFormData(payload));

export const adminApi = {
  // Auth
  login: (data) => axiosClient.post('/auth/login', data),

  // Upload
  uploadImage: (payload) => postUpload('/admin/upload', payload),
  uploadPDF: (payload) => postUpload('/admin/upload/pdf', payload),

  // Products
  getProducts: (params) => axiosClient.get('/admin/products', { params }),
  getProduct: (id) => axiosClient.get(`/admin/products/${id}`),
  createProduct: (data) => axiosClient.post('/admin/products', data),
  updateProduct: (id, data) => axiosClient.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => axiosClient.delete(`/admin/products/${id}`),
  deleteProducts: (ids) => axiosClient.post('/admin/products/batch-delete', { ids }),
  uploadTDS: (id, file) => postUpload(`/admin/products/${id}/upload-tds`, file),
  getProductsForSelect: () => axiosClient.get('/admin/products/select'),

  // Product columns
  getProductColumns: () => axiosClient.get('/admin/product-columns'),
  getProductColumn: (id) => axiosClient.get(`/admin/product-columns/${id}`),
  createProductColumn: (data) => axiosClient.post('/admin/product-columns', data),
  updateProductColumn: (id, data) => axiosClient.put(`/admin/product-columns/${id}`, data),
  deleteProductColumn: (id) => axiosClient.delete(`/admin/product-columns/${id}`),
  restoreProductColumn: (id) => axiosClient.post(`/admin/product-columns/${id}/restore`),
  reorderProductColumns: (order) => axiosClient.post('/admin/product-columns/reorder', { order }),

  // Categories (Product Line)
  getCategories: (params) => axiosClient.get('/admin/categories', { params }),
  getCategory: (id) => axiosClient.get(`/admin/categories/${id}`),
  createCategory: (data) => axiosClient.post('/admin/categories', data),
  updateCategory: (id, data) => axiosClient.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => axiosClient.delete(`/admin/categories/${id}`),
  deleteCategories: (ids) => axiosClient.post('/admin/categories/batch-delete', { ids }),
  reorderCategories: (order) => axiosClient.post('/admin/categories/reorder', { order }),

  // Main Trees (Industries)
  getMainTrees: (params) => axiosClient.get('/admin/main-trees', { params }),
  getMainTree: (id) => axiosClient.get(`/admin/main-trees/${id}`),
  createMainTree: (data) => axiosClient.post('/admin/main-trees', data),
  updateMainTree: (id, data) => axiosClient.put(`/admin/main-trees/${id}`, data),
  deleteMainTree: (id) => axiosClient.delete(`/admin/main-trees/${id}`),
  reorderMainTrees: (order) => axiosClient.post('/admin/main-trees/reorder', { order }),

  // Market Trees (parent/child within a main tree)
  getMarketTrees: (params) => axiosClient.get('/admin/market-trees', { params }),
  getMarketTree: (id) => axiosClient.get(`/admin/market-trees/${id}`),
  createMarketTree: (data) => axiosClient.post('/admin/market-trees', data),
  updateMarketTree: (id, data) => axiosClient.put(`/admin/market-trees/${id}`, data),
  deleteMarketTree: (id) => axiosClient.delete(`/admin/market-trees/${id}`),
  reorderMarketTrees: (order) => axiosClient.post('/admin/market-trees/reorder', { order }),

  // Orders
  getOrders: (params) => axiosClient.get('/admin/orders', { params }),
  getOrder: (id) => axiosClient.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, status) => axiosClient.put(`/admin/orders/${id}/status`, { status }),
  deleteOrder: (id) => axiosClient.delete(`/admin/orders/${id}`),

  // Stats
  getStats: () => axiosClient.get('/admin/orders/stats'),

  // Site config (logo, banner, footer)
  getSiteConfig: () => axiosClient.get('/admin/site-config'),
  uploadLogo: (file) => postUpload('/admin/site-config/logo/upload', file),
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
  uploadFavicon: (file) => postUpload('/admin/site-config/favicon', file),

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

  // Post Categories
  getPostCategories: (params) => axiosClient.get('/admin/post-categories', { params }),
  getPostCategory: (id) => axiosClient.get(`/admin/post-categories/${id}`),
  createPostCategory: (data) => axiosClient.post('/admin/post-categories', data),
  updatePostCategory: (id, data) => axiosClient.put(`/admin/post-categories/${id}`, data),
  deletePostCategory: (id) => axiosClient.delete(`/admin/post-categories/${id}`),
  reorderPostCategories: (order) => axiosClient.post('/admin/post-categories/reorder', { order }),

  // Analytics
  getOnlineUsers: () => axiosClient.get('/admin/analytics/online'),
  getOnlineCount: () => axiosClient.get('/admin/analytics/online/count'),
  getAnalyticsVisitors: (params) => axiosClient.get('/admin/analytics/visitors', { params }),
  getAnalyticsLogs: (params) => axiosClient.get('/admin/analytics/logs', { params }),
  getAnalyticsStats: (range) =>
    axiosClient.get('/admin/analytics/stats', { params: { range } }),
  getAnalyticsDashboard: () => axiosClient.get('/admin/analytics/dashboard'),
  getAnalyticsChart: (range) =>
    axiosClient.get('/admin/analytics/chart', { params: { range } }),
};

export default adminApi;
