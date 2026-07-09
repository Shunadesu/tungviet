import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiHome, 
  FiPackage, 
  FiGrid, 
  FiShoppingBag, 
  FiLogOut,
  FiMenu
} from 'react-icons/fi';
import { GiPlantRoots } from 'react-icons/gi';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { path: '/', icon: <FiHome size={18} />, label: 'Dashboard' },
    { path: '/products', icon: <FiPackage size={18} />, label: 'Sản phẩm' },
    { path: '/categories', icon: <FiGrid size={18} />, label: 'Danh mục' },
    { path: '/orders', icon: <FiShoppingBag size={18} />, label: 'Đơn hàng' },
  ];

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
      </nav>

      {/* Logout */}
      <div className="absolute bottom-0 left-0 right-0 p-2 border-t">
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-2 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
        >
          <FiLogOut size={18} />
          {!collapsed && <span>Đăng xuất</span>}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
