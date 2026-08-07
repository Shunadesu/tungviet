import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiX } from 'react-icons/fi';
import HeaderWithBreadcrumb from '../settings/HeaderWithBreadcrumb';
import RichEditor from '../../components/RichEditor';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../context/NotificationContext';

const emptyForm = () => ({
  name: { vi: '', en: '' },
  address: { vi: '', en: '' },
  description: { vi: '', en: '' },
  mapEmbed: '',
  phone: '',
  email: '',
  isActive: true,
});

const LocationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm());

  useEffect(() => {
    if (isEditing) fetchLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchLocation = async () => {
    try {
      const res = await adminApi.getLocation(id);
      const l = res.data.data;
      setForm({
        name: { vi: l.name?.vi || '', en: l.name?.en || '' },
        address: { vi: l.address?.vi || '', en: l.address?.en || '' },
        description: { vi: l.description?.vi || '', en: l.description?.en || '' },
        mapEmbed: l.mapEmbed || '',
        phone: l.phone || '',
        email: l.email || '',
        isActive: l.isActive !== false,
      });
    } catch (err) {
      addNotification('Khong tai duoc thong tin', 'error');
      navigate('/locations');
    } finally { setLoading(false); }
  };

  const setField = (key, lang, value) =>
    setForm((p) => ({ ...p, [key]: lang ? { ...(p[key] || {}), [lang]: value } : value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.vi?.trim()) { addNotification('Ten (VI) la bat buoc', 'error'); return; }
    setSaving(true);
    try {
      if (isEditing) {
        await adminApi.updateLocation(id, form);
        addNotification('Cap nhat thanh cong');
      } else {
        await adminApi.createLocation(form);
        addNotification('Them dia diem thanh cong');
      }
      navigate('/locations');
    } catch (err) {
      addNotification(err.response?.data?.message || 'Luu that bai', 'error');
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <>
        <HeaderWithBreadcrumb title={isEditing ? 'Sua dia diem' : 'Them dia diem'} backTo="/locations" />
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </div>
      </>
    );
  }

  return (
    <>
      <HeaderWithBreadcrumb title={isEditing ? 'Sua dia diem' : 'Them dia diem'} backTo="/locations" />
      <div className="p-4 pt-3 max-w-4xl">
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Ten dia diem (VI) *</label>
                <input type="text" value={form.name.vi}
                  onChange={(e) => setField('name', 'vi', e.target.value)}
                  className="input-field" placeholder="VD: Chi nhanh Ho Chi Minh" required />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Name (EN)</label>
                <input type="text" value={form.name.en}
                  onChange={(e) => setField('name', 'en', e.target.value)}
                  className="input-field" placeholder="Ho Chi Minh City Branch" />
              </div>
            </div>

            {/* Address */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Dia chi (VI)</label>
                <input type="text" value={form.address.vi}
                  onChange={(e) => setField('address', 'vi', e.target.value)}
                  className="input-field" placeholder="VD: 123 Nguyen Hue, Q1, TP.HCM" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Address (EN)</label>
                <input type="text" value={form.address.en}
                  onChange={(e) => setField('address', 'en', e.target.value)}
                  className="input-field" placeholder="123 Nguyen Hue, D1, HCMC" />
              </div>
            </div>

            {/* Description */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Mo ta dia ly (VI)</label>
                <RichEditor
                  value={form.description.vi}
                  onChange={(value) => setField('description', 'vi', value)}
                  placeholder="Vi tri, dac diem dia ly..."
                  minHeight={120}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Geographical description (EN)</label>
                <RichEditor
                  value={form.description.en}
                  onChange={(value) => setField('description', 'en', value)}
                  placeholder="Location, geographical features..."
                  minHeight={120}
                />
              </div>
            </div>

            {/* Map Embed */}
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">Google Maps Embed URL</label>
              <textarea value={form.mapEmbed}
                onChange={(e) => setField('mapEmbed', null, e.target.value)}
                className="input-field resize-none" rows={2}
                placeholder="<iframe src=&quot;https://www.google.com/maps/embed?...&quot; ...></iframe>"
              />
              <p className="text-[10px] text-gray-400 mt-1">Paste Google Maps embed iframe HTML hoac src URL</p>

              {/* Preview */}
              {form.mapEmbed && (
                <div className="mt-3 border rounded-lg overflow-hidden">
                  <p className="text-[10px] text-gray-500 px-2 py-1 bg-gray-50 border-b">Preview:</p>
                  <div
                    className="w-full"
                    style={{ height: 240 }}
                    dangerouslySetInnerHTML={{
                      __html: form.mapEmbed.startsWith('<iframe')
                        ? form.mapEmbed
                        : `<iframe src="${form.mapEmbed}" width="100%" height="240" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`
                    }}
                  />
                </div>
              )}
            </div>

            {/* Phone & Email */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Dien thoai</label>
                <input type="text" value={form.phone}
                  onChange={(e) => setField('phone', null, e.target.value)}
                  className="input-field" placeholder="VD: 028 1234 5678" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Email</label>
                <input type="email" value={form.email}
                  onChange={(e) => setField('email', null, e.target.value)}
                  className="input-field" placeholder="VD: hcm@zuna.vn" />
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
              <button type="button" onClick={() => navigate('/locations')}
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

export default LocationForm;
