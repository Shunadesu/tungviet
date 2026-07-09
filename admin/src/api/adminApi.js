import axiosClient from './axiosClient';

export const adminApi = {
  // Auth
  login: (data) => axiosClient.post('/auth/login', data),
  
  // Products
  getProducts: (params) => axiosClient.get('/admin/products', { params }),
  getProduct: (id) => axiosClient.get(`/admin/products/${id}`),
  createProduct: (data) => axiosClient.post('/admin/products', data),
  updateProduct: (id, data) => axiosClient.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => axiosClient.delete(`/admin/products/${id}`),
  
  // Categories
  getCategories: () => axiosClient.get('/admin/categories'),
  getCategory: (id) => axiosClient.get(`/admin/categories/${id}`),
  createCategory: (data) => axiosClient.post('/admin/categories', data),
  updateCategory: (id, data) => axiosClient.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => axiosClient.delete(`/admin/categories/${id}`),
  
  // Orders
  getOrders: (params) => axiosClient.get('/admin/orders', { params }),
  getOrder: (id) => axiosClient.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, status) => axiosClient.put(`/admin/orders/${id}/status`, { status }),
  deleteOrder: (id) => axiosClient.delete(`/admin/orders/${id}`),
  
  // Stats
  getStats: () => axiosClient.get('/admin/orders/stats'),
};

export default adminApi;
