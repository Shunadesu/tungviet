import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPackage, FiChevronRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import clientApi from '../api/clientApi';

const OrderHistory = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const res = await clientApi.getMyOrders();
      setOrders(res.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: 'bg-yellow-100 text-yellow-700',
      Processing: 'bg-blue-100 text-blue-700',
      Shipped: 'bg-purple-100 text-purple-700',
      Delivered: 'bg-green-100 text-green-700',
      Cancelled: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">Vui lòng đăng nhập để xem đơn hàng</p>
          <Link to="/login" className="btn-primary inline-block">Đăng nhập</Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-8"
    >
      {/* Header */}
      <div className="bg-primary text-white py-4">
        <div className="max-w-7xl mx-auto px-2">
          <h1 className="text-lg font-semibold">Đơn hàng của tôi</h1>
          <p className="text-xs text-white/70">{orders.length} đơn hàng</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 py-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <FiPackage size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-base font-semibold text-gray-700 mb-2">Chưa có đơn hàng</h2>
            <p className="text-xs text-gray-500 mb-4">Bắt đầu mua sắm ngay</p>
            <Link to="/products" className="btn-primary inline-block">Xem sản phẩm</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {orders.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-xs font-mono text-gray-500">#{order._id.slice(-8)}</p>
                    <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(order.status)}`}>
                    {order.status === 'Pending' && 'Chờ xử lý'}
                    {order.status === 'Processing' && 'Đang xử lý'}
                    {order.status === 'Shipped' && 'Đã giao'}
                    {order.status === 'Delivered' && 'Hoàn thành'}
                    {order.status === 'Cancelled' && 'Đã hủy'}
                  </span>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2">
                  {order.details?.slice(0, 4).map((item) => (
                    <img
                      key={item._id}
                      src={item.productImage || 'https://via.placeholder.com/60'}
                      alt={item.productName}
                      className="w-12 h-12 object-cover rounded flex-shrink-0"
                    />
                  ))}
                  {(order.details?.length || 0) > 4 && (
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-gray-500">+{order.details.length - 4}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs text-gray-500">
                    {order.details?.length || 0} sản phẩm
                  </span>
                  <span className="text-sm font-semibold text-primary">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default OrderHistory;
