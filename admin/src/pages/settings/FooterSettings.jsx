import { useEffect, useRef, useState } from 'react';
import { FiSave, FiUpload, FiTrash2, FiImage } from 'react-icons/fi';
import HeaderWithBreadcrumb from './HeaderWithBreadcrumb';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../context/NotificationContext';

const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];

const defaultFooter = {
  about: '',
  phone: '',
  email: '',
  address: '',
  copyright: '© 2024 Zuna Tungviet. Tất cả quyền được bảo lưu.',
  logoUrl: '',
  mapEmbed: '',
};

const FooterSettings = () => {
  const { addNotification } = useNotification();
  const [form, setForm] = useState(defaultFooter);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [footerPreview, setFooterPreview] = useState(null);
  const footerInputRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminApi.getSiteConfig();
        const footer = res.data.data?.footer;
        if (footer) setForm(footer);
      } catch (err) {
        addNotification('Không tải được cấu hình footer', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.updateFooter(form);
      addNotification('Cập nhật footer thành công');
    } catch (err) {
      addNotification(err.response?.data?.message || 'Cập nhật thất bại', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      addNotification('Chỉ chấp nhận file JPG, PNG, WEBP', 'error');
      return;
    }
    if (file.size > MAX_SIZE) {
      addNotification('File quá lớn (tối đa 5MB)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setFooterPreview(reader.result);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const res = await adminApi.uploadImage(file);
      const url = res.data?.data?.url;
      if (!url) throw new Error('Không nhận được URL ảnh');
      setForm({ ...form, logoUrl: url });
      setFooterPreview(null);
      addNotification('Upload logo footer thành công');
    } catch (err) {
      addNotification(err.response?.data?.message || 'Upload thất bại', 'error');
      setFooterPreview(null);
    } finally {
      setUploading(false);
      if (footerInputRef.current) footerInputRef.current.value = '';
    }
  };

  const clearFooterLogo = () => {
    if (!form.logoUrl) return;
    setForm({ ...form, logoUrl: '' });
    setFooterPreview(null);
    addNotification('Đã xoá logo footer (nhớ lưu footer để áp dụng)');
  };

  if (loading) {
    return (
      <>
        <HeaderWithBreadcrumb title="Liên hệ & Footer" />
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  const displayedFooterLogo = footerPreview || form.logoUrl;

  return (
    <>
      <HeaderWithBreadcrumb title="Liên hệ & Footer" />
      <div className="p-4 pt-3 max-w-3xl">
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1">Mô tả công ty</label>
              <textarea
                rows={3}
                value={form.about || ''}
                onChange={(e) => setForm({ ...form, about: e.target.value })}
                className="input-field"
                maxLength={500}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Số điện thoại</label>
                <input
                  type="text"
                  value={form.phone || ''}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="input-field"
                  maxLength={50}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={form.email || ''}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field"
                  maxLength={120}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Địa chỉ</label>
              <input
                type="text"
                value={form.address || ''}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="input-field"
                maxLength={300}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Copyright</label>
              <input
                type="text"
                value={form.copyright || ''}
                onChange={(e) => setForm({ ...form, copyright: e.target.value })}
                className="input-field"
                maxLength={200}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Logo Footer</label>
              <div className="grid md:grid-cols-[160px_1fr] gap-3 items-start">
                <div className="border rounded-lg p-3 bg-gray-50 flex items-center justify-center min-h-[120px]">
                  {displayedFooterLogo ? (
                    <img src={displayedFooterLogo} alt="Footer logo preview" className="max-h-24 max-w-full object-contain" />
                  ) : (
                    <div className="text-center text-gray-400">
                      <FiImage size={28} className="mx-auto mb-1" />
                      <p className="text-[10px]">Chưa có logo</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <input
                    ref={footerInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleLogoChange}
                    className="hidden"
                  />

                  <input
                    type="text"
                    value={form.logoUrl || ''}
                    onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                    className="input-field text-xs"
                    placeholder="https://... hoặc upload bên dưới"
                    maxLength={500}
                  />

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => footerInputRef.current?.click()}
                      disabled={uploading}
                      className="btn-primary flex items-center gap-2 text-xs flex-1 justify-center"
                    >
                      <FiUpload size={14} />
                      {uploading ? 'Đang upload...' : form.logoUrl ? 'Thay logo' : 'Upload'}
                    </button>
                    {(form.logoUrl || footerPreview) && (
                      <button
                        type="button"
                        onClick={clearFooterLogo}
                        disabled={uploading}
                        className="btn-secondary flex items-center gap-2 text-xs text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <FiTrash2 size={14} />
                        Xoá
                      </button>
                    )}
                  </div>

                  <p className="text-[10px] text-gray-400">
                    PNG nền trong suốt khuyến nghị. Tối đa 5MB. Nhớ bấm <b>Lưu footer</b> sau khi upload.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Google Maps Embed</label>
              <textarea
                rows={2}
                value={form.mapEmbed || ''}
                onChange={(e) => setForm({ ...form, mapEmbed: e.target.value })}
                className="input-field"
                placeholder="https://www.google.com/maps/embed?pb=..."
                maxLength={500}
              />
              <p className="text-[10px] text-gray-400 mt-0.5">Dán link embed từ Google Maps (Share → Embed a map)</p>
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 text-xs">
                <FiSave size={14} />
                {saving ? 'Đang lưu...' : 'Lưu footer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default FooterSettings;
