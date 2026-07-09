import axiosClient from './axiosClient';

export const publicApi = {
  getProducts: (params) => axiosClient.get('/public/products', { params }),
  getProduct: (id) => axiosClient.get(`/public/products/${id}`),
  getCategories: () => axiosClient.get('/public/categories'),
  getCategory: (id) => axiosClient.get(`/public/categories/${id}`),
};

export default publicApi;
