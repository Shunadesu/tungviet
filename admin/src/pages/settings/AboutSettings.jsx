import { useEffect, useState, useRef } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiArrowUp, FiArrowDown, FiX, FiUpload, FiEye, FiEyeOff, FiSave, FiInfo } from 'react-icons/fi';
import { FiAward, FiShield, FiStar, FiTrendingUp, FiGlobe, FiHeart, FiCheckCircle } from 'react-icons/fi';
import HeaderWithBreadcrumb from './HeaderWithBreadcrumb';
import RichEditor from '../../components/RichEditor';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../context/NotificationContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const ICON_OPTIONS = [
  { value: 'FiAward', label: 'Award', icon: <FiAward size={18} /> },
  { value: 'FiShield', label: 'Shield', icon: <FiShield size={18} /> },
  { value: 'FiStar', label: 'Star', icon: <FiStar size={18} /> },
  { value: 'FiTrendingUp', label: 'Trending', icon: <FiTrendingUp size={18} /> },
  { value: 'FiGlobe', label: 'Globe', icon: <FiGlobe size={18} /> },
  { value: 'FiHeart', label: 'Heart', icon: <FiHeart size={18} /> },
  { value: 'FiCheckCircle', label: 'Check', icon: <FiCheckCircle size={18} /> },
  { value: 'FiInfo', label: 'Info', icon: <FiInfo size={18} /> },
];

const ICON_MAP = Object.fromEntries(ICON_OPTIONS.map((i) => [i.value, i.icon]));

const emptyAboutSlide = () => ({ imageUrl: '', title: { vi: '', en: '' }, subtitle: { vi: '', en: '' }, active: true });
const emptyFastFact = () => ({ label: { vi: '', en: '' }, value: 0, suffix: { vi: '', en: '' } });
const emptyCoreValue = () => ({ icon: 'FiAward', title: { vi: '', en: '' }, description: { vi: '', en: '' } });

