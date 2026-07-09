import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiEye, FiTrash2 } from 'react-icons/fi';
import Header from '../components/Header';
import Modal from '../components/Modal';
import SEO from '../components/SEO';
import adminApi from '../api/adminApi';
import { useNotification } from '../context/NotificationContext';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { addNotification } = useNotification();

  const statusOptions = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await adminApi.getOrders();
      setOrders(res.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (id) => {
    try {
      const res = await adminApi.getOrder(id);
      setSelectedOrder(res.data.data);
      setModalOpen(true);
    } catch (error) {
      addNotification('Có lỗi xảy ra', 'error');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await adminApi.updateOrderStatus(id, status);
      addNotification('Cập nhật trạng thái thành công');
      fetchOrders();
      if (selectedOrder?._id === id) {
        setSelectedOrder({ ...selectedOrder, status });
      }
    } catch (error) {
      addNotification('Có lỗi xảy ra', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa đơn hàng này?')) return;
    try {
      await adminApi.deleteOrder(id);
      addNotification('Xóa đơn hàng thành công');
      fetchOrders();
      setModalOpen(false);
    } catch (error) {
      addNotification('Có lỗi xảy ra', 'error');
    }
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  const formatDate = (date) => new Date(date).toLocaleDateString('vi-VN');

  const getStatusColor = (status) => {
    const colors = {
      Pending: 'bg-yellow-100 text-yellow-700',
      Processing: 'bg-blue-100 text-blue-700',
      Shipped: 'bg-purple-100 text-purple-700',
      Delivered: 'bg-green-100 text-green-700',
      Cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <SEO title="Orders" description="Manage customer orders" url="/orders" />
      <Header title="Quản lý đơn hàng" />
      
      <div className="p-4">
        <div className="card">
          <div className="mb-3">
            <h2 className="text-sm font-semibold">Danh sách đơn hàng ({orders.length})</h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="table-header">
                    <th className="px-2 py-2 text-left">Mã đơn</th>
                    <th className="px-2 py-2 text-left">Khách hàng</th>
                    <th className="px-2 py-2 text-left">Ngày đặt</th>
                    <th className="px-2 py-2 text-left">Tổng tiền</th>
                    <th className="px-2 py-2 text-left">Trạng thái</th>
                    <th className="px-2 py-2 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id} className="table-row">
                      <td className="px-2 py-2 text-xs font-mono">#{order._id.slice(-8)}</td>
                      <td className="px-2 py-2 text-xs">
                        <p className="font-medium">{order.userName || 'Khách'}</p>
                        <p className="text-gray-500">{order.userPhone}</p>
                      </td>
                      <td className="px-2 py-2 text-xs">{formatDate(order.createdAt)}</td>
                      <td className="px-2 py-2 text-xs text-primary font-medium">{formatPrice(order.totalAmount)}</td>
                      <td className="px-2 py-2">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                          className={`text-xs px-2 py-1 rounded border-0 ${getStatusColor(order.status)}`}
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-2 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => handleView(order._id)}
                            className="p-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                          >
                            <FiEye size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(order._id)}
                            className="p-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Chi tiết đơn hàng"
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Mã đơn hàng</p>
                <p className="text-xs font-mono font-medium">#{selectedOrder._id.slice(-8)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Ngày đặt</p>
                <p className="text-xs font-medium">{formatDate(selectedOrder.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Khách hàng</p>
                <p className="text-xs font-medium">{selectedOrder.userName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Số điện thoại</p>
                <p className="text-xs font-medium">{selectedOrder.userPhone}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500">Địa chỉ</p>
                <p className="text-xs font-medium">{selectedOrder.userAddress}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-2">Sản phẩm</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedOrder.details?.map((item) => (
                  <div key={item._id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <img
                      src={item.productImage || 'https://via.placeholder.com/40'}
                      alt={item.productName}
                      className="w-10 h-10 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="text-xs font-medium line-clamp-1">{item.productName}</p>
                      <p className="text-xs text-gray-500">x{item.quantity}</p>
                    </div>
                    <span className="text-xs font-medium">{formatPrice(item.totalPrice)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t">
              <span className="text-sm font-semibold">Tổng cộng:</span>
              <span className="text-base font-bold text-primary">{formatPrice(selectedOrder.totalAmount)}</span>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Trạng thái</p>
              <select
                value={selectedOrder.status}
                onChange={(e) => handleUpdateStatus(selectedOrder._id, e.target.value)}
                className={`text-xs px-3 py-2 rounded ${getStatusColor(selectedOrder.status)}`}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default OrderList;
