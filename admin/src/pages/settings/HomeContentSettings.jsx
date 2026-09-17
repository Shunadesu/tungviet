import { useEffect, useMemo, useState } from 'react';
import {
  FiSave,
  FiTrash2,
  FiPlus,
  FiArrowLeft,
  FiAward,
  FiMessageSquare,
  FiLayout,
  FiX,
  FiMove,
} from 'react-icons/fi';
import HeaderWithBreadcrumb from './HeaderWithBreadcrumb';
import SEO from '../../components/SEO';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../context/NotificationContext';
import { Link } from 'react-router-dom';

const SECTION_KEYS = [
  { key: 'hero', label: 'Hero slider', defaultLimit: 0 },
  { key: 'whyUs', label: 'Tại sao chọn chúng tôi', defaultLimit: 0 },
  { key: 'process', label: 'Quy trình', defaultLimit: 0 },
  { key: 'featuredProducts', label: 'Sản phẩm nổi bật', defaultLimit: 8 },
  { key: 'newProducts', label: 'Sản phẩm mới', defaultLimit: 4 },
  { key: 'popularProducts', label: 'Sản phẩm xem nhiều', defaultLimit: 4 },
  { key: 'markets', label: 'Thị trường', defaultLimit: 6 },
  { key: 'industries', label: 'Ngành hàng', defaultLimit: 0 },
  { key: 'fastFacts', label: 'Số liệu nổi bật', defaultLimit: 0 },
  { key: 'coreValues', label: 'Giá trị cốt lõi', defaultLimit: 0 },
  { key: 'certificates', label: 'Chứng nhận', defaultLimit: 0 },
  { key: 'testimonials', label: 'Đánh giá khách hàng', defaultLimit: 0 },
  { key: 'blog', label: 'Tin tức', defaultLimit: 3 },
  { key: 'partners', label: 'Đối tác & Khách hàng', defaultLimit: 0 },
  { key: 'members', label: 'Ban lãnh đạo', defaultLimit: 4 },
  { key: 'quoteSection', label: 'Yêu cầu báo giá', defaultLimit: 0 },
  { key: 'locations', label: 'Văn phòng', defaultLimit: 3 },
];

const defaultSections = () =>
  SECTION_KEYS.map((s, idx) => ({
    key: s.key,
    enabled: true,
    order: idx,
    title: { vi: '', en: '' },
    subtitle: { vi: '', en: '' },
    limit: s.defaultLimit,
  }));

const emptyCertificate = () => ({
  name: { vi: '', en: '' },
  description: { vi: '', en: '' },
  imageUrl: '',
  externalUrl: '',
  order: 0,
  active: true,
});

const emptyTestimonial = () => ({
  author: { vi: '', en: '' },
  role: { vi: '', en: '' },
  company: { vi: '', en: '' },
  quote: { vi: '', en: '' },
  avatarUrl: '',
  rating: 5,
  order: 0,
  active: true,
});

const Card = ({ title, icon, children, action }) => (
  <div className="card space-y-3">
    <div className="flex items-center justify-between border-b pb-2">
      <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
        <span className="text-primary">{icon}</span>
        {title}
      </h3>
      {action}
    </div>
    {children}
  </div>
);

const LocaleField = ({ value, onChange, placeholder, multiline = false }) => {
  const inputCls = 'input-field text-xs';
  return (
    <div className="grid grid-cols-2 gap-2">
      <input
        type="text"
        value={value?.vi || ''}
        onChange={(e) => onChange({ ...value, vi: e.target.value })}
        placeholder="Tiếng Việt"
        className={inputCls}
      />
      <input
        type="text"
        value={value?.en || ''}
        onChange={(e) => onChange({ ...value, en: e.target.value })}
        placeholder="English"
        className={inputCls}
      />
    </div>
  );
};

