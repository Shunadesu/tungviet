import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import SEO from '../components/SEO';

const Cart = () => {
  const { cart, totalPrice, updateQuantity, removeFromCart } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  if (cart.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen flex items-center justify-center"
      >
        <SEO title="Shopping Cart" description="Your shopping cart is currently empty." url="/cart" />
        <div className="text-center">
          <FiShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Your cart is empty</h2>
          <p className="text-sm text-gray-500 mb-4">Add some products to your cart</p>
          <Link to="/products" className="btn-primary inline-block">
            Continue shopping
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-8"
    >
      <SEO
        title="Shopping Cart"
        description={`Review items in your shopping cart. ${cart.length} products ready for checkout.`}
        url="/cart"
      />
      {/* Header */}
      <div className="bg-primary text-white py-4">
        <div className="max-w-7xl mx-auto px-2">
          <h1 className="text-lg font-semibold">Giỏ hàng</h1>
          <p className="text-xs text-white/70">{cart.length} sản phẩm</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 py-4">
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-2">
            {cart.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg p-2 flex gap-3"
              >
                <img
                  src={item.imageUrl || 'https://via.placeholder.com/80'}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                
                <div className="flex-1">
                  <h3 className="text-sm font-medium line-clamp-1">{item.name}</h3>
                  <p className="text-xs text-gray-500">{item.categoryId?.name}</p>
                  <p className="text-sm font-semibold text-primary mt-1">
                    {formatPrice(item.price)}
                  </p>
                </div>

                <div className="flex flex-col justify-between items-end">
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="text-gray-400 hover:text-red-500 p-1"
                  >
                    <FiTrash2 size={16} />
                  </button>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="w-6 h-6 flex items-center justify-center border rounded hover:bg-gray-50"
                    >
                      <FiMinus size={12} />
                    </button>
                    <span className="w-8 text-center text-xs">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="w-6 h-6 flex items-center justify-center border rounded hover:bg-gray-50"
                    >
                      <FiPlus size={12} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-4 sticky top-16">
              <h2 className="text-sm font-semibold mb-3">Tổng cộng</h2>
              
              <div className="space-y-2 text-xs border-b pb-3 mb-3">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Giảm giá:</span>
                  <span className="text-green-600">0đ</span>
                </div>
              </div>

              <div className="flex justify-between font-semibold text-sm mb-4">
                <span>Tổng:</span>
                <span className="text-primary">{formatPrice(totalPrice)}</span>
              </div>

              <Link to="/checkout" className="btn-primary w-full text-center block">
                Tiến hành đặt hàng
              </Link>
              
              <Link to="/products" className="btn-secondary w-full text-center block mt-2">
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Cart;
