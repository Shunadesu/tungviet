import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome,
  FiPackage,
  FiGrid,
  FiShoppingBag,
  FiMenu,
  FiChevronDown,
  FiChevronRight,
  FiMapPin,
  FiAward,
  FiMessageSquare,
  FiFileText,
  FiActivity,
  FiLayout,
  FiPhone,
  FiSliders,
  FiBookOpen,
  FiUserCheck,
  FiMail,
  FiFolder,
  FiLayers,
  FiList,
} from 'react-icons/fi';
import { GiPlantRoots } from 'react-icons/gi';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

// ── Menu configs ─────────────────────────────────────────────────────────────

const productsMenu = {
  type: 'group',
  key: 'products',
  label: 'Danh mục sản phẩm',
  icon: <FiPackage size={18} />,
  defaultPath: '/main-trees',
  isActive: (pathname) =>
    pathname.startsWith('/products') ||
    pathname.startsWith('/main-trees') ||
    pathname.startsWith('/market-trees') ||
    pathname.startsWith('/categories'),
  children: [
    { type: 'item', key: 'main-trees', label: 'Ngành hàng', path: '/main-trees', icon: <FiLayers size={14} /> },
    { type: 'item', key: 'market-trees', label: 'Cây ngành', path: '/market-trees', icon: <FiList size={14} /> },
    { type: 'item', key: 'categories', label: 'Product line', path: '/categories', icon: <FiGrid size={14} /> },
    {
      type: 'group',
      key: 'products-list',
      label: 'Sản phẩm',
      children: [
        { type: 'item', key: 'products', label: 'Danh sách sản phẩm', path: '/products', icon: <FiPackage size={14} /> },
        { type: 'item', key: 'products-columns', label: 'Cột thuộc tính', path: '/products/columns', icon: <FiSliders size={14} /> },
      ],
    },
  ],
};

const postsMenu = {
  type: 'group',
  key: 'posts',
  label: 'Tin tức',
  icon: <FiFileText size={18} />,
  defaultPath: '/posts',
  isActive: (pathname) =>
    pathname.startsWith('/posts') || pathname.startsWith('/post-categories'),
  children: [
    { type: 'item', key: 'post-categories', label: 'Danh mục tin tức', path: '/post-categories', icon: <FiFolder size={14} /> },
    { type: 'item', key: 'posts', label: 'Bài viết', path: '/posts', icon: <FiFileText size={14} /> },
  ],
};

const interfaceMenu = {
  type: 'group',
  key: 'interface',
  label: 'Quản lý giao diện',
  icon: <FiLayout size={18} />,
  defaultPath: '/settings/appearance',
  isActive: (pathname) =>
    pathname.startsWith('/settings/appearance') ||
    pathname.startsWith('/members') ||
    pathname.startsWith('/leadership') ||
    pathname.startsWith('/quote-section') ||
    pathname.startsWith('/partners'),
  children: [
    {
      type: 'group',
      key: 'brand',
      label: 'Thương hiệu & Header',
      children: [
        { type: 'item', key: 'brand-seo', label: 'Thương hiệu & SEO', path: '/settings/appearance/seo', icon: <FiAward size={14} /> },
        { type: 'item', key: 'floating', label: 'Thanh liên hệ', path: '/settings/appearance/floating-contacts', icon: <FiPhone size={14} /> },
      ],
    },
    {
      type: 'group',
      key: 'home',
      label: 'Trang chủ',
      children: [
        { type: 'item', key: 'hero', label: 'Hero slider', path: '/settings/appearance/hero', icon: <FiSliders size={14} /> },
        { type: 'item', key: 'partners', label: 'Đối tác / Khách hàng', path: '/partners', icon: <FiFileText size={14} /> },
        { type: 'item', key: 'quote', label: 'Báo giá (hiển thị)', path: '/quote-section', icon: <FiMessageSquare size={14} /> },
      ],
    },
    {
      type: 'group',
      key: 'about-page',
      label: 'Trang giới thiệu',
      children: [
        { type: 'item', key: 'about', label: 'Nội dung giới thiệu', path: '/settings/appearance/about', icon: <FiBookOpen size={14} /> },
        { type: 'item', key: 'members', label: 'Ban lãnh đạo', path: '/members', icon: <FiUserCheck size={14} /> },
        { type: 'item', key: 'leadership', label: 'Leadership', path: '/leadership', icon: <FiAward size={14} /> },
      ],
    },
    {
      type: 'group',
      key: 'footer',
      label: 'Liên hệ & Footer',
      children: [
        { type: 'item', key: 'footer', label: 'Liên hệ & Footer', path: '/settings/appearance/footer', icon: <FiMail size={14} /> },
      ],
    },
  ],
};