const CertificatesTab = ({ initial, onSave }) => {
  const [items, setItems] = useState(initial || []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { addNotification } = useNotification();

  const add = () => {
    setItems((prev) => [...prev, { ...emptyCertificate(), order: prev.length }]);
  };
  const update = (idx, item) => {
    setItems((prev) => {
      const next = [...prev];
      next[idx] = item;
      return next;
    });
  };
  const remove = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };
  const move = (idx, dir) => {
    setItems((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next.map((it, i) => ({ ...it, order: i }));
    });
  };

  const handleUpload = async (file, idx) => {
    setUploading(true);
    try {
      const res = await adminApi.uploadImage(file);
      const url = res?.data?.data?.url;
      if (url) {
        update(idx, { ...items[idx], imageUrl: url });
        addNotification('Upload logo chứng nhận thành công');
      }
    } catch (err) {
      addNotification('Upload thất bại', 'error');
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const sanitized = items.map((it, idx) => ({
        ...it,
        order: idx,
      }));
      const res = await adminApi.updateCertificates(sanitized);
      addNotification('Lưu chứng nhận thành công');
      onSave(res?.data?.data || sanitized);
    } catch (err) {
      addNotification('Lưu thất bại', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card
      title="Chứng nhận"
      icon={<FiAward size={16} />}
      action={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={add}
            className="btn-secondary text-xs flex items-center gap-1"
          >
            <FiPlus size={12} />
            Thêm
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="btn-primary text-xs flex items-center gap-1"
          >
            <FiSave size={12} />
            {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      }
    >
      <p className="text-[10px] text-gray-500">
        Logo chứng nhận hiển thị trên trang chủ (carousel) và trang About. Tối đa 12 chứng nhận.
      </p>
      <div className="space-y-2">
        {items.length === 0 && (
          <div className="text-xs text-gray-400 italic py-4 text-center border border-dashed rounded">
            Chưa có chứng nhận nào.
          </div>
        )}
        {items.map((item, idx) => (
          <div
            key={`cert-${idx}`}
            className="border border-gray-200 rounded p-3 bg-gray-50/40 space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-semibold text-gray-700">
                #{idx + 1}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(idx, -1)}
                  disabled={idx === 0}
                  className="p-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40"
                  title="Lên"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(idx, 1)}
                  disabled={idx === items.length - 1}
                  className="p-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40"
                  title="Xuống"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="p-1 rounded bg-red-50 text-red-600 hover:bg-red-100"
                  title="Xóa"
                >
                  <FiTrash2 size={12} />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-medium mb-0.5 text-gray-700">
                Tên (VI / EN)
              </label>
              <LocaleField
                value={item.name}
                onChange={(v) => update(idx, { ...item, name: v })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium mb-0.5 text-gray-700">
                Mô tả (VI / EN)
              </label>
              <LocaleField
                value={item.description}
                onChange={(v) => update(idx, { ...item, description: v })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium mb-0.5 text-gray-700">
                Logo / Hình ảnh
              </label>
              <div className="flex items-center gap-2">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="w-10 h-10 rounded object-cover border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded bg-gray-100 text-gray-400 flex items-center justify-center">
                    <FiAward size={14} />
                  </div>
                )}
                <label className="btn-secondary text-[10px] flex items-center gap-1 cursor-pointer">
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleUpload(f, idx);
                      e.target.value = '';
                    }}
                  />
                </label>
                <input
                  type="url"
                  value={item.imageUrl}
                  onChange={(e) => update(idx, { ...item, imageUrl: e.target.value })}
                  placeholder="Hoặc URL"
                  className="input-field text-[10px] flex-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 items-center">
              <input
                type="url"
                value={item.externalUrl}
                onChange={(e) =>
                  update(idx, { ...item, externalUrl: e.target.value })
                }
                placeholder="Link tham chiếu (tùy chọn)"
                className="input-field text-[10px]"
              />
              <label className="flex items-center gap-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={item.active !== false}
                  onChange={(e) =>
                    update(idx, { ...item, active: e.target.checked })
                  }
                  className="rounded w-3 h-3"
                />
                <span className="text-[10px] font-medium">Hiển thị</span>
              </label>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

const TestimonialsTab = ({ initial, onSave }) => {
  const [items, setItems] = useState(initial || []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { addNotification } = useNotification();

  const add = () => {
    setItems((prev) => [
      ...prev,
      { ...emptyTestimonial(), order: prev.length },
    ]);
  };
  const update = (idx, item) => {
    setItems((prev) => {
      const next = [...prev];
      next[idx] = item;
      return next;
    });
  };
  const remove = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };
  const move = (idx, dir) => {
    setItems((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next.map((it, i) => ({ ...it, order: i }));
    });
  };

  const handleUpload = async (file, idx) => {
    setUploading(true);
    try {
      const res = await adminApi.uploadImage(file);
      const url = res?.data?.data?.url;
      if (url) {
        update(idx, { ...items[idx], avatarUrl: url });
        addNotification('Upload avatar thành công');
      }
    } catch (err) {
      addNotification('Upload thất bại', 'error');
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const sanitized = items.map((it, idx) => ({
        ...it,
        order: idx,
        rating: Math.max(1, Math.min(5, Number(it.rating) || 5)),
      }));
      const res = await adminApi.updateTestimonials(sanitized);
      addNotification('Lưu đánh giá thành công');
      onSave(res?.data?.data || sanitized);
    } catch (err) {
      addNotification('Lưu thất bại', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card
      title="Đánh giá khách hàng"
      icon={<FiMessageSquare size={16} />}
      action={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={add}
            className="btn-secondary text-xs flex items-center gap-1"
          >
            <FiPlus size={12} />
            Thêm
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="btn-primary text-xs flex items-center gap-1"
          >
            <FiSave size={12} />
            {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      }
    >
      <p className="text-[10px] text-gray-500">
        Carousel đánh giá trên trang chủ. Mỗi đánh giá có tác giả, công ty, nội dung và rating 1-5.
      </p>
      <div className="space-y-2">
        {items.length === 0 && (
          <div className="text-xs text-gray-400 italic py-4 text-center border border-dashed rounded">
            Chưa có đánh giá nào.
          </div>
        )}
        {items.map((item, idx) => (
          <div
            key={`test-${idx}`}
            className="border border-gray-200 rounded p-3 bg-gray-50/40 space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-semibold text-gray-700">
                #{idx + 1}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(idx, -1)}
                  disabled={idx === 0}
                  className="p-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(idx, 1)}
                  disabled={idx === items.length - 1}
                  className="p-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="p-1 rounded bg-red-50 text-red-600 hover:bg-red-100"
                >
                  <FiTrash2 size={12} />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-medium mb-0.5 text-gray-700">
                Tác giả (VI / EN)
              </label>
              <LocaleField
                value={item.author}
                onChange={(v) => update(idx, { ...item, author: v })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium mb-0.5 text-gray-700">
                Chức danh (VI / EN)
              </label>
              <LocaleField
                value={item.role}
                onChange={(v) => update(idx, { ...item, role: v })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium mb-0.5 text-gray-700">
                Công ty (VI / EN)
              </label>
              <LocaleField
                value={item.company}
                onChange={(v) => update(idx, { ...item, company: v })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium mb-0.5 text-gray-700">
                Nội dung (VI / EN)
              </label>
              <LocaleField
                value={item.quote}
                onChange={(v) => update(idx, { ...item, quote: v })}
                multiline
              />
            </div>
            <div className="grid grid-cols-3 gap-2 items-end">
              <div className="col-span-2">
                <label className="block text-[10px] font-medium mb-0.5 text-gray-700">
                  Avatar
                </label>
                <div className="flex items-center gap-2">
                  {item.avatarUrl ? (
                    <img
                      src={item.avatarUrl}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover border"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                      <FiMessageSquare size={12} />
                    </div>
                  )}
                  <label className="btn-secondary text-[10px] cursor-pointer">
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleUpload(f, idx);
                        e.target.value = '';
                      }}
                    />
                  </label>
                  <input
                    type="url"
                    value={item.avatarUrl}
                    onChange={(e) =>
                      update(idx, { ...item, avatarUrl: e.target.value })
                    }
                    placeholder="Hoặc URL"
                    className="input-field text-[10px] flex-1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-medium mb-0.5 text-gray-700">
                  Rating (1-5)
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={item.rating ?? 5}
                  onChange={(e) =>
                    update(idx, {
                      ...item,
                      rating: Math.max(1, Math.min(5, Number(e.target.value) || 5)),
                    })
                  }
                  className="input-field text-xs"
                />
              </div>
            </div>
            <label className="flex items-center gap-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={item.active !== false}
                onChange={(e) =>
                  update(idx, { ...item, active: e.target.checked })
                }
                className="rounded w-3 h-3"
              />
              <span className="text-[10px] font-medium">Hiển thị</span>
            </label>
          </div>
        ))}
      </div>
    </Card>
  );
};

const HomeSectionsTab = ({ initial, onSave }) => {
  const [items, setItems] = useState(
    initial && initial.length > 0 ? initial : defaultSections()
  );
  const [saving, setSaving] = useState(false);
  const { addNotification } = useNotification();

  const update = (idx, patch) => {
    setItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      const sanitized = items
        .filter((s) => s.key)
        .map((s, idx) => ({ ...s, order: idx }));
      const res = await adminApi.updateHomeSections(sanitized);
      addNotification('Lưu cấu hình thành công');
      onSave(res?.data?.data || sanitized);
    } catch (err) {
      addNotification('Lưu thất bại', 'error');
    } finally {
      setSaving(false);
    }
  };

  const labelOf = (key) =>
    SECTION_KEYS.find((s) => s.key === key)?.label || key;

  return (
    <Card
      title="Bật / tắt section trang chủ"
      icon={<FiLayout size={16} />}
      action={
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="btn-primary text-xs flex items-center gap-1"
        >
          <FiSave size={12} />
          {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
        </button>
      }
    >
      <p className="text-[10px] text-gray-500">
        Cho phép ẩn/hiện từng section trên trang chủ và ghi đè tiêu đề, phụ đề, số lượng item. Số lượng = 0 nghĩa là dùng mặc định.
      </p>
      <div className="space-y-2">
        {items
          .slice()
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((item) => {
            const idx = items.findIndex((it) => it.key === item.key);
            return (
              <div
                key={item.key}
                className="border border-gray-200 rounded p-3 bg-white space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiMove className="text-gray-400" size={12} />
                    <span className="text-xs font-semibold text-gray-700">
                      {labelOf(item.key)}
                    </span>
                    <code className="text-[10px] text-gray-400">{item.key}</code>
                  </div>
                  <label className="flex items-center gap-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={item.enabled !== false}
                      onChange={(e) =>
                        update(idx, { enabled: e.target.checked })
                      }
                      className="rounded w-3 h-3"
                    />
                    <span className="text-[10px] font-medium">
                      {item.enabled !== false ? 'Bật' : 'Tắt'}
                    </span>
                  </label>
                </div>
                <div className="grid md:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-medium mb-0.5 text-gray-700">
                      Tiêu đề (VI / EN)
                    </label>
                    <LocaleField
                      value={item.title}
                      onChange={(v) => update(idx, { title: v })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium mb-0.5 text-gray-700">
                      Phụ đề (VI / EN)
                    </label>
                    <LocaleField
                      value={item.subtitle}
                      onChange={(v) => update(idx, { subtitle: v })}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div>
                    <label className="block text-[10px] font-medium mb-0.5 text-gray-700">
                      Giới hạn hiển thị
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={item.limit ?? 0}
                      onChange={(e) =>
                        update(idx, {
                          limit: Math.max(0, Number(e.target.value) || 0),
                        })
                      }
                      className="input-field w-20 text-xs"
                    />
                  </div>
                  <div className="text-[10px] text-gray-400 italic mt-4">
                    0 = dùng mặc định của section
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </Card>
  );
};

const HomeContentSettings = () => {
  const [activeTab, setActiveTab] = useState('homeSections');
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [homeSections, setHomeSections] = useState([]);
  const { addNotification } = useNotification();

  useEffect(() => {
    (async () => {
      try {
        const res = await adminApi.getSiteConfig();
        const data = res?.data?.data || {};
        setCertificates(Array.isArray(data.certificates) ? data.certificates : []);
        setTestimonials(Array.isArray(data.testimonials) ? data.testimonials : []);
        setHomeSections(
          Array.isArray(data.homeSections) && data.homeSections.length > 0
            ? data.homeSections
            : defaultSections()
        );
      } catch (err) {
        addNotification('Không tải được cấu hình', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [addNotification]);

  const tabs = useMemo(
    () => [
      { id: 'homeSections', label: 'Sections', icon: <FiLayout size={12} /> },
      { id: 'certificates', label: 'Chứng nhận', icon: <FiAward size={12} /> },
      { id: 'testimonials', label: 'Đánh giá', icon: <FiMessageSquare size={12} /> },
    ],
    []
  );

  return (
    <>
      <SEO
        title="Cài đặt trang chủ"
        description="Quản lý sections, chứng nhận, đánh giá hiển thị trên trang chủ"
        url="/settings/appearance/home-content"
      />
      <HeaderWithBreadcrumb
        title="Nội dung trang chủ"
        breadcrumbs={[
          { label: 'Cài đặt giao diện', path: '/settings/appearance' },
          { label: 'Nội dung trang chủ' },
        ]}
        actions={
          <Link
            to="/settings/appearance"
            className="btn-secondary flex items-center gap-1.5 text-xs"
          >
            <FiArrowLeft size={14} />
            Quay lại
          </Link>
        }
      />
      <div className="p-4 max-w-5xl mx-auto space-y-4">
        <div className="flex gap-2 border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 text-xs font-medium flex items-center gap-1 border-b-2 -mb-px transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <>
            {activeTab === 'homeSections' && (
              <HomeSectionsTab
                initial={homeSections}
                onSave={setHomeSections}
              />
            )}
            {activeTab === 'certificates' && (
              <CertificatesTab
                initial={certificates}
                onSave={setCertificates}
              />
            )}
            {activeTab === 'testimonials' && (
              <TestimonialsTab
                initial={testimonials}
                onSave={setTestimonials}
              />
            )}
          </>
        )}
      </div>
    </>
  );
};

export default HomeContentSettings;
