import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMinus, FiPlus, FiShoppingCart, FiChevronRight } from 'react-icons/fi';
import { GiTreeBranch } from 'react-icons/gi';
import SEO from '../components/SEO';
import publicApi from '../api/publicApi';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await publicApi.getProduct(id);
      setProduct(res.data.data);
    } catch (error) {
      console.error('Error:', error);
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product && product.stock > 0) {
      addToCart(product, quantity);
      navigate('/cart');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-8"
    >
      {product && (
        <SEO
          title={product.name}
          description={product.description || `Buy ${product.name} at Zuna Tungviet. Premium ornamental plant for home, office, or garden decoration.`}
          keywords={`${product.name}, ${product.categoryId?.name || 'plants'}, ornamental plants, garden`}
          image={product.images?.[0]}
          url={`/products/${product._id}`}
          type="product"
        />
      )}
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-2 py-2">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <a href="/" className="hover:text-primary">Trang chủ</a>
            <FiChevronRight size={12} />
            <a href="/products" className="hover:text-primary">Sản phẩm</a>
            <FiChevronRight size={12} />
            <span className="text-primary">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 py-4">
        <div className="bg-white rounded-lg overflow-hidden">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Image */}
            <div className="relative">
              <img
                src={product.imageUrl || 'https://via.placeholder.com/500'}
                alt={product.name}
                className="w-full h-64 md:h-96 object-cover"
              />
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-lg font-medium">Hết hàng</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4">
              <div className="flex items-center gap-1 text-xs text-primary mb-2">
                <GiTreeBranch size={14} />
                <span>{product.categoryId?.name || 'Danh mục'}</span>
              </div>

              <h1 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h1>
              
              <p className="text-2xl font-bold text-primary mb-3">
                {formatPrice(product.price)}
              </p>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-gray-500">Kho:</span>
                <span className={`text-xs font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {product.stock > 0 ? `${product.stock} sản phẩm` : 'Hết hàng'}
                </span>
              </div>

              {/* Description */}
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-700 mb-1">Mô tả</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {product.description || 'Không có mô tả'}
                </p>
              </div>

              {/* Quantity */}
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-700 mb-1">Số lượng</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-50"
                  >
                    <FiMinus size={14} />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                    className="w-16 h-8 text-center border rounded text-sm"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-50"
                  >
                    <FiPlus size={14} />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <FiShoppingCart size={16} />
                  Thêm vào giỏ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductDetail;
