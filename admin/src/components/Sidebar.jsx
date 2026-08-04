import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome,
  FiPackage,
  FiGrid,
  FiShoppingBag,
  FiGlobe,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiChevronDown,
  FiUsers,
  FiMapPin,
  FiAward,
  FiMessageSquare,
  FiFileText,
  FiActivity,
} from 'react-icons/fi';
import { GiPlantRoots } from 'react-icons/gi';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [productsOpen, setProductsOpen] = useState(
    location.pathname.startsWith('/products')
  );
  const [settingsOpen, setSettingsOpen] = useState(
    location.pathname.startsWith('/settings/appearance')
  );

  const navItems = [
    { path: '/', icon: <FiHome size={18} />, label: 'Dashboard' },
    { path: '/markets', icon: <FiGlobe size={18} />, label: 'Thị trường' },
    { path: '/members', icon: <FiUsers size={18} />, label: 'Ban lãnh đạo' },
    { path: '/locations', icon: <FiMapPin size={18} />, label: 'Địa điểm' },
    { path: '/leadership', icon: <FiAward size={18} />, label: 'Leadership' },
    { path: '/quote-section', icon: <FiMessageSquare size={18} />, label: 'Bao gia' },
    { path: '/partners', icon: <FiUsers size={18} />, label: 'Doi tac / Khach hang' },
    { path: '/posts', icon: <FiFileText size={18} />, label: 'Bai viet' },
    { path: '/categories', icon: <FiGrid size={18} />, label: 'Danh mục' },
    { path: '/orders', icon: <FiShoppingBag size={18} />, label: 'Đơn hàng' },
    { path: '/analytics', icon: <FiActivity size={18} />, label: 'Thống kê truy cập' },
  ];

  const settingsChildren = [
    { path: '/settings/appearance', label: 'Tổng quan' },
    { path: '/settings/appearance/logo', label: 'Logo' },
    { path: '/settings/appearance/hero', label: 'Hero slider (Trang chủ)' },
    { path: '/settings/appearance/about', label: 'Giới thiệu' },
    { path: '/settings/appearance/footer', label: 'Liên hệ & Footer' },
    { path: '/settings/appearance/floating-contacts', label: 'Thanh liên hệ' },
  ];

  const isSettingsActive = location.pathname.startsWith('/settings/appearance');
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`bg-white border-r min-h-screen ${collapsed ? 'w-16' : 'w-56'} transition-all duration-300`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-3 border-b">
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2">
            <GiPlantRoots size={24} className="text-primary" />
            <span className="font-semibold text-primary text-sm">Admin</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <FiMenu size={18} className="text-gray-500" />
        </button>
      </div>

      {/* User */}
      {!collapsed && user && (
        <div className="p-3 border-b">
          <p className="text-xs font-medium truncate">{user.name}</p>
          <p className="text-xs text-gray-500 truncate">{user.email}</p>
        </div>
      )}

      {/* Nav */}
      <nav className="p-2 space-y-1">
        {/* Products dropdown */}
        {!collapsed && (
          <div>
            <button
              type="button"
              onClick={() => setProductsOpen((value) => !value)}
              className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors ${
                isActive('/products')
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-primary-50 hover:text-primary'
              }`}
            >
              <FiPackage size={18} />
              <span className="flex-1 text-left">Sản phẩm</span>
              <motion.span
                animate={{ rotate: productsOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <FiChevronDown size={14} />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {productsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="ml-4 mt-1 space-y-0.5 border-l border-gray-200 pl-2">
                    <Link
                      to="/products"
                      className={`block px-2 py-1.5 rounded-md text-xs transition-colors ${
                        location.pathname === '/products'
                          ? 'bg-primary-50 text-primary font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                      }`}
                    >
                      Danh sách sản phẩm
                    </Link>
                    <Link
                      to="/products/columns"
                      className={`block px-2 py-1.5 rounded-md text-xs transition-colors ${
                        location.pathname === '/products/columns'
                          ? 'bg-primary-50 text-primary font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                      }`}
                    >
                      Cột thuộc tính
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {collapsed && (
          <Link
            to="/products"
            className={`flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors ${
              isActive('/products')
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-primary-50 hover:text-primary'
            }`}
            title="Sản phẩm"
          >
            <FiPackage size={18} />
          </Link>
        )}

        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors ${
              isActive(item.path)
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-primary-50 hover:text-primary'
            }`}
          >
            {item.icon}
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}

        {/* Settings dropdown */}
        {!collapsed && (
          <div>
            <button
              type="button"
              onClick={() => setSettingsOpen((v) => !v)}
              className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors ${
                isSettingsActive
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-primary-50 hover:text-primary'
              }`}
            >
              <FiSettings size={18} />
              <span className="flex-1 text-left">Cài đặt giao diện</span>
              <motion.span
                animate={{ rotate: settingsOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <FiChevronDown size={14} />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {settingsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="ml-4 mt-1 space-y-0.5 border-l border-gray-200 pl-2">
                    {settingsChildren.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={`block px-2 py-1.5 rounded-md text-xs transition-colors ${
                          location.pathname === child.path
                            ? 'bg-primary-50 text-primary font-medium'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Collapsed: still allow click on Settings icon to go to overview */}
        {collapsed && (
          <Link
            to="/settings/appearance"
            className={`flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors ${
              isSettingsActive
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-primary-50 hover:text-primary'
            }`}
            title="Cài đặt giao diện"
          >
            <FiSettings size={18} />
          </Link>
        )}
      </nav>
    </motion.aside>
  );
};

export default Sidebar;