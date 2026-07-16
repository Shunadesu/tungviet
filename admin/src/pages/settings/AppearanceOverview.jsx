import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiImage, FiEdit2, FiArrowRight, FiSliders, FiSearch } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Header from '../../components/Header';
import SEO from '../../components/SEO';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../context/NotificationContext';

const cards = [
  { path: 'logo', title: 'Logo', desc: 'Logo hien thi tren header cua trang client.', icon: <FiImage size={20} />, color: 'bg-green-50 text-green-700' },
  { path: 'hero', title: 'Hero slider (Trang chu)', desc: 'Slider anh nen o dau trang chu (Swiper h-[90vh]). Khi chua co slide, hien thi gradient dong.', icon: <FiSliders size={20} />, color: 'bg-amber-50 text-amber-700' },
  { path: 'footer', title: 'Lien he & Footer', desc: 'SDT, email, dia chi, mo ta cong ty va copyright.', icon: <FiEdit2 size={20} />, color: 'bg-purple-50 text-purple-700' },
  { path: 'seo', title: 'SEO & Favicon', desc: 'Meta tags, Open Graph, favicon cho site.', icon: <FiSearch size={20} />, color: 'bg-blue-50 text-blue-700' },
];

export default function AppearanceOverview() {
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState(null);
  const [footerCopyright, setFooterCopyright] = useState(null);
  const [heroCount, setHeroCount] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminApi.getSiteConfig();
        const data = res.data.data || {};
        setLogoUrl(data.logoUrl || null);
        setFooterCopyright(data.footer?.copyright || null);
        setHeroCount(Array.isArray(data.heroSlides) ? data.heroSlides.length : 0);
      } catch (err) {
        addNotification('Không tải được cấu hình', 'error');
      } finally { setLoading(false); }
    })();
  }, []);

  const summaries = {
    logo: logoUrl ? 'Đã upload logo' : 'Chưa có logo (đang dùng mặc định)',
    hero: heroCount > 0 ? `${heroCount} slide` : 'Chưa có slide (đang dùng gradient động)',
    footer: footerCopyright || 'Chưa cấu hình',
  };

  return (
    <>
      <SEO title="Cài đặt giao diện" description="Quản lý logo, hero slider, footer" url="/settings/appearance" />
      <Header title="Cài đặt giao diện" />
      <div className="p-4 max-w-3xl">
        <p className="text-xs text-gray-500 mb-3">
          Quản lý logo, hero slider trang chủ và thông tin liên hệ footer. Thay đổi hiển thị trên client sau khi cache hết hạn (tối đa 5 phút).
        </p>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-1 gap-3">
            {cards.map((card, idx) => (
              <motion.div key={card.path} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <Link to={card.path} className="card flex items-center gap-3 p-4 hover:border-primary hover:shadow-sm transition-all group">
                  <div className={`p-3 rounded-lg ${card.color}`}>{card.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900">{card.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{card.desc}</p>
                    <p className="text-xs text-gray-400 mt-1 italic truncate">{summaries[card.path]}</p>
                  </div>
                  <FiArrowRight size={16} className="text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}