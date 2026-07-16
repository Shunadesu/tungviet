import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiUpload, FiX, FiImage } from 'react-icons/fi';
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

const LeadershipForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const fileRef = useRef(null);

  useEffect(() => {
    if (isEditing) fetchMember();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchMember = async () => {
    try {
      const res = await adminApi.getLeadershipMember(id);
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
      navigate('/leadership');
    } finally { setLoading(false); }
  };

  const setField = (key, lang, value) =>
    setForm((p) => ({ ...p, [key]: lang ? { ...(p[key] || {}), [lang]: value } : value }));

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    setUploadingImage(true);
    try {
      const res = await adminApi.uploadImage(fd);
      const url = res.data?.url || res.data?.data?.url || '';
      if (url) setField('imageUrl', null, url);
      else addNotification('Upload anh that bai', 'error');
    } catch (err) {
      addNotification('Upload anh that bai', 'error');
    } finally { setUploadingImage(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.vi?.trim()) { addNotification('Ten (VI) la bat buoc', 'error'); return; }
    setSaving(true);
    try {
      if (isEditing) {
        await adminApi.updateLeadership(id, form);
        addNotification('Cap nhat thanh cong');
      } else {
        await adminApi.createLeadership(form);
        addNotification('Them thanh vien thanh cong');
      }
      navigate('/leadership');
    } catch (err) {
      addNotification(err.response?.data?.message || 'Luu that bai', 'error');
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <>
        <HeaderWithBreadcrumb title={isEditing ? 'Sua thanh vien' : 'Them thanh vien'} backTo="/leadership" />
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </div>
      </>
    );
  }

  return (
    <>
      <HeaderWithBreadcrumb title={isEditing ? 'Sua thanh vien' : 'Them thanh vien'} backTo="/leadership" />
      <div className="p-4 pt-3 max-w-4xl">
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">

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
                  className="input-field" placeholder="VD: Nguyen Van A" />
              </div>
            </div>

            {/* Position */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Chuc vu (VI)</label>
                <input type="text" value={form.position.vi}
                  onChange={(e) => setField('position', 'vi', e.target.value)}
                  className="input-field" placeholder="VD: CEO" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Position (EN)</label>
                <input type="text" value={form.position.en}
                  onChange={(e) => setField('position', 'en', e.target.value)}
                  className="input-field" placeholder="VD: Chief Executive Officer" />
              </div>
            </div>

            {/* Image */}
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">Anh dai dien</label>
              <div className="flex items-start gap-4">
                {form.imageUrl ? (
                  <div className="relative shrink-0">
                    <img src={form.imageUrl} alt="avatar" className="w-20 h-20 rounded-full object-cover border border-gray-200" />
                    <button
                      type="button"
                      onClick={() => setField('imageUrl', null, '')}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                    >
                      <FiX size={10} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors"
                  >
                    <FiImage size={20} />
                    <span className="text-[9px] mt-0.5">Chon anh</span>
                  </button>
                )}
                <div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploadingImage}
                    className="btn-secondary flex items-center gap-2 text-xs"
                  >
                    <FiUpload size={13} />
                    {uploadingImage ? 'Dang tai...' : 'Tai anh len'}
                  </button>
                  <p className="text-[10px] text-gray-400 mt-1">Dung luong khuyen mai: 2MB, dinh dang: JPG, PNG</p>
                </div>
              </div>
            </div>

            {/* Description (short bio for card) */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Mo ta ngan (VI) — hien thi tren the</label>
                <RichEditor
                  value={form.description.vi}
                  onChange={(v) => setField('description', 'vi', v)}
                  placeholder="Gioi thieu ngan gon ve thanh vien..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Short bio (EN) — shown on card</label>
                <RichEditor
                  value={form.description.en}
                  onChange={(v) => setField('description', 'en', v)}
                  placeholder="Brief intro about the member..."
                />
              </div>
            </div>

            {/* Bio (full) */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Tieu su day du (VI)</label>
                <RichEditor
                  value={form.bio.vi}
                  onChange={(v) => setField('bio', 'vi', v)}
                  placeholder="Tieu su, kinh nghiem, thanh tich..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Full bio (EN)</label>
                <RichEditor
                  value={form.bio.en}
                  onChange={(v) => setField('bio', 'en', v)}
                  placeholder="Biography, experience, achievements..."
                />
              </div>
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
              <button type="button" onClick={() => navigate('/leadership')}
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

export default LeadershipForm;
