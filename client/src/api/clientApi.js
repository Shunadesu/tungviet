import axiosClient from './axiosClient';

export const clientApi = {
  createOrder: (data) => axiosClient.post('/client/orders', data),
  getMyOrders: () => axiosClient.get('/client/orders'),
  getOrder: (id) => axiosClient.get(`/client/orders/${id}`),
};

export default clientApi;
