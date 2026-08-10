import { useRef, useState } from 'react';
import { FiX, FiUpload, FiSave, FiEye } from 'react-icons/fi';
import RichEditor from '../../components/RichEditor';
import adminApi from '../../api/adminApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const VARIANT_OPTIONS = [
  { value: 'fullscreen', label: 'Fullscreen (ảnh nền toàn màn hình)' },
  { value: 'split', label: 'Split (50% ảnh trái / 50% text phải)' },
  { value: 'compact', label: 'Compact (60vh, dùng cho subpage)' },
];

const HEIGHT_OPTIONS = [
  { value: 'fullscreen', label: 'Fullscreen (100vh)' },
  { value: 'large', label: 'Large (80vh)' },
  { value: 'medium', label: 'Medium (60vh)' },
];

const THEME_OPTIONS = [
  { value: 'auto', label: 'Auto (theo ảnh nền)' },
  { value: 'dark', label: 'Dark (chữ trắng)' },
  { value: 'light', label: 'Light (chữ đen)' },
];

const ANIMATION_OPTIONS = [
  { value: 'fade-up', label: 'Fade up' },
  { value: 'fade', label: 'Fade' },
  { value: 'slide', label: 'Slide' },
];

const CTA_STYLE_OPTIONS = [
  { value: 'solid', label: 'Solid' },
  { value: 'outline', label: 'Outline' },
  { value: 'ghost', label: 'Ghost' },
];

const emptyCTA = () => ({ label: { vi: '', en: '' }, href: '', style: 'solid' });

export const emptySlide = () => ({
  imageUrl: '',
  title: { vi: '', en: '' },
  description: { vi: '', en: '' },
  active: true,
  variant: 'fullscreen',
  eyebrow: { vi: '', en: '' },
  ctaPrimary: null,
  ctaSecondary: null,
  theme: 'auto',
  scrollHint: true,
  height: 'fullscreen',
  animationPreset: 'fade-up',
  backgroundOverlay: 50,
});

const imageUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE_URL}${url}`;
};

/**
 * Mini preview - shows roughly what the slide will look like.
 * Uses a 4:3 aspect ratio box for compact preview in admin.
 */
const MiniPreview = ({ form }) => {
  const overlayAlpha = (form.backgroundOverlay ?? 50) / 100;
  const textClass = form.theme === 'light' ? 'text-slate-900' : 'text-white';
  const descClass = form.theme === 'light' ? 'text-slate-700' : 'text-white/90';
  const isSplit = form.variant === 'split';

  return (
    <div className="border rounded-lg overflow-hidden bg-gray-900">
      <div
        className={`relative ${isSplit ? 'aspect-[16/9] grid grid-cols-2' : 'aspect-[16/9]'}`}
        style={{
          backgroundImage: form.imageUrl ? `url(${imageUrl(form.imageUrl)})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${overlayAlpha})` }} />
        {isSplit && (
          <div
            className="absolute inset-y-0 left-0 w-1/2 hidden md:block"
            style={{
              backgroundImage: form.imageUrl ? `url(${imageUrl(form.imageUrl)})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        )}
        <div className={`relative z-10 h-full flex items-center justify-center p-4 ${isSplit ? 'md:col-start-2 md:col-end-3' : ''}`}>
          <div className={`text-center max-w-md ${textClass}`}>
            {form.eyebrow?.vi && (
              <span className="inline-block px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider bg-white/10 rounded-full mb-1">
                {form.eyebrow.vi}
              </span>
            )}
            {form.title?.vi && (
              <h3 className="text-sm md:text-base font-bold leading-tight">
                {form.title.vi}
              </h3>
            )}
            {form.description?.vi && (
              <div className={`mt-1 text-[10px] ${descClass} line-clamp-2`}
                   dangerouslySetInnerHTML={{ __html: form.description.vi.replace(/<[^>]+>/g, ' ').slice(0, 100) }} />
            )}
            {(form.ctaPrimary?.label?.vi || form.ctaSecondary?.label?.vi) && (
              <div className="flex justify-center gap-1 mt-2">
                {form.ctaPrimary?.label?.vi && (
                  <span className="text-[9px] px-2 py-1 rounded-full bg-primary text-white">
                    {form.ctaPrimary.label.vi}
                  </span>
                )}
                {form.ctaSecondary?.label?.vi && (
                  <span className="text-[9px] px-2 py-1 rounded-full border border-white text-white">
                    {form.ctaSecondary.label.vi}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const HeroSlideForm = ({ form, setForm, editing, onSubmit, onClose, saving, addNotification }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const handleLocaleField = (key, langCode, value) => setForm((prev) => ({
    ...prev,
    [key]: { ...(prev[key] || {}), [langCode]: value },
  }));

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      addNotification('Chỉ chấp nhận file ảnh', 'error');
      return;
    }
    setUploading(true);
    try {
      const res = await adminApi.uploadImage(file);
      const url = res?.data?.data?.url;
      if (url) {
        handleField('imageUrl', url);
        addNotification('Upload ảnh thành công');
      }
    } catch (err) {
      addNotification(err.response?.data?.message || 'Upload ảnh thất bại', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleCTA = (which, key, value) => {
    setForm((prev) => {
      const next = { ...prev };
      const current = prev[which] || emptyCTA();
      next[which] = { ...current, [key]: value };
      return next;
    });
  };

  const handleCTALocale = (which, langCode, value) => {
    setForm((prev) => {
      const next = { ...prev };
      const current = prev[which] || emptyCTA();
      next[which] = {
        ...current,
        label: { ...(current.label || {}), [langCode]: value },
      };
      return next;
    });
  };

  const clearCTA = (which) => {
    setForm((prev) => ({ ...prev, [which]: null }));
  };

  const enableCTA = (which) => {
    setForm((prev) => ({ ...prev, [which]: emptyCTA() }));
  };

  const onSubmitForm = (e) => {
    e.preventDefault();
    if (!form.imageUrl) {
      addNotification('Vui lòng upload ảnh cho slide', 'error');
      return;
    }
    onSubmit();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center p-4 overflow-y-auto" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl my-6">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-sm font-semibold">{editing === 'new' ? 'Thêm slide mới' : 'Sửa slide'}</h2>
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <FiX size={18} />
          </button>
        </div>

        <form onSubmit={onSubmitForm} className="p-4">
          <div className="grid lg:grid-cols-[1fr,1fr] gap-4">
            {/* LEFT: form fields */}
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              {/* Image upload */}
              <div>
                <label className="block text-xs font-medium mb-1">Ảnh nền *</label>
                <div className="flex items-start gap-3">
                  <div className="w-[200px] h-[100px] border rounded bg-gray-50 overflow-hidden flex items-center justify-center shrink-0">
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
                    <p className="text-[10px] text-gray-400">JPG / PNG / WebP, tối đa 5MB.</p>
                  </div>
                </div>
              </div>

              {/* Variant + Height + Theme */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium mb-1">Variant</label>
                  <select value={form.variant} onChange={(e) => handleField('variant', e.target.value)} className="input-field">
                    {VARIANT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Chiều cao</label>
                  <select value={form.height} onChange={(e) => handleField('height', e.target.value)} className="input-field">
                    {HEIGHT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Theme chữ</label>
                  <select value={form.theme} onChange={(e) => handleField('theme', e.target.value)} className="input-field">
                    {THEME_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Animation</label>
                  <select value={form.animationPreset} onChange={(e) => handleField('animationPreset', e.target.value)} className="input-field">
                    {ANIMATION_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Overlay slider */}
              <div>
                <label className="block text-xs font-medium mb-1">
                  Độ tối overlay: {form.backgroundOverlay}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={form.backgroundOverlay}
                  onChange={(e) => handleField('backgroundOverlay', Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Eyebrow */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium mb-1">Eyebrow (VI)</label>
                  <input type="text" value={form.eyebrow?.vi || ''} onChange={(e) => handleLocaleField('eyebrow', 'vi', e.target.value)} className="input-field" maxLength={80} placeholder="VD: Tung Viet" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Eyebrow (EN)</label>
                  <input type="text" value={form.eyebrow?.en || ''} onChange={(e) => handleLocaleField('eyebrow', 'en', e.target.value)} className="input-field" maxLength={80} />
                </div>
              </div>

              {/* Title */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium mb-1">Tiêu đề (VI)</label>
                  <input type="text" value={form.title.vi} onChange={(e) => handleLocaleField('title', 'vi', e.target.value)} className="input-field" maxLength={200} placeholder="Một dòng tiêu đề" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Title (EN)</label>
                  <input type="text" value={form.title.en} onChange={(e) => handleLocaleField('title', 'en', e.target.value)} className="input-field" maxLength={200} />
                </div>
              </div>

              {/* Description */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium mb-1">Mô tả (VI)</label>
                  <RichEditor value={form.description.vi} onChange={(v) => handleLocaleField('description', 'vi', v)} placeholder="Mô tả..." minHeight={100} maxLength={500} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Description (EN)</label>
                  <RichEditor value={form.description.en} onChange={(v) => handleLocaleField('description', 'en', v)} placeholder="Description..." minHeight={100} maxLength={500} />
                </div>
              </div>

              {/* CTA Primary */}
              <div className="border rounded p-2 bg-gray-50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">CTA chính</span>
                  {form.ctaPrimary ? (
                    <button type="button" onClick={() => clearCTA('ctaPrimary')} className="text-[10px] text-red-500 hover:underline">Tắt</button>
                  ) : (
                    <button type="button" onClick={() => enableCTA('ctaPrimary')} className="text-[10px] text-primary hover:underline">+ Bật</button>
                  )}
                </div>
                {form.ctaPrimary && (
                  <div className="space-y-1">
                    <div className="grid grid-cols-2 gap-1">
                      <input type="text" placeholder="Label VI" value={form.ctaPrimary.label?.vi || ''} onChange={(e) => handleCTALocale('ctaPrimary', 'vi', e.target.value)} className="input-field text-xs" maxLength={80} />
                      <input type="text" placeholder="Label EN" value={form.ctaPrimary.label?.en || ''} onChange={(e) => handleCTALocale('ctaPrimary', 'en', e.target.value)} className="input-field text-xs" maxLength={80} />
                    </div>
                    <input type="text" placeholder="href (vd: /products)" value={form.ctaPrimary.href || ''} onChange={(e) => handleCTA('ctaPrimary', 'href', e.target.value)} className="input-field text-xs" maxLength={500} />
                    <select value={form.ctaPrimary.style || 'solid'} onChange={(e) => handleCTA('ctaPrimary', 'style', e.target.value)} className="input-field text-xs">
                      {CTA_STYLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                )}
              </div>

              {/* CTA Secondary */}
              <div className="border rounded p-2 bg-gray-50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">CTA phụ</span>
                  {form.ctaSecondary ? (
                    <button type="button" onClick={() => clearCTA('ctaSecondary')} className="text-[10px] text-red-500 hover:underline">Tắt</button>
                  ) : (
                    <button type="button" onClick={() => enableCTA('ctaSecondary')} className="text-[10px] text-primary hover:underline">+ Bật</button>
                  )}
                </div>
                {form.ctaSecondary && (
                  <div className="space-y-1">
                    <div className="grid grid-cols-2 gap-1">
                      <input type="text" placeholder="Label VI" value={form.ctaSecondary.label?.vi || ''} onChange={(e) => handleCTALocale('ctaSecondary', 'vi', e.target.value)} className="input-field text-xs" maxLength={80} />
                      <input type="text" placeholder="Label EN" value={form.ctaSecondary.label?.en || ''} onChange={(e) => handleCTALocale('ctaSecondary', 'en', e.target.value)} className="input-field text-xs" maxLength={80} />
                    </div>
                    <input type="text" placeholder="href (vd: /contact)" value={form.ctaSecondary.href || ''} onChange={(e) => handleCTA('ctaSecondary', 'href', e.target.value)} className="input-field text-xs" maxLength={500} />
                    <select value={form.ctaSecondary.style || 'solid'} onChange={(e) => handleCTA('ctaSecondary', 'style', e.target.value)} className="input-field text-xs">
                      {CTA_STYLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                )}
              </div>

              {/* Scroll hint + active */}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs text-gray-700">
                  <input type="checkbox" checked={form.scrollHint !== false} onChange={(e) => handleField('scrollHint', e.target.checked)} className="rounded border-gray-300" />
                  Hiển thị scroll hint
                </label>
                <label className="flex items-center gap-2 text-xs text-gray-700">
                  <input type="checkbox" checked={form.active !== false} onChange={(e) => handleField('active', e.target.checked)} className="rounded border-gray-300" />
                  Slide đang hoạt động
                </label>
              </div>
            </div>

            {/* RIGHT: preview */}
            <div className="lg:sticky lg:top-2 self-start">
              <div className="flex items-center gap-1 text-xs font-medium mb-1">
                <FiEye size={12} /> Preview
              </div>
              <MiniPreview form={form} />
              <p className="text-[10px] text-gray-400 mt-1">Preview hiển thị tiếng Việt. Thay đổi sẽ phản ánh ngay khi bạn chỉnh form.</p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 mt-3 border-t">
            <button type="button" onClick={onClose} className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded">Huỷ</button>
            <button type="submit" disabled={saving || uploading} className="btn-primary flex items-center gap-1 text-xs disabled:opacity-60">
              <FiSave size={14} />
              {saving ? 'Đang lưu...' : editing === 'new' ? 'Tạo slide' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HeroSlideForm;