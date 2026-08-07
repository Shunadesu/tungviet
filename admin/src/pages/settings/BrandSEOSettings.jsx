import { useEffect, useRef, useState } from 'react';
import {
  FiUpload,
  FiTrash2,
  FiImage,
  FiSearch,
  FiGlobe,
  FiSave,
} from 'react-icons/fi';
import HeaderWithBreadcrumb from './HeaderWithBreadcrumb';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../context/NotificationContext';

const LOGO_ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];
const FAVICON_ACCEPTED = [
  'image/x-icon',
  'image/png',
  'image/svg+xml',
  'image/vnd.microsoft.icon',
];
const OG_ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024;

const BrandSEOSettings = () => {
  const { addNotification } = useNotification();

  const logoInputRef = useRef(null);
  const faviconInputRef = useRef(null);
  const ogImageInputRef = useRef(null);

  const [loading, setLoading] = useState(true);

  // Logo state
  const [logoUrl, setLogoUrl] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Favicon state
  const [faviconUrl, setFaviconUrl] = useState(null);
  const [faviconFilename, setFaviconFilename] = useState(null);
  const [pendingFaviconFile, setPendingFaviconFile] = useState(null);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  // SEO state
  const [seo, setSeo] = useState({
    defaultTitle: '',
    defaultDescription: '',
    defaultKeywords: '',
    ogImage: '',
    siteUrl: '',
  });
  const [savingSeo, setSavingSeo] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminApi.getSiteConfig();
        const data = res.data.data || {};
        setLogoUrl(data.logoUrl || null);
        setFaviconUrl(data.faviconUrl || null);
        setFaviconFilename(data.faviconFilename || null);
        const s = data.seo || {};
        setSeo({
          defaultTitle: s.defaultTitle || '',
          defaultDescription: s.defaultDescription || '',
          defaultKeywords: s.defaultKeywords || '',
          ogImage: s.ogImage || '',
          siteUrl: s.siteUrl || '',
        });
      } catch (err) {
        addNotification('Không tải được cấu hình', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const setSeoField = (key, value) => setSeo((prev) => ({ ...prev, [key]: value }));

  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!LOGO_ACCEPTED.includes(file.type)) {
      addNotification('Chỉ chấp nhận file JPG, PNG, WEBP', 'error');
      return;
    }
    if (file.size > MAX_SIZE) {
      addNotification('File quá lớn (tối đa 5MB)', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);

    setUploadingLogo(true);
    try {
      const res = await adminApi.uploadLogo(file);
      setLogoUrl(res.data.data.logoUrl);
      setLogoPreview(null);
      addNotification('Upload logo thành công');
    } catch (err) {
      addNotification(err.response?.data?.message || 'Upload thất bại', 'error');
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const handleClearLogo = async () => {
    if (!window.confirm('Xoá logo hiện tại? Header sẽ quay về mặc định.')) return;
    try {
      await adminApi.clearLogo();
      setLogoUrl(null);
      addNotification('Đã xoá logo');
    } catch (err) {
      addNotification(err.response?.data?.message || 'Xoá thất bại', 'error');
    }
  };

  const handleFaviconChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!FAVICON_ACCEPTED.includes(file.type)) {
      addNotification('Chỉ chấp nhận file ICO, PNG, SVG', 'error');
      return;
    }
    if (file.size > MAX_SIZE) {
      addNotification('File quá lớn (tối đa 5MB)', 'error');
      return;
    }
    setPendingFaviconFile(file);
  };

  const handleUploadFavicon = async () => {
    if (!pendingFaviconFile) return;
    setUploadingFavicon(true);
    try {
      const res = await adminApi.uploadFavicon(pendingFaviconFile);
      const url = res.data?.data?.faviconUrl || '';
      if (!url) throw new Error();
      setFaviconUrl(url);
      setPendingFaviconFile(null);
      addNotification('Upload favicon thành công');
    } catch (err) {
      addNotification('Upload favicon thất bại', 'error');
    } finally {
      setUploadingFavicon(false);
    }
  };

  const handleClearFavicon = async () => {
    if (!faviconUrl) return;
    if (!window.confirm('Xoá favicon hiện tại?')) return;
    try {
      await adminApi.clearLogo();
      setFaviconUrl(null);
      setFaviconFilename(null);
      addNotification('Đã xoá favicon');
    } catch (err) {
      addNotification('Xoá thất bại', 'error');
    }
  };

  const handleOgImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!OG_ACCEPTED.includes(file.type)) {
      addNotification('Chỉ chấp nhận file JPG, PNG, WEBP', 'error');
      return;
    }
    if (file.size > MAX_SIZE) {
      addNotification('File quá lớn (tối đa 5MB)', 'error');
      return;
    }
    try {
      const res = await adminApi.uploadImage(file);
      const url = res.data?.data?.url || res.data?.url || '';
      if (url) {
        setSeoField('ogImage', url);
        addNotification('Upload ảnh OG thành công');
      }
    } catch (err) {
      addNotification('Upload ảnh OG thất bại', 'error');
    } finally {
      if (ogImageInputRef.current) ogImageInputRef.current.value = '';
    }
  };

  const handleSaveSeo = async () => {
    setSavingSeo(true);
    try {
      await adminApi.updateSeo(seo);
      addNotification('Lưu SEO thành công');
    } catch (err) {
      addNotification(err.response?.data?.message || 'Lỗi khi lưu SEO', 'error');
    } finally {
      setSavingSeo(false);
    }
  };

  if (loading) {
    return (
      <>
        <HeaderWithBreadcrumb title="Thương hiệu & SEO" />
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  const displayedLogoUrl = logoPreview || logoUrl;

  return (
    <>
      <HeaderWithBreadcrumb title="Thương hiệu & SEO" />
      <div className="p-6 pt-3 max-w-5xl space-y-5">
        {/* Logo */}
        <div className="card p-5">
          <div className="flex items-start gap-3 pb-4 mb-4 border-b border-gray-100">
            <div className="p-2 bg-primary-50 rounded-lg text-primary">
              <FiImage size={18} />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-gray-900">Logo</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Logo hiển thị trên header của trang client. Nên dùng ảnh PNG nền trong suốt, tỉ lệ ngang, tối đa 5MB.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-[280px_1fr] gap-5 items-stretch">
            <div className="border rounded-lg p-6 bg-gray-50 flex items-center justify-center min-h-[200px]">
              {displayedLogoUrl ? (
                <img src={displayedLogoUrl} alt="Logo preview" className="max-h-32 max-w-full object-contain" />
              ) : (
                <div className="text-center text-gray-400">
                  <FiImage size={40} className="mx-auto mb-2" />
                  <p className="text-xs">Chưa có logo (sẽ dùng mặc định)</p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Logo hiện tại</label>
                <div className="text-xs text-gray-600 break-all bg-gray-50 border rounded-lg p-2.5 min-h-[40px]">
                  {logoUrl || <span className="text-gray-400 italic">(trống)</span>}
                </div>
              </div>

              <input
                ref={logoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleLogoChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                disabled={uploadingLogo}
                className="btn-primary flex items-center gap-2 text-xs w-full justify-center"
              >
                <FiUpload size={14} />
                {uploadingLogo ? 'Đang upload...' : logoUrl ? 'Thay logo mới' : 'Upload logo'}
              </button>

              {logoUrl && (
                <button
                  type="button"
                  onClick={handleClearLogo}
                  disabled={uploadingLogo}
                  className="btn-secondary flex items-center gap-2 text-xs w-full justify-center text-red-600 border-red-200 hover:bg-red-50"
                >
                  <FiTrash2 size={14} />
                  Xoá logo
                </button>
              )}

              <div className="mt-auto pt-3 border-t border-gray-100 text-[11px] text-gray-500 leading-relaxed">
                <p className="font-medium text-gray-600 mb-1">Gợi ý</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Định dạng: JPG, PNG, WEBP — tối đa 5MB</li>
                  <li>Tỉ lệ ngang, nền trong suốt (PNG) cho header</li>
                  <li>Khi xoá, header sẽ về logo mặc định</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Favicon */}
        <div className="card p-5">
          <div className="flex items-start gap-3 pb-4 mb-4 border-b border-gray-100">
            <div className="p-2 bg-primary-50 rounded-lg text-primary">
              <FiGlobe size={18} />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-gray-900">Favicon</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Favicon hiển thị trên tab trình duyệt. Hỗ trợ ICO, PNG, SVG. Tối đa 5MB. Kích thước khuyến nghị: 32×32 hoặc 16×16.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-[280px_1fr] gap-5 items-stretch">
            <div className="border rounded-lg p-6 bg-gray-50 flex flex-col items-center justify-center min-h-[200px]">
              {faviconUrl || pendingFaviconFile ? (
                <div className="text-center">
                  <img
                    src={pendingFaviconFile ? URL.createObjectURL(pendingFaviconFile) : faviconUrl}
                    alt="Favicon preview"
                    className="w-16 h-16 object-contain mx-auto"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {pendingFaviconFile ? pendingFaviconFile.name : faviconFilename}
                  </p>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <FiImage size={32} className="mx-auto mb-1" />
                  <p className="text-xs">Chưa có favicon</p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <p className="block text-xs font-medium mb-1 text-gray-700">Favicon hiện tại</p>
                <p className="text-xs text-gray-400 break-all bg-gray-50 border rounded-lg p-2.5 min-h-[40px]">
                  {faviconUrl || <span className="italic">(trống)</span>}
                </p>
              </div>

              <input
                ref={faviconInputRef}
                type="file"
                accept=".ico,.png,.svg,image/x-icon,image/png,image/svg+xml"
                className="hidden"
                onChange={handleFaviconChange}
              />
              <button
                type="button"
                onClick={() => faviconInputRef.current?.click()}
                disabled={uploadingFavicon}
                className="btn-primary flex items-center gap-2 text-xs w-full justify-center"
              >
                <FiUpload size={14} />
                {uploadingFavicon ? 'Đang tải...' : 'Upload favicon'}
              </button>

              {pendingFaviconFile && (
                <button
                  type="button"
                  onClick={handleUploadFavicon}
                  disabled={uploadingFavicon}
                  className="btn-secondary flex items-center gap-2 text-xs w-full justify-center"
                >
                  <FiUpload size={14} />
                  Xác nhận upload: {pendingFaviconFile.name}
                </button>
              )}

              {faviconUrl && (
                <button
                  type="button"
                  onClick={handleClearFavicon}
                  className="btn-secondary flex items-center gap-2 text-xs w-full justify-center text-red-600 border-red-200 hover:bg-red-50"
                >
                  <FiTrash2 size={14} />
                  Xoá favicon
                </button>
              )}

              <div className="mt-auto pt-3 border-t border-gray-100 text-[11px] text-gray-500 leading-relaxed">
                <p className="font-medium text-gray-600 mb-1">Gợi ý</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Kích thước khuyến nghị: 32×32 hoặc 16×16</li>
                  <li>Dùng ICO để tương thích tốt nhất</li>
                  <li>Có thể dùng SVG cho icon vector</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* SEO Global */}
        <div className="card p-5">
          <div className="flex items-start gap-3 pb-4 mb-4 border-b border-gray-100">
            <div className="p-2 bg-primary-50 rounded-lg text-primary">
              <FiSearch size={18} />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-gray-900">SEO Global</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Cấu hình meta tags mặc định cho toàn bộ site. Các trang riêng lẻ có thể có SEO riêng.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Default Title</label>
              <input
                type="text"
                value={seo.defaultTitle}
                onChange={(e) => setSeoField('defaultTitle', e.target.value)}
                className="input-field"
                placeholder="Tungviet"
                maxLength={200}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{seo.defaultTitle.length}/200</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Default Keywords</label>
              <input
                type="text"
                value={seo.defaultKeywords}
                onChange={(e) => setSeoField('defaultKeywords', e.target.value)}
                className="input-field"
                placeholder="keyword1, keyword2, keyword3"
                maxLength={500}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{seo.defaultKeywords.length}/500</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Default Description</label>
              <textarea
                value={seo.defaultDescription}
                onChange={(e) => setSeoField('defaultDescription', e.target.value)}
                className="input-field resize-none"
                rows={3}
                placeholder="Mô tả mặc định cho trang..."
                maxLength={500}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{seo.defaultDescription.length}/500</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">OG Image URL</label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={seo.ogImage}
                  onChange={(e) => setSeoField('ogImage', e.target.value)}
                  className="input-field flex-1"
                  placeholder="https://example.com/og-image.jpg"
                />
                <input
                  ref={ogImageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleOgImageChange}
                />
                <button
                  type="button"
                  onClick={() => ogImageInputRef.current?.click()}
                  className="btn-secondary text-xs whitespace-nowrap"
                >
                  Upload
                </button>
              </div>
              {seo.ogImage && (
                <img src={seo.ogImage} alt="OG preview" className="mt-2 h-32 rounded-lg border object-contain bg-gray-50" />
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Site URL</label>
              <input
                type="url"
                value={seo.siteUrl}
                onChange={(e) => setSeoField('siteUrl', e.target.value)}
                className="input-field"
                placeholder="https://tungviet.fun"
                maxLength={300}
              />
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="button"
              onClick={handleSaveSeo}
              disabled={savingSeo}
              className="btn-primary text-sm disabled:opacity-60 flex items-center gap-2"
            >
              <FiSave size={14} />
              {savingSeo ? 'Đang lưu...' : 'Lưu SEO'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BrandSEOSettings;