import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiSave, FiUpload, FiX, FiImage } from 'react-icons/fi';
import HeaderWithBreadcrumb from '../settings/HeaderWithBreadcrumb';
import RichEditor from '../../components/RichEditor';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../context/NotificationContext';

const emptyForm = () => ({
  title: { vi: '', en: '' },
  subtitle: { vi: '', en: '' },
  backgroundUrl: '',
  hotlines: [{ label: 'Hotline', number: '' }],
  isActive: true,
});

const QuoteSectionForm = () => {
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [form, setForm] = useState(emptyForm());

  useEffect(() => { fetchSection(); }, []);

  const fetchSection = async () => {
    try {
      const res = await adminApi.getQuoteSection();
      const s = res.data?.data;
      if (s && s._id) {
        setForm({
          title: { vi: s.title?.vi || '', en: s.title?.en || '' },
          subtitle: { vi: s.subtitle?.vi || '', en: s.subtitle?.en || '' },
          backgroundUrl: s.backgroundUrl || '',
          hotlines: s.hotlines?.length ? s.hotlines : [{ label: 'Hotline', number: '' }],
          isActive: s.isActive !== false,
        });
      }
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const setField = (key, lang, value) =>
    setForm((p) => ({ ...p, [key]: lang ? { ...(p[key] || {}), [lang]: value } : value }));

  const handleHotlineChange = (idx, field, value) =>
    setForm((p) => ({
      ...p,
      hotlines: p.hotlines.map((h, i) => (i === idx ? { ...h, [field]: value } : h)),
    }));

  const addHotline = () =>
    setForm((p) => ({
      ...p,
      hotlines: [...p.hotlines, { label: 'Hotline', number: '' }],
    }));

  const removeHotline = (idx) =>
    setForm((p) => ({
      ...p,
      hotlines: p.hotlines.filter((_, i) => i !== idx),
    }));

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploadingImage(true);
    try {
      const res = await adminApi.uploadImage(file);
      const url = res.data?.url || res.data?.data?.url || '';
      if (url) {
        setField('backgroundUrl', null, url);
        addNotification('Upload ảnh thành công');
      } else {
        addNotification('Upload ảnh thất bại', 'error');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Upload ảnh thất bại';
      addNotification(msg, 'error');
    } finally { setUploadingImage(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.updateQuoteSection(form);
      addNotification('Luu thanh cong');
    } catch (err) {
      addNotification(err.response?.data?.message || 'Luu that bai', 'error');
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <>
        <HeaderWithBreadcrumb title="Cau hinh Bao gia" backTo="/" />
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </div>
      </>
    );
  }

  return (
    <>
      <HeaderWithBreadcrumb title="Cau hinh Bao gia" backTo="/" />
      <div className="p-4 pt-3 max-w-3xl">
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Title */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Tieu de (VI)</label>
                <input type="text" value={form.title.vi}
                  onChange={(e) => setField('title', 'vi', e.target.value)}
                  className="input-field" placeholder="VD: Nhan bao gia ngay" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Title (EN)</label>
                <input type="text" value={form.title.en}
                  onChange={(e) => setField('title', 'en', e.target.value)}
                  className="input-field" placeholder="VD: Get a quote today" />
              </div>
            </div>

            {/* Subtitle */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Mo ta (VI)</label>
                <RichEditor
                  value={form.subtitle.vi}
                  onChange={(v) => setField('subtitle', 'vi', v)}
                  placeholder="Noi dung gioi thieu ben trai..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Description (EN)</label>
                <RichEditor
                  value={form.subtitle.en}
                  onChange={(v) => setField('subtitle', 'en', v)}
                  placeholder="Intro text on the left side..."
                />
              </div>
            </div>

            {/* Background Image */}
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">Anh nen</label>
              <div className="flex items-start gap-4">
                {form.backgroundUrl ? (
                  <div className="relative shrink-0">
                    <img src={form.backgroundUrl} alt="background"
                      className="w-40 h-24 rounded-lg object-cover border border-gray-200" />
                    <button
                      type="button"
                      onClick={() => setField('backgroundUrl', null, '')}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="w-40 h-24 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
                    <FiImage size={24} />
                    <span className="text-[10px] mt-1">Chua co anh</span>
                  </div>
                )}
                <div>
                  <label
                    htmlFor="quote-bg-file"
                    className={`btn-secondary flex items-center gap-2 text-xs cursor-pointer ${uploadingImage ? 'pointer-events-none opacity-60' : ''}`}
                  >
                    <FiUpload size={13} />
                    {uploadingImage ? 'Dang tai...' : 'Tai anh len'}
                  </label>
                  <input
                    id="quote-bg-file"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = '';
                      if (file) handleImageUpload(file);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Hotlines */}
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">Danh sach Hotline</label>
              <div className="space-y-2">
                {form.hotlines.map((h, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input type="text" value={h.label}
                      onChange={(e) => handleHotlineChange(idx, 'label', e.target.value)}
                      className="input-field w-40" placeholder="Label (VD: Hotline)" />
                    <input type="text" value={h.number}
                      onChange={(e) => handleHotlineChange(idx, 'number', e.target.value)}
                      className="input-field flex-1" placeholder="So dien thoai" />
                    <button type="button" onClick={() => removeHotline(idx)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors">
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addHotline}
                className="mt-2 btn-secondary flex items-center gap-1.5 text-xs px-3 py-1.5">
                <FiPlus size={13} /> Them hotline
              </button>
            </div>

            {/* Active */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={form.isActive}
                onChange={(e) => setField('isActive', null, e.target.checked)}
                className="rounded w-4 h-4" />
              <span className="text-sm font-medium text-gray-700">Hien thi tren website</span>
            </label>

            {/* Actions */}
            <div className="flex justify-end pt-4 border-t">
              <button type="submit" disabled={saving}
                className="btn-primary flex items-center gap-2 text-sm disabled:opacity-60">
                <FiSave size={16} />
                {saving ? 'Dang luu...' : 'Luu cau hinh'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
};

export default QuoteSectionForm;
