import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiShoppingCart, FiUser, FiMenu } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useState } from 'react';

const Header = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white shadow-sm sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-2">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl">🌿</span>
            <span className="text-base font-semibold text-primary">Zuna Tungviet</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-4">
            <Link to="/" className="text-sm text-gray-600 hover:text-primary transition-colors">Trang chủ</Link>
            <Link to="/products" className="text-sm text-gray-600 hover:text-primary transition-colors">Sản phẩm</Link>
            <Link to="/about" className="text-sm text-gray-600 hover:text-primary transition-colors">Giới thiệu</Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link to="/search" className="p-2 text-gray-500 hover:text-primary transition-colors">
              <FiSearch size={18} />
            </Link>
            
            <Link to="/cart" className="p-2 text-gray-500 hover:text-primary transition-colors relative">
              <FiShoppingCart size={18} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative group">
                <button className="p-2 text-gray-500 hover:text-primary transition-colors">
                  <FiUser size={18} />
                </button>
                <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="p-2 border-b">
                    <p className="text-xs font-medium truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <Link to="/orders" className="block px-3 py-2 text-xs hover:bg-gray-50">Đơn hàng</Link>
                  <button onClick={logout} className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-gray-50">Đăng xuất</button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="text-xs font-medium text-primary hover:underline">Đăng nhập</Link>
            )}

            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-500">
              <FiMenu size={18} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden py-2 border-t"
          >
            <Link to="/" className="block py-2 text-sm">Trang chủ</Link>
            <Link to="/products" className="block py-2 text-sm">Sản phẩm</Link>
            <Link to="/about" className="block py-2 text-sm">Giới thiệu</Link>
          </motion.nav>
        )}
      </div>
    </motion.header>
  );
};

export default Header;
