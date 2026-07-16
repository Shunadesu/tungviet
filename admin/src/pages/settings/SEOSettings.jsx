import { useEffect, useState, useRef } from 'react';
import { FiUpload, FiTrash2, FiImage, FiSearch, FiGlobe } from 'react-icons/fi';
import HeaderWithBreadcrumb from './HeaderWithBreadcrumb';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../context/NotificationContext';

const ACCEPTED_FAVICON = ['image/x-icon', 'image/png', 'image/svg+xml', 'image/vnd.microsoft.icon'];
const MAX_SIZE = 5 * 1024 * 1024;

export default function SEOSettings() {
  const { addNotification } = useNotification();
  const faviconInputRef = useRef(null);
  const ogImageInputRef = useRef(null);

  const [seo, setSeo] = useState({
    defaultTitle: '',
    defaultDescription: '',
    defaultKeywords: '',
    ogImage: '',
    siteUrl: '',
  });
  const [faviconUrl, setFaviconUrl] = useState(null);
  const [faviconFilename, setFaviconFilename] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingSeo, setSavingSeo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [pendingFaviconFile, setPendingFaviconFile] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminApi.getSiteConfig();
        const data = res.data.data || {};
        const s = data.seo || {};
        setSeo({
          defaultTitle: s.defaultTitle || '',
          defaultDescription: s.defaultDescription || '',
          defaultKeywords: s.defaultKeywords || '',
          ogImage: s.ogImage || '',
          siteUrl: s.siteUrl || '',
        });
        setFaviconUrl(data.faviconUrl || null);
        setFaviconFilename(data.faviconFilename || null);
      } catch (err) {
        addNotification('Khong tai duoc cau hinh', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const set = (k, v) => setSeo((p) => ({ ...p, [k]: v }));

  const handleFaviconFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_FAVICON.includes(file.type)) {
      addNotification('Chi chap nhan file ICO, PNG, SVG', 'error');
      return;
    }
    if (file.size > MAX_SIZE) {
      addNotification('File qua lon (toi da 5MB)', 'error');
      return;
    }
    setPendingFaviconFile(file);
  };

  const handleOgImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      addNotification('Chi chap nhan JPG, PNG, WEBP', 'error');
      return;
    }
    if (file.size > MAX_SIZE) {
      addNotification('File qua lon (toi da 5MB)', 'error');
      return;
    }
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await adminApi.uploadImage(fd);
      const url = res.data?.url || res.data?.data?.url || '';
      if (url) set('ogImage', url);
      else throw new Error();
    } catch {
      addNotification('Upload that bai', 'error');
    }
  };

  const handleSaveSeo = async () => {
    setSavingSeo(true);
    try {
      await adminApi.updateSeo(seo);
      addNotification('Luu SEO thanh cong');
    } catch (err) {
      addNotification(err.response?.data?.message || 'Loi khi luu SEO', 'error');
    } finally {
      setSavingSeo(false);
    }
  };

  const handleUploadFavicon = async () => {
    if (!pendingFaviconFile) return;
    setUploadingFavicon(true);
    try {
      const res = await adminApi.uploadFavicon(pendingFaviconFile);
      const url = res.data?.data?.faviconUrl || '';
      if (url) {
        setFaviconUrl(url);
        setPendingFaviconFile(null);
        addNotification('Upload favicon thanh cong');
      } else {
        throw new Error();
      }
    } catch {
      addNotification('Upload favicon that bai', 'error');
    } finally {
      setUploadingFavicon(false);
    }
  };

  const handleClearFavicon = async () => {
    if (!faviconUrl) return;
    if (!confirm('Xoa favicon hien tai?')) return;
    try {
      await adminApi.clearLogo();
      setFaviconUrl(null);
      setFaviconFilename(null);
      addNotification('Da xoa favicon');
    } catch {
      addNotification('Xoa that bai', 'error');
    }
  };

  if (loading) {
    return (
      <>
        <HeaderWithBreadcrumb title="SEO & Favicon" />
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <HeaderWithBreadcrumb title="SEO & Favicon" />
      <div className="p-4 pt-3 max-w-3xl space-y-6">
        {/* SEO Global */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <FiSearch className="text-gray-400" size={18} />
            <h2 className="text-sm font-semibold text-gray-900">SEO Global</h2>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Cau hinh meta tags mac dinh cho toan bo site. Cac trang rieng le co the co SEO rieng.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Default Title</label>
              <input
                type="text"
                value={seo.defaultTitle}
                onChange={(e) => set('defaultTitle', e.target.value)}
                className="input-field"
                placeholder="Zuna Tungviet"
                maxLength={200}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{seo.defaultTitle.length}/200</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Default Description</label>
              <textarea
                value={seo.defaultDescription}
                onChange={(e) => set('defaultDescription', e.target.value)}
                className="input-field resize-none"
                rows={3}
                placeholder="Mo ta mac dinh cho trang..."
                maxLength={500}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{seo.defaultDescription.length}/500</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Default Keywords</label>
              <input
                type="text"
                value={seo.defaultKeywords}
                onChange={(e) => set('defaultKeywords', e.target.value)}
                className="input-field"
                placeholder="keyword1, keyword2, keyword3"
                maxLength={500}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">OG Image URL</label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={seo.ogImage}
                  onChange={(e) => set('ogImage', e.target.value)}
                  className="input-field flex-1"
                  placeholder="https://example.com/og-image.jpg"
                />
                <input
                  ref={ogImageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleOgImageFileChange}
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
                onChange={(e) => set('siteUrl', e.target.value)}
                className="input-field"
                placeholder="https://tungviet.fun"
                maxLength={300}
              />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t flex justify-end">
            <button
              onClick={handleSaveSeo}
              disabled={savingSeo}
              className="btn-primary text-sm disabled:opacity-60"
            >
              {savingSeo ? 'Dang luu...' : 'Luu SEO'}
            </button>
          </div>
        </div>

        {/* Favicon */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <FiGlobe className="text-gray-400" size={18} />
            <h2 className="text-sm font-semibold text-gray-900">Favicon</h2>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Favicon hien thi tren tab trinh duyet. Ho tro ICO, PNG, SVG. Toc da 5MB.
          </p>

          <div className="grid md:grid-cols-2 gap-6 items-start">
            <div className="border rounded-lg p-4 bg-gray-50 flex flex-col items-center justify-center min-h-[140px]">
              {faviconUrl || pendingFaviconFile ? (
                <div className="text-center">
                  <img
                    src={pendingFaviconFile ? URL.createObjectURL(pendingFaviconFile) : faviconUrl}
                    alt="Favicon preview"
                    className="w-12 h-12 object-contain mx-auto"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {pendingFaviconFile ? pendingFaviconFile.name : faviconFilename}
                  </p>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <FiImage size={32} className="mx-auto mb-1" />
                  <p className="text-xs">Chua co favicon</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-600 mb-1">Favicon hien tai:</p>
                <p className="text-xs text-gray-400 break-all bg-gray-50 border rounded p-2 min-h-[36px]">
                  {faviconUrl || <span className="italic">(trong)</span>}
                </p>
              </div>

              <input
                ref={faviconInputRef}
                type="file"
                accept=".ico,.png,.svg,image/x-icon,image/png,image/svg+xml"
                className="hidden"
                onChange={handleFaviconFileChange}
              />
              <button
                onClick={() => faviconInputRef.current?.click()}
                disabled={uploadingFavicon}
                className="btn-primary flex items-center gap-2 text-xs w-full justify-center"
              >
                <FiUpload size={14} />
                {uploadingFavicon ? 'Dang tai...' : 'Upload favicon'}
              </button>

              {pendingFaviconFile && (
                <button
                  onClick={handleUploadFavicon}
                  disabled={uploadingFavicon}
                  className="btn-secondary flex items-center gap-2 text-xs w-full justify-center"
                >
                  <FiUpload size={14} />
                  Xac nhan upload: {pendingFaviconFile.name}
                </button>
              )}

              {faviconUrl && (
                <button
                  onClick={handleClearFavicon}
                  className="btn-secondary flex items-center gap-2 text-xs w-full justify-center text-red-600 border-red-200 hover:bg-red-50"
                >
                  <FiTrash2 size={14} />
                  Xoa favicon
                </button>
              )}

              <p className="text-xs text-gray-400 pt-2 border-t">
                Kich thuoc khuyen nghi: 32x32px hoac 16x16px. Dung ICO de tuong thich tot nhat.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
