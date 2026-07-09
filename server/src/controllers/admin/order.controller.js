import Order from '../../models/Order.js';
import OrderDetail from '../../models/OrderDetail.js';
import Product from '../../models/Product.js';

export const getAllOrders = async (req, res) => {
  try {
    const { status, search, sort, limit = 50, page = 1 } = req.query;
    
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { userPhone: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Đơn hàng không tồn tại' 
      });
    }
    
    const details = await OrderDetail.find({ orderId: order._id });
    
    res.json({
      success: true,
      data: { ...order.toObject(), details }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Trạng thái không hợp lệ' 
      });
    }
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Đơn hàng không tồn tại' 
      });
    }
    
    res.json({
      success: true,
      message: 'Cập nhật trạng thái thành công',
      data: order
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    // Delete order details first
    await OrderDetail.deleteMany({ orderId: req.params.id });
    
    // Then delete order
    const order = await Order.findByIdAndDelete(req.params.id);
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Đơn hàng không tồn tại' 
      });
    }
    
    res.json({
      success: true,
      message: 'Xóa đơn hàng thành công'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getStats = async (req, res) => {
  try {
    const [totalOrders, totalProducts, totalRevenue, recentOrders] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.find().sort({ createdAt: -1 }).limit(5)
    ]);
    
    const revenue = totalRevenue[0]?.total || 0;
    
    // Stats by status
    const statusStats = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    res.json({
      success: true,
      data: {
        totalOrders,
        totalProducts,
        totalRevenue: revenue,
        recentOrders,
        statusStats
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
