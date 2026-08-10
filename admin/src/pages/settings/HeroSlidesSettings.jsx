import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiArrowUp, FiArrowDown, FiEye, FiEyeOff } from 'react-icons/fi';
import HeaderWithBreadcrumb from './HeaderWithBreadcrumb';
import HeroSlideForm, { emptySlide } from './HeroSlideForm';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../context/NotificationContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export default function HeroSlidesSettings() {
  const { addNotification } = useNotification();
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptySlide());
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadSlides(); /* eslint-disable-next-line */ }, []);

  const loadSlides = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getSiteConfig();
      const list = (res.data.data?.heroSlides || []).slice();
      list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setSlides(list);
    } catch (err) {
      addNotification('Không tải được danh sách slide', 'error');
    } finally { setLoading(false); }
  };

  const openCreate = () => { setForm(emptySlide()); setEditing('new'); };
  const openEdit = (slide) => {
    setForm({
      ...emptySlide(),
      ...slide,
      eyebrow: slide.eyebrow || { vi: '', en: '' },
      ctaPrimary: slide.ctaPrimary || null,
      ctaSecondary: slide.ctaSecondary || null,
      active: slide.active !== false,
    });
    setEditing(String(slide._id || ''));
  };
  const closeForm = () => { setEditing(null); setForm(emptySlide()); };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (editing === 'new') {
        await adminApi.addHeroSlide(form);
        addNotification('Thêm slide thành công');
      } else if (editing) {
        await adminApi.updateHeroSlide(String(editing), form);
        addNotification('Cập nhật slide thành công');
      } else {
        addNotification('Slide không hợp lệ', 'error');
      }
      closeForm();
      await loadSlides();
    } catch (err) {
      addNotification(err.response?.data?.message || 'Lưu slide thất bại', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async (slide) => {
    const id = String(slide._id || '');
    if (!id || id === '[object Object]') {
      addNotification('Slide không hợp lệ, vui lòng tải lại trang', 'error');
      await loadSlides();
      return;
    }
    if (!window.confirm(`Xoá slide "${slide.title?.vi || slide.imageUrl}"?`)) return;
    try {
      await adminApi.deleteHeroSlide(id);
      addNotification('Xoá slide thành công');
      await loadSlides();
    } catch (err) {
      addNotification(err.response?.data?.message || 'Xoá slide thất bại', 'error');
    }
  };

  const toggleActive = async (slide) => {
    const id = String(slide._id || '');
    if (!id || id === '[object Object]') {
      addNotification('Slide không hợp lệ, vui lòng tải lại trang', 'error');
      await loadSlides();
      return;
    }
    try {
      await adminApi.updateHeroSlide(id, { active: !(slide.active !== false) });
      await loadSlides();
    } catch (err) {
      addNotification(err.response?.data?.message || 'Cập nhật trạng thái thất bại', 'error');
    }
  };

  const move = async (index, delta) => {
    const next = slides.slice();
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setSlides(next);
    const ids = next.map((s) => String(s._id || '')).filter((id) => id && id !== '[object Object]');
    try { await adminApi.reorderHeroSlides(ids); }
    catch (err) {
      addNotification(err.response?.data?.message || 'Sắp xếp thất bại', 'error');
      await loadSlides();
    }
  };

  const imageUrl = (url) => {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    return `${API_BASE_URL}${url}`;
  };

  const variantLabel = (v) => {
    if (v === 'split') return 'Split';
    if (v === 'compact') return 'Compact';
    return 'Fullscreen';
  };

  return (
    <>
      <HeaderWithBreadcrumb title="Hero slider trang chủ" />
      <div className="p-4 pt-3 max-w-4xl">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-500">
            Quản lý các slide hiển thị ở đầu trang chủ. Thay đổi hiển thị trên client sau khi cache hết hạn (tối đa 5 phút).
          </p>
          <button type="button" onClick={openCreate} className="btn-primary flex items-center gap-1 text-xs whitespace-nowrap">
            <FiPlus size={14} /> Thêm slide
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>
        ) : slides.length === 0 ? (
          <div className="card text-center py-10 text-xs text-gray-500">
            Chưa có slide nào. Bấm "Thêm slide" để tạo slide đầu tiên. Khi chưa có slide, trang chủ sẽ hiển thị hero mặc định.
          </div>
        ) : (
          <div className="space-y-2">
            {slides.map((slide, idx) => (
              <div key={slide._id} className="card flex items-center gap-3 p-3">
                <img src={imageUrl(slide.imageUrl)} alt={slide.title?.vi || ''} className="w-32 h-16 object-cover rounded border bg-gray-50 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{slide.title?.vi || <em className="text-gray-400">(chưa có tiêu đề VI)</em>}</p>
                  {slide.description?.vi && <p className="text-xs text-gray-500 truncate">{slide.description.vi}</p>}
                  {slide.title?.en && <p className="text-xs text-gray-400 truncate">{slide.title.en}</p>}
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${slide.active !== false ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                      {slide.active !== false ? 'Hiển thị' : 'Đã ẩn'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700">
                      {variantLabel(slide.variant)}
                    </span>
                    <span className="text-[10px] text-gray-400">Thứ tự: {slide.order ?? idx}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button type="button" onClick={() => move(idx, -1)} disabled={idx === 0} className="p-2 text-gray-500 hover:text-primary disabled:opacity-30" title="Lên"><FiArrowUp size={14} /></button>
                  <button type="button" onClick={() => move(idx, 1)} disabled={idx === slides.length - 1} className="p-2 text-gray-500 hover:text-primary disabled:opacity-30" title="Xuống"><FiArrowDown size={14} /></button>
                  <button type="button" onClick={() => toggleActive(slide)} className="p-2 text-gray-500 hover:text-primary" title={slide.active !== false ? 'Ẩn slide' : 'Hiện slide'}>
                    {slide.active !== false ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                  </button>
                  <button type="button" onClick={() => openEdit(slide)} className="p-2 text-gray-500 hover:text-primary" title="Sửa"><FiEdit2 size={14} /></button>
                  <button type="button" onClick={() => handleDelete(slide)} className="p-2 text-red-500 hover:bg-red-50 rounded" title="Xoá"><FiTrash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editing && (
        <HeroSlideForm
          form={form}
          setForm={setForm}
          editing={editing}
          onSubmit={handleSubmit}
          onClose={closeForm}
          saving={saving}
          addNotification={addNotification}
        />
      )}
    </>
  );
}