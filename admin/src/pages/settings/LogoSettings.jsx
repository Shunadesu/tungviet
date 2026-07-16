import { useEffect, useRef, useState } from 'react';
import { FiUpload, FiTrash2, FiImage } from 'react-icons/fi';
import HeaderWithBreadcrumb from './HeaderWithBreadcrumb';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../context/NotificationContext';

const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];

const LogoSettings = () => {
  const { addNotification } = useNotification();
  const [logoUrl, setLogoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminApi.getSiteConfig();
        setLogoUrl(res.data.data?.logoUrl || null);
      } catch (err) {
        addNotification('Không tải được cấu hình site', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleFileChange = async (e) => {
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
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const res = await adminApi.uploadLogo(file);
      setLogoUrl(res.data.data.logoUrl);
      setPreview(null);
      addNotification('Upload logo thành công');
    } catch (err) {
      addNotification(err.response?.data?.message || 'Upload thất bại', 'error');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleClear = async () => {
    if (!confirm('Xoá logo hiện tại? Header sẽ quay về mặc định.')) return;
    try {
      await adminApi.clearLogo();
      setLogoUrl(null);
      addNotification('Đã xoá logo');
    } catch (err) {
      addNotification(err.response?.data?.message || 'Xoá thất bại', 'error');
    }
  };

  if (loading) {
    return (
      <>
        <HeaderWithBreadcrumb title="Logo" />
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  const displayedUrl = preview || logoUrl;

  return (
    <>
      <HeaderWithBreadcrumb title="Logo" />
      <div className="p-4 pt-3 max-w-3xl">
        <div className="card">
          <div className="grid md:grid-cols-2 gap-6 items-start">
            <div className="border rounded-lg p-6 bg-gray-50 flex items-center justify-center min-h-[180px]">
              {displayedUrl ? (
                <img src={displayedUrl} alt="Logo preview" className="max-h-28 max-w-full object-contain" />
              ) : (
                <div className="text-center text-gray-400">
                  <FiImage size={40} className="mx-auto mb-2" />
                  <p className="text-xs">Chưa có logo (sẽ dùng mặc định)</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1">Logo hiện tại</label>
                <div className="text-xs text-gray-600 break-all bg-gray-50 border rounded p-2 min-h-[40px]">
                  {logoUrl || <span className="text-gray-400 italic">(trống)</span>}
                </div>
              </div>

              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="btn-primary flex items-center gap-2 text-xs w-full justify-center"
              >
                <FiUpload size={14} />
                {uploading ? 'Đang upload...' : logoUrl ? 'Thay logo mới' : 'Upload logo'}
              </button>

              {logoUrl && (
                <button
                  onClick={handleClear}
                  disabled={uploading}
                  className="btn-secondary flex items-center gap-2 text-xs w-full justify-center text-red-600 border-red-200 hover:bg-red-50"
                >
                  <FiTrash2 size={14} />
                  Xoá logo
                </button>
              )}

              <p className="text-xs text-gray-500 pt-2 border-t">
                Nên dùng ảnh PNG nền trong suốt, tỉ lệ ngang, tối đa 5MB.
                Logo sẽ hiển thị trên header của trang client.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LogoSettings;