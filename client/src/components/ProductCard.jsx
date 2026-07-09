import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiEye } from 'react-icons/fi';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product, index = 0 }) => {
  const { addToCart } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="card group"
    >
      <Link to={`/products/${product._id}`}>
        <div className="relative overflow-hidden rounded-lg mb-2">
          <img
            src={product.imageUrl || 'https://via.placeholder.com/300x200?text=Cay+Canh'}
            alt={product.name}
            className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-xs font-medium">Hết hàng</span>
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-2">
        <Link to={`/products/${product._id}`}>
          <h3 className="text-sm font-medium text-gray-800 line-clamp-1 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
          {product.categoryId?.name || 'Danh mục'}
        </p>
        
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-semibold text-primary">
            {formatPrice(product.price)}
          </span>
          
          <div className="flex gap-1">
            <button
              onClick={() => addToCart(product)}
              disabled={product.stock === 0}
              className="p-1.5 bg-primary text-white rounded-md hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiShoppingCart size={14} />
            </button>
            <Link
              to={`/products/${product._id}`}
              className="p-1.5 bg-gray-100 text-gray-600 rounded-md hover:bg-primary hover:text-white transition-colors"
            >
              <FiEye size={14} />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
