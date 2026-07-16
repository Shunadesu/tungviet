import Order from '../models/Order.js';
import OrderDetail from '../models/OrderDetail.js';
import Product from '../models/Product.js';
import { AppError } from '../utils/AppError.js';
import { buildPagination } from '../utils/apiResponse.js';
import { productService } from './product.service.js';

const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export const orderService = {
  async create(payload, currentUser) {
    const { items, userName, userEmail, userPhone, userAddress, note } = payload;

    if (!items || items.length === 0) {
      throw AppError.badRequest('Giỏ hàng trống');
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await productService.getById(item.productId);
      if (product.stock < item.quantity) {
        throw AppError.badRequest(`Sản phẩm "${product.name}" không đủ số lượng trong kho`);
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: product._id,
        productName: product.name,
        productImage: product.imageUrl,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: itemTotal,
      });

      await productService.decrementStock(product._id, item.quantity);
    }

    const order = new Order({
      userId: currentUser?._id?.toString() || 'guest',
      userName,
      userEmail,
      userPhone,
      userAddress,
      totalAmount,
      note,
    });
    await order.save();

    const orderDetails = orderItems.map((it) => ({ ...it, orderId: order._id }));
    await OrderDetail.insertMany(orderDetails);

    return order;
  },

  async listMine(userId) {
    const orders = await Order.find({ userId: userId.toString() }).sort({ createdAt: -1 });
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const details = await OrderDetail.find({ orderId: order._id });
        return { ...order.toObject(), details };
      })
    );
    return ordersWithDetails;
  },

  async getMineById(orderId, userId) {
    const order = await Order.findById(orderId);
    if (!order) throw AppError.notFound('Đơn hàng không tồn tại');
    if (order.userId !== userId.toString()) {
      throw AppError.forbidden('Bạn không có quyền xem đơn hàng này');
    }
    const details = await OrderDetail.find({ orderId: order._id });
    return { ...order.toObject(), details };
  },

  async listAdmin({ status, search, sort, page = 1, limit = 20 } = {}) {
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { userPhone: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (page - 1) * limit;
    const sortOption = sort ? { createdAt: sort === 'oldest' ? 1 : -1 } : { createdAt: -1 };

    const [items, total] = await Promise.all([
      Order.find(query).sort(sortOption).skip(skip).limit(limit),
      Order.countDocuments(query),
    ]);
    return { items, pagination: buildPagination(page, limit, total) };
  },

  async getById(orderId) {
    const order = await Order.findById(orderId);
    if (!order) throw AppError.notFound('Đơn hàng không tồn tại');
    const details = await OrderDetail.find({ orderId: order._id });
    return { ...order.toObject(), details };
  },

  async updateStatus(orderId, status) {
    if (!ORDER_STATUSES.includes(status)) {
      throw AppError.badRequest('Trạng thái không hợp lệ');
    }
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true, runValidators: true }
    );
    if (!order) throw AppError.notFound('Đơn hàng không tồn tại');
    return order;
  },

  async delete(orderId) {
    await OrderDetail.deleteMany({ orderId });
    const order = await Order.findOne({ _id: orderId });
    if (!order) throw AppError.notFound('Đơn hàng không tồn tại');
    await order.delete();
    return order;
  },

  async restore(orderId) {
    const order = await Order.findOneDeleted({ _id: orderId });
    if (!order) throw AppError.notFound('Đơn hàng không tồn tại trong thùng rác');
    await order.restore();
    return order;
  },

  async getStats() {
    const [totalOrders, totalProducts, revenueAgg, recentOrders, statusAgg] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.find().sort({ createdAt: -1 }).limit(5),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);

    return {
      totalOrders,
      totalProducts,
      totalRevenue: revenueAgg[0]?.total || 0,
      recentOrders,
      statusStats: statusAgg,
    };
  },

  ORDER_STATUSES,
};