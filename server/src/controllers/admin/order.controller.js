import { orderService } from '../../services/order.service.js';
import Order from '../../models/Order.js';
import { apiResponse } from '../../utils/apiResponse.js';

export const getAllOrders = async (req, res, next) => {
  try {
    const { status, search, sort, page, limit } = req.query;
    const { items, pagination } = await orderService.listAdmin({ status, search, sort, page, limit });
    return apiResponse.paginated(res, items, pagination);
  } catch (err) {
    next(err);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getById(req.params.id);
    return apiResponse.ok(res, order);
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await orderService.updateStatus(req.params.id, req.body.status);
    return apiResponse.ok(res, order, 'Cập nhật trạng thái thành công');
  } catch (err) {
    next(err);
  }
};

export const deleteOrder = async (req, res, next) => {
  try {
    await orderService.delete(req.params.id);
    return apiResponse.ok(res, null, 'Xóa đơn hàng thành công');
  } catch (err) {
    next(err);
  }
};

export const restoreOrder = async (req, res, next) => {
  try {
    const order = await orderService.restore(req.params.id);
    return apiResponse.ok(res, order, 'Khôi phục đơn hàng thành công');
  } catch (err) {
    next(err);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const stats = await orderService.getStats();
    return apiResponse.ok(res, stats);
  } catch (err) {
    next(err);
  }
};