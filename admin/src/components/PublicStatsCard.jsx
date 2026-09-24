import {
  FiPackage,
  FiMap,
  FiAward,
  FiUsers,
  FiGrid,
  FiFileText,
} from 'react-icons/fi';

const ITEMS = [
  { key: 'products',   label: 'Sản phẩm',     icon: FiPackage,  color: 'text-blue-600' },
  { key: 'markets',    label: 'Thị trường',    icon: FiMap,      color: 'text-purple-600' },
  { key: 'partners',   label: 'Đối tác',      icon: FiAward,    color: 'text-orange-600' },
  { key: 'customers',  label: 'Khách hàng',    icon: FiUsers,    color: 'text-green-600' },
  { key: 'industries', label: 'Ngành',         icon: FiGrid,     color: 'text-teal-600' },
  { key: 'posts',      label: 'Bài viết',      icon: FiFileText, color: 'text-pink-600' },
];

const PublicStatsCard = ({ stats }) => {
  return (
    <div className="grid grid-cols-3 gap-2 h-full">
      {ITEMS.map(({ key, label, icon: Icon, color }) => (
        <div
          key={key}
          className="flex flex-col items-center justify-center p-2 bg-gray-50 rounded-lg"
        >
          <Icon size={16} className={`${color} mb-1`} />
          <p className="text-sm font-bold text-gray-800">
            {(stats?.[key] || 0).toLocaleString('vi-VN')}
          </p>
          <p className="text-[10px] text-gray-500 text-center">{label}</p>
        </div>
      ))}
    </div>
  );
};

export default PublicStatsCard;
