import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import SEO from '../components/SEO';
import clientApi from '../api/clientApi';
import { useAuth } from '../context/AuthContext';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  const [formData, setFormData] = useState({
    userName: user?.name || '',
    userEmail: user?.email || '',
    userPhone: '',
    userAddress: '',
    note: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const items = cart.map(item => ({
        productId: item._id,
        quantity: item.quantity
      }));

      const res = await clientApi.createOrder({ ...formData, items });
      
      if (res.data.success) {
        setOrderId(res.data.data._id);
        setSuccess(true);
        clearCart();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Đặt hàng thất bại');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen flex items-center justify-center"
      >
      <div className="text-center max-w-md mx-auto px-2">
        <FiCheckCircle size={80} className="mx-auto text-green-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Order placed successfully!</h2>
        <p className="text-sm text-gray-600 mb-2">
          Thank you for your order. Your order ID is:
        </p>
        <p className="text-base font-mono text-primary mb-4">{orderId}</p>
        <p className="text-xs text-gray-500 mb-4">
          We will contact you soon to confirm your order.
        </p>
        <button onClick={() => navigate('/products')} className="btn-primary">
          Continue shopping
        </button>
        </div>
      </motion.div>
    );
  }

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-8"
    >
      <SEO title="Checkout" description="Complete your order by providing shipping and payment details." url="/checkout" noindex />
      {/* Header */}
      <div className="bg-primary text-white py-4">
        <div className="max-w-7xl mx-auto px-2">
          <h1 className="text-lg font-semibold">Thanh toán</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 py-4">
        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-4">
          {/* Form */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg p-4">
              <h2 className="text-sm font-semibold mb-3">Thông tin giao hàng</h2>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Họ tên *</label>
                  <input
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="Nhập họ tên"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Email *</label>
                    <input
                      type="email"
                      name="userEmail"
                      value={formData.userEmail}
                      onChange={handleChange}
                      required
                      className="input-field"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Số điện thoại *</label>
                    <input
                      type="tel"
                      name="userPhone"
                      value={formData.userPhone}
                      onChange={handleChange}
                      required
                      className="input-field"
                      placeholder="0123 456 789"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Địa chỉ giao hàng *</label>
                  <input
                    type="text"
                    name="userAddress"
                    value={formData.userAddress}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, thành phố"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Ghi chú</label>
                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    rows={3}
                    className="input-field resize-none"
                    placeholder="Ghi chú thêm (nếu có)"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : 'Đặt hàng'}
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-4 sticky top-16">
              <h2 className="text-sm font-semibold mb-3">Đơn hàng ({cart.length})</h2>
              
              <div className="space-y-2 max-h-64 overflow-y-auto mb-3">
                {cart.map((item) => (
                  <div key={item._id} className="flex gap-2">
                    <img
                      src={item.imageUrl || 'https://via.placeholder.com/50'}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium line-clamp-1">{item.name}</p>
                      <p className="text-xs text-gray-500">x{item.quantity}</p>
                    </div>
                    <span className="text-xs font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí ship:</span>
                  <span className="text-green-600">Miễn phí</span>
                </div>
                <div className="flex justify-between font-semibold text-sm pt-2 border-t">
                  <span>Tổng:</span>
                  <span className="text-primary">{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default Checkout;