const standaloneItems = [
  { path: '/locations', icon: <FiMapPin size={18} />, label: 'Địa điểm' },
  { path: '/orders', icon: <FiShoppingBag size={18} />, label: 'Đơn hàng' },
  { path: '/analytics', icon: <FiActivity size={18} />, label: 'Thống kê truy cập' },
];

const isItemActive = (pathname, path) =>
  pathname === path || pathname.startsWith(path + '/');

const findActiveGroupKey = (node, pathname) => {
  if (node.type === 'item') return null;
  if (!node.children) return null;
  for (const child of node.children) {
    if (child.type === 'item') {
      if (isItemActive(pathname, child.path)) return node.key;
    } else if (findActiveGroupKey(child, pathname)) {
      return node.key;
    }
  }
  return null;
};

// ── Sidebar ──────────────────────────────────────────────────────────────────

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState(() => {
    const activeKeys = [productsMenu, postsMenu, interfaceMenu]
      .map((m) => findActiveGroupKey(m, location.pathname))
      .filter(Boolean);
    return new Set(activeKeys);
  });

  const toggleKey = (key) => {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // NavNode render đệ quy cho các item/group lồng nhau
  const NavNode = ({ node, depth = 1 }) => {
    if (node.type === 'item') {
      const active = isItemActive(location.pathname, node.path);
      return (
        <Link
          to={node.path}
          className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors ${
            active
              ? 'bg-primary-50 text-primary font-medium'
              : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
          }`}
        >
          {node.icon}
          <span className="truncate">{node.label}</span>
        </Link>
      );
    }

    const open = openKeys.has(node.key);
    const childActiveKey = findActiveGroupKey(node, location.pathname);

    return (
      <div>
        <button
          type="button"
          onClick={() => toggleKey(node.key)}
          className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs transition-colors ${
            childActiveKey
              ? 'text-primary font-medium'
              : 'text-gray-600 hover:text-primary'
          }`}
        >
          <motion.span
            animate={{ rotate: open ? 90 : 0 }}
            transition={{ duration: 0.15 }}
            className="flex-shrink-0"
          >
            <FiChevronRight size={12} />
          </motion.span>
          <span className="flex-1 text-left truncate">{node.label}</span>
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="ml-3 mt-0.5 space-y-0.5 border-l border-gray-100 pl-2">
                {node.children.map((child) => (
                  <NavNode key={child.key} node={child} depth={depth + 1} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // TopLevelMenu component tái sử dụng cho mọi top-level dropdown
  const TopLevelMenu = ({ menu }) => {
    const active = menu.isActive(location.pathname);
    const open = openKeys.has(menu.key);

    if (collapsed) {
      return (
        <Link
          to={menu.defaultPath}
          className={`flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors ${
            active
              ? 'bg-primary text-white'
              : 'text-gray-600 hover:bg-primary-50 hover:text-primary'
          }`}
          title={menu.label}
        >
          {menu.icon}
        </Link>
      );
    }

    return (
      <div>
        <button
          type="button"
          onClick={() => toggleKey(menu.key)}
          className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors ${
            active
              ? 'bg-primary text-white'
              : 'text-gray-600 hover:bg-primary-50 hover:text-primary'
          }`}
        >
          {menu.icon}
          <span className="flex-1 text-left">{menu.label}</span>
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <FiChevronDown size={14} />
          </motion.span>
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="ml-4 mt-1 space-y-1 border-l border-gray-200 pl-2">
                {menu.children.map((child) => (
                  <NavNode key={child.key} node={child} depth={1} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`bg-white border-r min-h-screen ${collapsed ? 'w-16' : 'w-56'} transition-all duration-300 flex flex-col`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-3 border-b flex-shrink-0">
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
        <div className="p-3 border-b flex-shrink-0">
          <p className="text-xs font-medium truncate">{user.name}</p>
          <p className="text-xs text-gray-500 truncate">{user.email}</p>
        </div>
      )}

      {/* Nav */}
      <nav className="p-2 space-y-1 flex-1 overflow-y-auto">
        {/* Dashboard */}
        <Link
          to="/"
          className={`flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors ${
            location.pathname === '/'
              ? 'bg-primary text-white'
              : 'text-gray-600 hover:bg-primary-50 hover:text-primary'
          }`}
        >
          <FiHome size={18} />
          {!collapsed && <span>Dashboard</span>}
        </Link>

        {/* Top-level dropdowns */}
        {[productsMenu, postsMenu, interfaceMenu].map((menu) => (
          <TopLevelMenu key={menu.key} menu={menu} />
        ))}

        {/* Standalone items */}
        {standaloneItems.map((item) => {
          const active = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-primary-50 hover:text-primary'
              }`}
              title={collapsed ? item.label : undefined}
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      {!collapsed && user && (
        <div className="p-2 border-t flex-shrink-0">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <FiAward size={18} />
            <span>Đăng xuất</span>
          </button>
        </div>
      )}
    </motion.aside>
  );
};

export default Sidebar;
