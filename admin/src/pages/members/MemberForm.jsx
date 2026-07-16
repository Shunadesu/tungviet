import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiUpload, FiX } from 'react-icons/fi';
import HeaderWithBreadcrumb from '../settings/HeaderWithBreadcrumb';
import RichEditor from '../../components/RichEditor';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../context/NotificationContext';

const emptyForm = () => ({
  name: { vi: '', en: '' },
  position: { vi: '', en: '' },
  imageUrl: '',
  description: { vi: '', en: '' },
  bio: { vi: '', en: '' },
  isActive: true,
});

const MemberForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState(emptyForm());

  useEffect(() => {
    if (isEditing) fetchMember();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchMember = async () => {
    try {
      const res = await adminApi.getMember(id);
      const m = res.data.data;
      setForm({
        name: { vi: m.name?.vi || '', en: m.name?.en || '' },
        position: { vi: m.position?.vi || '', en: m.position?.en || '' },
        imageUrl: m.imageUrl || '',
        description: { vi: m.description?.vi || '', en: m.description?.en || '' },
        bio: { vi: m.bio?.vi || '', en: m.bio?.en || '' },
        isActive: m.isActive !== false,
      });
    } catch (err) {
      addNotification('Khong tai duoc thong tin', 'error');
      navigate('/members');
    } finally { setLoading(false); }
  };

  const setField = (key, lang, value) =>
    setForm((p) => ({ ...p, [key]: lang ? { ...(p[key] || {}), [lang]: value } : value }));

  const handleImageUpload = async (file) => {
    if (!file.type.startsWith('image/')) { addNotification('Chi chap nhan file anh', 'error'); return; }
    setUploading(true);
    try {
      const res = await adminApi.uploadImage(file);
      const url = res?.data?.data?.url;
      if (url) { setField('imageUrl', null, url); addNotification('Upload anh thanh cong'); }
    } catch (err) {
      addNotification(err.response?.data?.message || 'Upload that bai', 'error');
    } finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.vi?.trim()) { addNotification('Ten (VI) la bat buoc', 'error'); return; }
    setSaving(true);
    try {
      if (isEditing) {
        await adminApi.updateMember(id, form);
        addNotification('Cap nhat thanh cong');
      } else {
        await adminApi.createMember(form);
        addNotification('Them thanh vien thanh cong');
      }
      navigate('/members');
    } catch (err) {
      addNotification(err.response?.data?.message || 'Luu that bai', 'error');
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <>
        <HeaderWithBreadcrumb title={isEditing ? 'Sua thanh vien' : 'Them thanh vien'} backTo="/members" />
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </div>
      </>
    );
  }

  return (
    <>
      <HeaderWithBreadcrumb title={isEditing ? 'Sua thanh vien' : 'Them thanh vien'} backTo="/members" />
      <div className="p-4 pt-3 max-w-4xl">
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Image */}
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">Anh dai dien</label>
              <div className="flex items-start gap-4">
                <div className="w-28 h-28 rounded-full border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center bg-gray-50 shrink-0">
                  {form.imageUrl ? (
                    <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-gray-400 text-center px-2">Chua co anh</span>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <label className="btn-secondary flex items-center gap-1 text-xs cursor-pointer inline-block">
                    <FiUpload size={12} />{uploading ? 'Dang upload...' : 'Upload anh'}
                    <input type="file" accept="image/*" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); e.target.value = ''; }} />
                  </label>
                  {form.imageUrl && (
                    <button type="button" onClick={() => setField('imageUrl', null, '')}
                      className="block text-[10px] text-red-500 hover:underline">
                      Xoa anh
                    </button>
                  )}
                  <p className="text-[10px] text-gray-400">Anh vuong hoac tron, toi da 5MB</p>
                </div>
              </div>
            </div>

            {/* Name */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Ho va ten (VI) *</label>
                <input type="text" value={form.name.vi}
                  onChange={(e) => setField('name', 'vi', e.target.value)}
                  className="input-field" placeholder="VD: Nguyen Van A" required />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Full name (EN)</label>
                <input type="text" value={form.name.en}
                  onChange={(e) => setField('name', 'en', e.target.value)}
                  className="input-field" placeholder="John Doe" />
              </div>
            </div>

            {/* Position */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Chuc vu (VI)</label>
                <input type="text" value={form.position.vi}
                  onChange={(e) => setField('position', 'vi', e.target.value)}
                  className="input-field" placeholder="VD: Toi giam doc" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Position (EN)</label>
                <input type="text" value={form.position.en}
                  onChange={(e) => setField('position', 'en', e.target.value)}
                  className="input-field" placeholder="CEO" />
              </div>
            </div>

            {/* Description (short bio for card) */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Mo ta ngan (VI) <span className="text-gray-400 font-normal">(hien thi tren the)</span></label>
                <textarea value={form.description.vi}
                  onChange={(e) => setField('description', 'vi', e.target.value)}
                  className="input-field resize-none" rows={3}
                  placeholder="Mot doan mo ta ngan ve thanh vien nay..." />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Short bio (EN) <span className="text-gray-400 font-normal">(shown on card)</span></label>
                <textarea value={form.description.en}
                  onChange={(e) => setField('description', 'en', e.target.value)}
                  className="input-field resize-none" rows={3}
                  placeholder="A brief bio in English..." />
              </div>
            </div>

            {/* Bio (full for modal) */}
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">Tieu su day du (VI) <span className="text-gray-400 font-normal">(hien thi trong modal)</span></label>
              <RichEditor
                value={form.bio.vi}
                onChange={(v) => setField('bio', 'vi', v)}
                placeholder="Tieu su, kinh nghiem lam viec, thanh tich noi bat..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">Full biography (EN)</label>
              <RichEditor
                value={form.bio.en}
                onChange={(v) => setField('bio', 'en', v)}
                placeholder="Work experience, achievements, background..."
              />
            </div>

            {/* Active */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={form.isActive}
                onChange={(e) => setField('isActive', null, e.target.checked)}
                className="rounded w-4 h-4" />
              <span className="text-sm font-medium text-gray-700">Dang hoat dong</span>
            </label>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t">
              <button type="button" onClick={() => navigate('/members')}
                className="btn-secondary flex items-center gap-2 text-sm">
                <FiArrowLeft size={16} /> Quay lai
              </button>
              <button type="submit" disabled={saving}
                className="btn-primary flex items-center gap-2 text-sm disabled:opacity-60">
                <FiSave size={16} />{saving ? 'Dang luu...' : isEditing ? 'Cap nhat' : 'Them moi'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
};

export default MemberForm;
