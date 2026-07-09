import Order from '../../models/Order.js';
import OrderDetail from '../../models/OrderDetail.js';
import Product from '../../models/Product.js';

export const createOrder = async (req, res) => {
  try {
    const { items, userName, userEmail, userPhone, userAddress, note } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Giỏ hàng trống' 
      });
    }

    // Calculate total and validate products
    let totalAmount = 0;
    const orderItems = [];
    
    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({ 
          success: false, 
          message: `Sản phẩm không tồn tại: ${item.productId}` 
        });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Sản phẩm "${product.name}" không đủ số lượng trong kho` 
        });
      }
      
      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;
      
      orderItems.push({
        productId: product._id,
        productName: product.name,
        productImage: product.imageUrl,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: itemTotal
      });
      
      // Update stock
      product.stock -= item.quantity;
      await product.save();
    }
    
    // Create order
    const order = new Order({
      userId: req.user?._id?.toString() || 'guest',
      userName,
      userEmail,
      userPhone,
      userAddress,
      totalAmount,
      note
    });
    
    await order.save();
    
    // Create order details
    const orderDetails = orderItems.map(item => ({
      ...item,
      orderId: order._id
    }));
    
    await OrderDetail.insertMany(orderDetails);
    
    res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công',
      data: order
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id.toString() })
      .sort({ createdAt: -1 });
    
    // Get order details for each order
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const details = await OrderDetail.find({ orderId: order._id });
        return { ...order.toObject(), details };
      })
    );
    
    res.json({
      success: true,
      data: ordersWithDetails
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
    
    // Check ownership
    if (order.userId !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Bạn không có quyền xem đơn hàng này' 
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
