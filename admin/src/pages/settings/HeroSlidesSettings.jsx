import { useEffect, useState, useRef } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiArrowUp, FiArrowDown, FiX, FiUpload, FiEye, FiEyeOff, FiSave } from 'react-icons/fi';
import HeaderWithBreadcrumb from './HeaderWithBreadcrumb';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../context/NotificationContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const emptySlide = () => ({ imageUrl: '', title: { vi: '', en: '' }, active: true });

export default function HeroSlidesSettings() {
  const { addNotification } = useNotification();
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptySlide());
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

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
      imageUrl: slide.imageUrl || '',
      title: { vi: slide.title?.vi || '', en: slide.title?.en || '' },
      active: slide.active !== false,
    });
    setEditing(slide._id);
  };
  const closeForm = () => { setEditing(null); setForm(emptySlide()); };
  const handleField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const handleLocaleField = (key, langCode, value) => setForm((prev) => ({
    ...prev,
    [key]: { ...(prev[key] || {}), [langCode]: value },
  }));

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) { addNotification('Chỉ chấp nhận file ảnh', 'error'); return; }
    setUploading(true);
    try {
      const res = await adminApi.uploadImage(file);
      const url = res?.data?.data?.url;
      if (url) { handleField('imageUrl', url); addNotification('Upload ảnh thành công'); }
    } catch (err) {
      addNotification(err.response?.data?.message || 'Upload ảnh thất bại', 'error');
    } finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.imageUrl) { addNotification('Vui lòng upload ảnh cho slide', 'error'); return; }
    setSaving(true);
    try {
      if (editing === 'new') { await adminApi.addHeroSlide(form); addNotification('Thêm slide thành công'); }
      else { await adminApi.updateHeroSlide(editing, form); addNotification('Cập nhật slide thành công'); }
      closeForm();
      await loadSlides();
    } catch (err) {
      addNotification(err.response?.data?.message || 'Lưu slide thất bại', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async (slide) => {
    if (!window.confirm(`Xoá slide "${slide.title?.vi || slide.imageUrl}"?`)) return;
    try { await adminApi.deleteHeroSlide(slide._id); addNotification('Xoá slide thành công'); await loadSlides(); }
    catch (err) { addNotification(err.response?.data?.message || 'Xoá slide thất bại', 'error'); }
  };

  const toggleActive = async (slide) => {
    try { await adminApi.updateHeroSlide(slide._id, { active: !(slide.active !== false) }); await loadSlides(); }
    catch (err) { addNotification(err.response?.data?.message || 'Cập nhật trạng thái thất bại', 'error'); }
  };

  const move = async (index, delta) => {
    const next = slides.slice();
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setSlides(next);
    try { await adminApi.reorderHeroSlides(next.map((s) => s._id)); }
    catch (err) { addNotification(err.response?.data?.message || 'Sắp xếp thất bại', 'error'); await loadSlides(); }
  };

  const imageUrl = (url) => {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    return `${API_BASE_URL}${url}`;
  };

  return (
    <>
      <HeaderWithBreadcrumb title="Hero slider trang chủ" />
      <div className="p-4 pt-3 max-w-4xl">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-500">
            Quản lý các slide hiển thị ở đầu trang chủ (Swiper h-[90vh]). Thay đổi hiển thị trên client sau khi cache hết hạn (tối đa 5 phút).
          </p>
          <button type="button" onClick={openCreate} className="btn-primary flex items-center gap-1 text-xs whitespace-nowrap">
            <FiPlus size={14} /> Thêm slide
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>
        ) : slides.length === 0 ? (
          <div className="card text-center py-10 text-xs text-gray-500">
            Chưa có slide nào. Bấm "Thêm slide" để tạo slide đầu tiên. Khi chưa có slide, trang chủ sẽ hiển thị gradient động.
          </div>
        ) : (
          <div className="space-y-2">
            {slides.map((slide, idx) => (
              <div key={slide._id} className="card flex items-center gap-3 p-3">
                <img src={imageUrl(slide.imageUrl)} alt={slide.title?.vi || ''} className="w-32 h-16 object-cover rounded border bg-gray-50 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{slide.title?.vi || <em className="text-gray-400">(chưa có tiêu đề VI)</em>}</p>
                  {slide.title?.en && <p className="text-xs text-gray-500 truncate">{slide.title.en}</p>}
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${slide.active !== false ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                      {slide.active !== false ? 'Hiển thị' : 'Đã ẩn'}
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
        <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center p-4 overflow-y-auto" onClick={(e) => { if (e.target === e.currentTarget) closeForm(); }}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl my-6">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h2 className="text-sm font-semibold">{editing === 'new' ? 'Thêm slide mới' : 'Sửa slide'}</h2>
              <button type="button" onClick={closeForm} className="p-1 text-gray-400 hover:text-gray-600"><FiX size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1">Ảnh nền *</label>
                <div className="flex items-start gap-3">
                  <div className="w-48 h-24 border rounded bg-gray-50 overflow-hidden flex items-center justify-center shrink-0">
                    {form.imageUrl ? (
                      <img src={imageUrl(form.imageUrl)} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-gray-400">Chưa có ảnh</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="btn-secondary flex items-center gap-1 text-xs">
                      <FiUpload size={12} />
                      {uploading ? 'Đang upload...' : form.imageUrl ? 'Đổi ảnh' : 'Upload ảnh'}
                    </button>
                    {form.imageUrl && (
                      <button type="button" onClick={() => handleField('imageUrl', '')} className="block text-[10px] text-red-500 hover:underline">
                        Xoá ảnh
                      </button>
                    )}
                    <p className="text-[10px] text-gray-400">JPG / PNG / WebP, tối đa 5MB. Ảnh nên có tỉ lệ ngang (16:9 hoặc 21:9).</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Tiêu đề (VI)</label>
                  <input type="text" value={form.title.vi} onChange={(e) => handleLocaleField('title', 'vi', e.target.value)} className="input-field" maxLength={200} placeholder="Một dòng tiêu đề" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Title (EN)</label>
                  <input type="text" value={form.title.en} onChange={(e) => handleLocaleField('title', 'en', e.target.value)} className="input-field" maxLength={200} placeholder="One-line title" />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-gray-700">
                <input type="checkbox" checked={form.active} onChange={(e) => handleField('active', e.target.checked)} className="rounded border-gray-300" />
                Hiển thị slide này trên trang chủ
              </label>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={closeForm} className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded">Huỷ</button>
                <button type="submit" disabled={saving || uploading} className="btn-primary flex items-center gap-1 text-xs disabled:opacity-60">
                  <FiSave size={14} />
                  {saving ? 'Đang lưu...' : editing === 'new' ? 'Tạo slide' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}