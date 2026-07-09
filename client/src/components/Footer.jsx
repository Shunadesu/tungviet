import { Link } from 'react-router-dom';
import { FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import { GiPlantRoots, GiTreeBranch } from 'react-icons/gi';

const Footer = () => {
  return (
    <footer className="bg-primary-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-2 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <GiPlantRoots size={24} />
              <span className="text-base font-semibold">Zuna Tungviet</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Chuyên cung cấp các loại cây cảnh chất lượng cao, từ cây trong nhà đến cây ngoài trời, mang thiên nhiên đến gần bạn hơn.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <GiTreeBranch size={16} />
              Liên kết nhanh
            </h3>
            <ul className="space-y-1">
              <li><Link to="/" className="text-xs text-gray-300 hover:text-white transition-colors">Trang chủ</Link></li>
              <li><Link to="/products" className="text-xs text-gray-300 hover:text-white transition-colors">Sản phẩm</Link></li>
              <li><Link to="/about" className="text-xs text-gray-300 hover:text-white transition-colors">Giới thiệu</Link></li>
              <li><Link to="/contact" className="text-xs text-gray-300 hover:text-white transition-colors">Liên hệ</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Danh mục</h3>
            <ul className="space-y-1">
              <li><Link to="/products?category=cay-canh-trong-nha" className="text-xs text-gray-300 hover:text-white transition-colors">Cây cảnh trong nhà</Link></li>
              <li><Link to="/products?category=cay-canh-ngoai-troi" className="text-xs text-gray-300 hover:text-white transition-colors">Cây cảnh ngoài trời</Link></li>
              <li><Link to="/products?category=cay-an-qua" className="text-xs text-gray-300 hover:text-white transition-colors">Cây ăn quả</Link></li>
              <li><Link to="/products?category=cay-hoa" className="text-xs text-gray-300 hover:text-white transition-colors">Cây hoa</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Liên hệ</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-xs text-gray-300">
                <FiPhone size={14} />
                0123 456 789
              </li>
              <li className="flex items-center gap-2 text-xs text-gray-300">
                <FiMail size={14} />
                contact@zuna.vn
              </li>
              <li className="flex items-start gap-2 text-xs text-gray-300">
                <FiMapPin size={14} className="mt-0.5" />
                123 Đường Cây Xanh, TP.HCM
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-700 mt-6 pt-4 text-center">
          <p className="text-xs text-gray-400">© 2024 Zuna Tungviet. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