// ── Tab 1: About Slides ────────────────────────────────────────────────────────
function AboutSlidesTab({ slides, onReload }) {
  const { addNotification } = useNotification();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyAboutSlide());
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const imageUrl = (url) => {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    return `${API_BASE_URL}${url}`;
  };

  const openCreate = () => { setForm(emptyAboutSlide()); setEditing('new'); };
  const openEdit = (slide) => {
    setForm({
      imageUrl: slide.imageUrl || '',
      title: { vi: slide.title?.vi || '', en: slide.title?.en || '' },
      subtitle: { vi: slide.subtitle?.vi || '', en: slide.subtitle?.en || '' },
      active: slide.active !== false,
    });
    setEditing(slide._id);
  };
  const closeForm = () => { setEditing(null); setForm(emptyAboutSlide()); };
  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const setLocale = (k, lang, v) => setForm((p) => ({ ...p, [k]: { ...(p[k] || {}), [lang]: v } }));

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) { addNotification('Chỉ chấp nhận file ảnh', 'error'); return; }
    setUploading(true);
    try {
      const res = await adminApi.uploadImage(file);
      const url = res?.data?.data?.url;
      if (url) { setField('imageUrl', url); addNotification('Upload ảnh thành công'); }
    } catch (err) {
      addNotification(err.response?.data?.message || 'Upload ảnh thất bại', 'error');
    } finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.imageUrl) { addNotification('Vui lòng upload ảnh cho slide', 'error'); return; }
    setSaving(true);
    try {
      if (editing === 'new') { await adminApi.addAboutSlide(form); addNotification('Thêm slide thành công'); }
      else { await adminApi.updateAboutSlide(editing, form); addNotification('Cập nhật slide thành công'); }
      closeForm();
      await onReload();
    } catch (err) {
      addNotification(err.response?.data?.message || 'Lưu slide thất bại', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async (slide) => {
    if (!window.confirm(`Xoá slide "${slide.title?.vi || slide.imageUrl}"?`)) return;
    try { await adminApi.deleteAboutSlide(slide._id); addNotification('Xoá slide thành công'); await onReload(); }
    catch (err) { addNotification(err.response?.data?.message || 'Xoá slide thất bại', 'error'); }
  };

  const toggleActive = async (slide) => {
    try { await adminApi.updateAboutSlide(slide._id, { active: !(slide.active !== false) }); await onReload(); }
    catch (err) { addNotification(err.response?.data?.message || 'Cập nhật trạng thái thất bại', 'error'); }
  };

  const move = async (index, delta) => {
    const next = slides.slice();
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    try { await adminApi.reorderAboutSlides(next.map((s) => s._id)); await onReload(); }
    catch (err) { addNotification(err.response?.data?.message || 'Sắp xếp thất bại', 'error'); }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-500">Quản lý ảnh hero (Swiper) cho trang Giới thiệu. Nên dùng ảnh landscape tỉ lệ 16:9.</p>
        <button type="button" onClick={openCreate} className="btn-primary flex items-center gap-1 text-xs whitespace-nowrap">
          <FiPlus size={14} /> Thêm slide
        </button>
      </div>

      {slides.length === 0 ? (
        <div className="card text-center py-10 text-xs text-gray-500">
          Chưa có slide nào. Bấm "Thêm slide" để tạo slide đầu tiên.
        </div>
      ) : (
        <div className="space-y-2">
          {slides.map((slide, idx) => (
            <div key={slide._id} className="card flex items-center gap-3 p-3">
              <img src={imageUrl(slide.imageUrl)} alt="" className="w-32 h-16 object-cover rounded border bg-gray-50 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{slide.title?.vi || <em className="text-gray-400">(chưa có tiêu đề VI)</em>}</p>
                {slide.subtitle?.vi && <p className="text-xs text-gray-500 truncate">{slide.subtitle.vi}</p>}
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
                <button type="button" onClick={() => toggleActive(slide)} className="p-2 text-gray-500 hover:text-primary" title={slide.active !== false ? 'Ẩn' : 'Hiện'}>{slide.active !== false ? <FiEyeOff size={14} /> : <FiEye size={14} />}</button>
                <button type="button" onClick={() => openEdit(slide)} className="p-2 text-gray-500 hover:text-primary" title="Sửa"><FiEdit2 size={14} /></button>
                <button type="button" onClick={() => handleDelete(slide)} className="p-2 text-red-500 hover:bg-red-50 rounded" title="Xoá"><FiTrash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

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
                    {form.imageUrl ? <img src={imageUrl(form.imageUrl)} alt="preview" className="w-full h-full object-cover" /> : <span className="text-[10px] text-gray-400">Chưa có ảnh</span>}
                  </div>
                  <div className="flex-1 space-y-1">
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="btn-secondary flex items-center gap-1 text-xs">
                      <FiUpload size={12} />{uploading ? 'Đang upload...' : form.imageUrl ? 'Đổi ảnh' : 'Upload ảnh'}
                    </button>
                    {form.imageUrl && <button type="button" onClick={() => setField('imageUrl', '')} className="block text-[10px] text-red-500 hover:underline">Xoá ảnh</button>}
                  </div>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Tiêu đề (VI)</label>
                  <input type="text" value={form.title.vi} onChange={(e) => setLocale('title', 'vi', e.target.value)} className="input-field" placeholder="VD: Về Tùng Việt" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Title (EN)</label>
                  <input type="text" value={form.title.en} onChange={(e) => setLocale('title', 'en', e.target.value)} className="input-field" placeholder="About Zuna Tungviet" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Phụ đề (VI)</label>
                  <input type="text" value={form.subtitle.vi} onChange={(e) => setLocale('subtitle', 'vi', e.target.value)} className="input-field" placeholder="Mô tả ngắn" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Subtitle (EN)</label>
                  <input type="text" value={form.subtitle.en} onChange={(e) => setLocale('subtitle', 'en', e.target.value)} className="input-field" placeholder="Short description" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs text-gray-700">
                <input type="checkbox" checked={form.active} onChange={(e) => setField('active', e.target.checked)} className="rounded border-gray-300" />
                Hiển thị slide này
              </label>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={closeForm} className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded">Huỷ</button>
                <button type="submit" disabled={saving || uploading} className="btn-primary flex items-center gap-1 text-xs disabled:opacity-60">
                  <FiSave size={14} />{saving ? 'Đang lưu...' : editing === 'new' ? 'Tạo slide' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// ── Tab 2: Mô tả & Lịch sử ────────────────────────────────────────────────────
function DescriptionTab({ about, onReload }) {
  const { addNotification } = useNotification();
  const [form, setForm] = useState({
    intro: { vi: about?.intro?.vi || '', en: about?.intro?.en || '' },
    history: { vi: about?.history?.vi || '', en: about?.history?.en || '' },
    foundedYear: about?.foundedYear || '',
  });
  const [saving, setSaving] = useState(false);

  const setField = (key, lang, value) =>
    setForm((p) => ({ ...p, [key]: { ...(p[key] || {}), [lang]: value } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        intro: { vi: form.intro.vi, en: form.intro.en },
        history: { vi: form.history.vi, en: form.history.en },
        foundedYear: form.foundedYear ? Number(form.foundedYear) : null,
      };
      await adminApi.updateAbout(payload);
      addNotification('Lưu thông tin thành công');
      await onReload();
    } catch (err) {
      addNotification(err.response?.data?.message || 'Lưu thất bại', 'error');
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium mb-1">Giới thiệu tổng quan (VI)</label>
          <RichEditor
            value={form.intro.vi}
            onChange={(v) => setField('intro', 'vi', v)}
            placeholder="Giới thiệu về công ty..."
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Introduction (EN)</label>
          <RichEditor
            value={form.intro.en}
            onChange={(v) => setField('intro', 'en', v)}
            placeholder="Company introduction..."
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium mb-1">Lịch sử thành lập (VI)</label>
          <RichEditor
            value={form.history.vi}
            onChange={(v) => setField('history', 'vi', v)}
            placeholder="Lịch sử hình thành và phát triển..."
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Company History (EN)</label>
          <RichEditor
            value={form.history.en}
            onChange={(v) => setField('history', 'en', v)}
            placeholder="Company history and milestones..."
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium mb-1">Năm thành lập</label>
          <input
            type="number"
            min={1900}
            max={2100}
            value={form.foundedYear}
            onChange={(e) => setForm((p) => ({ ...p, foundedYear: e.target.value }))}
            className="input-field"
            placeholder="VD: 2010"
          />
        </div>
        <div />
      </div>

      <div className="flex justify-end pt-2 border-t">
        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-1 text-xs disabled:opacity-60">
          <FiSave size={14} />{saving ? 'Đang lưu...' : 'Lưu thông tin'}
        </button>
      </div>
    </form>
  );
}

// ── Tab 3: Fast Facts ─────────────────────────────────────────────────────────
function FastFactsTab({ facts, onReload }) {
  const { addNotification } = useNotification();
  const [rows, setRows] = useState(facts.length ? facts : [emptyFastFact()]);
  const [saving, setSaving] = useState(false);

  const setRow = (idx, key, lang, value) => {
    setRows((prev) => prev.map((r, i) =>
      i === idx ? { ...r, [key]: lang ? { ...(r[key] || {}), [lang]: value } : value } : r
    ));
  };

  const addRow = () => setRows((p) => [...p, emptyFastFact()]);
  const removeRow = (idx) => setRows((p) => p.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const validRows = rows.filter((r) => r.label?.vi || r.label?.en || r.value);
      await adminApi.updateFastFacts(validRows);
      addNotification('Lưu fast facts thành công');
      await onReload();
    } catch (err) {
      addNotification(err.response?.data?.message || 'Lưu thất bại', 'error');
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">Thêm các số liệu nổi bật (hiển thị dạng counter trên trang About).</p>
        <button type="button" onClick={addRow} className="btn-secondary flex items-center gap-1 text-xs">
          <FiPlus size={14} /> Thêm dòng
        </button>
      </div>

      {rows.map((row, idx) => (
        <div key={idx} className="card p-3">
          <div className="flex items-start gap-2">
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2">
              <div>
                <label className="block text-[10px] text-gray-500 mb-0.5">Nhãn (VI)</label>
                <input type="text" value={row.label?.vi || ''} onChange={(e) => setRow(idx, 'label', 'vi', e.target.value)} className="input-field text-xs" placeholder="VD: Năm kinh nghiệm" />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-0.5">Label (EN)</label>
                <input type="text" value={row.label?.en || ''} onChange={(e) => setRow(idx, 'label', 'en', e.target.value)} className="input-field text-xs" placeholder="Years of experience" />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-0.5">Giá trị (số)</label>
                <input type="number" value={row.value} onChange={(e) => setRow(idx, 'value', null, Number(e.target.value))} className="input-field text-xs" placeholder="VD: 15" />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-0.5">Hậu tố (VI)</label>
                <input type="text" value={row.suffix?.vi || ''} onChange={(e) => setRow(idx, 'suffix', 'vi', e.target.value)} className="input-field text-xs" placeholder="VD: năm" />
              </div>
            </div>
            <button type="button" onClick={() => removeRow(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded mt-5" title="Xoá"><FiTrash2 size={14} /></button>
          </div>
        </div>
      ))}

      <div className="flex justify-end pt-2 border-t">
        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-1 text-xs disabled:opacity-60">
          <FiSave size={14} />{saving ? 'Đang lưu...' : 'Lưu Fast Facts'}
        </button>
      </div>
    </form>
  );
}

// ── Tab 4: Core Values ────────────────────────────────────────────────────────
function CoreValuesTab({ values, onReload }) {
  const { addNotification } = useNotification();
  const [rows, setRows] = useState(values.length ? values : [emptyCoreValue()]);
  const [saving, setSaving] = useState(false);

  const setRow = (idx, key, lang, value) => {
    setRows((prev) => prev.map((r, i) =>
      i === idx ? { ...r, [key]: lang ? { ...(r[key] || {}), [lang]: value } : value } : r
    ));
  };

  const addRow = () => setRows((p) => [...p, emptyCoreValue()]);
  const removeRow = (idx) => setRows((p) => p.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const validRows = rows.filter((r) => r.title?.vi || r.title?.en);
      await adminApi.updateCoreValues(validRows);
      addNotification('Lưu core values thành công');
      await onReload();
    } catch (err) {
      addNotification(err.response?.data?.message || 'Lưu thất bại', 'error');
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">Các giá trị cốt lõi hiển thị trên trang Giới thiệu.</p>
        <button type="button" onClick={addRow} className="btn-secondary flex items-center gap-1 text-xs">
          <FiPlus size={14} /> Thêm giá trị
        </button>
      </div>

      {rows.map((row, idx) => (
        <div key={idx} className="card p-3">
          <div className="flex items-start gap-2">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-gray-500 mb-0.5">Icon</label>
                <select value={row.icon} onChange={(e) => setRow(idx, 'icon', null, e.target.value)} className="input-field text-xs">
                  {ICON_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center pt-4">
                <div className="p-2 border rounded bg-gray-50 text-primary">{ICON_MAP[row.icon] || <FiAward size={18} />}</div>
              </div>
            </div>
            <button type="button" onClick={() => removeRow(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded mt-5" title="Xoá"><FiTrash2 size={14} /></button>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <label className="block text-[10px] text-gray-500 mb-0.5">Tiêu đề (VI)</label>
              <input type="text" value={row.title?.vi || ''} onChange={(e) => setRow(idx, 'title', 'vi', e.target.value)} className="input-field text-xs" placeholder="VD: Chất lượng" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 mb-0.5">Title (EN)</label>
              <input type="text" value={row.title?.en || ''} onChange={(e) => setRow(idx, 'title', 'en', e.target.value)} className="input-field text-xs" placeholder="Quality" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] text-gray-500 mb-0.5">Mô tả (VI)</label>
              <input type="text" value={row.description?.vi || ''} onChange={(e) => setRow(idx, 'description', 'vi', e.target.value)} className="input-field text-xs" placeholder="Mô tả ngắn về giá trị này" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] text-gray-500 mb-0.5">Description (EN)</label>
              <input type="text" value={row.description?.en || ''} onChange={(e) => setRow(idx, 'description', 'en', e.target.value)} className="input-field text-xs" placeholder="Brief description of this value" />
            </div>
          </div>
        </div>
      ))}

      <div className="flex justify-end pt-2 border-t">
        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-1 text-xs disabled:opacity-60">
          <FiSave size={14} />{saving ? 'Đang lưu...' : 'Lưu Core Values'}
        </button>
      </div>
    </form>
  );
}

// ── Main About Settings Page ───────────────────────────────────────────────────
export default function AboutSettings() {
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('slides');
  const [data, setData] = useState(null);

  const tabs = [
    { key: 'slides', label: 'Ảnh Hero' },
    { key: 'description', label: 'Mô tả & Lịch sử' },
    { key: 'facts', label: 'Fast Facts' },
    { key: 'values', label: 'Core Values' },
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getSiteConfig();
      setData(res.data.data);
    } catch (err) {
      addNotification('Không tải được cấu hình', 'error');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); /* eslint-disable-next-line */ }, []);

  const aboutSlides = (data?.aboutSlides || []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <>
      <HeaderWithBreadcrumb title="Cài đặt trang Giới thiệu" />
      <div className="p-4 pt-3 max-w-4xl">
        {/* Tab bar */}
        <div className="flex items-center gap-1 mb-4 border-b">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>
        ) : (
          <>
            {activeTab === 'slides' && (
              <AboutSlidesTab slides={aboutSlides} onReload={loadData} />
            )}
            {activeTab === 'description' && (
              <DescriptionTab about={data?.about} onReload={loadData} />
            )}
            {activeTab === 'facts' && (
              <FastFactsTab facts={data?.fastFacts || []} onReload={loadData} />
            )}
            {activeTab === 'values' && (
              <CoreValuesTab values={data?.coreValues || []} onReload={loadData} />
            )}
          </>
        )}
      </div>
    </>
  );
}
