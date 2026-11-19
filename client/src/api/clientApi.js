import axiosClient from './axiosClient';

export const clientApi = {
  createOrder: (data) => axiosClient.post('/client/orders', data),
  getMyOrders: () => axiosClient.get('/client/orders'),
  getOrder: (id) => axiosClient.get(`/client/orders/${id}`),
  recordTdsDownload: (productId) => axiosClient.post('/client/tds-downloads', { productId }),
};

export default clientApi;
