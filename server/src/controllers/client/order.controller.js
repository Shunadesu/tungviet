import { orderService } from '../../services/order.service.js';
import { apiResponse } from '../../utils/apiResponse.js';

export const createOrder = async (req, res, next) => {
  try {
    const order = await orderService.create(req.body, req.user);
    return apiResponse.created(res, order, 'Đặt hàng thành công');
  } catch (err) {
    next(err);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await orderService.listMine(req.user._id);
    return apiResponse.ok(res, orders);
  } catch (err) {
    next(err);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getMineById(req.params.id, req.user._id);
    return apiResponse.ok(res, order);
  } catch (err) {
    next(err);
  }
};