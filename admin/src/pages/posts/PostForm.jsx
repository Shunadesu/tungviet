import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiX, FiUpload } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Header from '../../components/Header';
import SEO from '../../components/SEO';
import RichEditor from '../../components/RichEditor';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../context/NotificationContext';

const emptyForm = () => ({
  title: '', slug: '', excerpt: '', content: '',
  thumbnail: '', images: [], category: '', facebookUrl: '',
  seoTitle: '', seoDescription: '', seoKeywords: '',
  isActive: true, publishedAt: '',
});

const PostForm = () => {
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyForm());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [showSeo, setShowSeo] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    adminApi
      .getPostCategories()
      .then((res) => setCategories(res.data?.data || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      adminApi.getPost(id).then((res) => {
        const d = res.data?.data;
        if (d) {
          setForm({
            title: d.title || '',
            slug: d.slug || '',
            excerpt: d.excerpt || '',
            content: d.content || '',
            thumbnail: d.thumbnail || '',
            images: d.images || [],
            // Backend populate -> d.category là object { _id, name, ... }
            // Hoặc data cũ vẫn là string
            category: d.category?._id || d.category || '',
            facebookUrl: d.facebookUrl || '',
            seoTitle: d.seoTitle || '',
            seoDescription: d.seoDescription || '',
            seoKeywords: d.seoKeywords || '',
            isActive: d.isActive ?? true,
            publishedAt: d.publishedAt ? new Date(d.publishedAt).toISOString().slice(0, 16) : '',
          });
        }
      }).catch(() => addNotification('Loi khi tai bai viet', 'error'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleTitleChange = (v) => {
    set('title', v);
    if (!isEdit) {
      const slug = v.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');
      set('slug', slug);
    }
  };

  const uploadFile = async (file, field) => {
    const fd = new FormData();
    fd.append('file', file);
    if (field === 'thumbnail') { setUploadingThumb(true); }
    else { setUploadingGallery(true); }
    try {
      const res = await adminApi.uploadImage(fd);
      const url = res.data?.url || res.data?.data?.url || '';
      if (!url) throw new Error();
      if (field === 'thumbnail') set('thumbnail', url);
      else set('images', (prev) => [...prev, url]);
      return true;
    } catch { addNotification('Upload that bai', 'error'); return false; }
    finally {
      if (field === 'thumbnail') setUploadingThumb(false);
      else setUploadingGallery(false);
    }
  };

  const handleThumbUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) await uploadFile(file, 'thumbnail');
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) await uploadFile(file, 'gallery');
  };

  const removeGallery = (idx) => set('images', (prev) => prev.filter((_, i) => i !== idx));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { addNotification('Tieu de la bat buoc', 'error'); return; }
    if (!form.slug.trim()) { addNotification('Slug la bat buoc', 'error'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        publishedAt: form.publishedAt ? new Date(form.publishedAt) : null,
      };
      if (isEdit) {
        await adminApi.updatePost(id, payload);
        addNotification('Cap nhat thanh cong');
      } else {
        await adminApi.createPost(payload);
        addNotification('Tao bai viet thanh cong');
      }
      navigate('/posts');
    } catch (err) {
      addNotification(err.response?.data?.message || 'Loi khi luu', 'error');
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <SEO title={isEdit ? 'Sua bai viet' : 'Tao bai viet'} />
      <Header title={isEdit ? 'Sua bai viet' : 'Tao bai viet'} />

      <div className="p-4 max-w-4xl mx-auto">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tieu de *</label>
            <input type="text" value={form.title} onChange={(e) => handleTitleChange(e.target.value)}
              className="input-field" placeholder="Nhap tieu de bai viet" required />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
            <input type="text" value={form.slug} onChange={(e) => set('slug', e.target.value)}
              className="input-field" placeholder="slug-duoc-tao-tu-dong" />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mo ta ngan (excerpt)</label>
            <textarea value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)}
              className="input-field resize-none" rows={2} placeholder="Mo ta ngan cho bai viet, hien thi o trang danh sach" />
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Anh bia (thumbnail)</label>
            <div className="flex items-center gap-4">
              {form.thumbnail ? (
                <img src={form.thumbnail} alt="thumbnail" className="w-32 h-20 rounded-lg object-cover border" />
              ) : (
                <div className="w-32 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">Chua co</div>
              )}
              <div>
                <input type="file" accept="image/*" className="hidden" id="thumb-upload" onChange={handleThumbUpload} />
                <label htmlFor="thumb-upload" className="btn-secondary text-sm cursor-pointer">
                  {uploadingThumb ? 'Dang tai...' : 'Tai anh bia'}
                </label>
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Noi dung</label>
            <RichEditor
              value={form.content}
              onChange={(v) => set('content', v)}
              placeholder="Viet noi dung bai viet..."
            />
          </div>

          {/* Image Gallery */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thu vien hinh anh</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.images.map((url, idx) => (
                <div key={idx} className="relative group">
                  <img src={url} alt="" className="w-20 h-20 rounded-lg object-cover border" />
                  <button type="button" onClick={() => removeGallery(idx)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <FiX size={10} />
                  </button>
                </div>
              ))}
              <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                <input type="file" accept="image/*" multiple className="hidden" id="gallery-upload" onChange={handleGalleryUpload} />
                <label htmlFor="gallery-upload" className="cursor-pointer text-gray-400 hover:text-gray-600 flex flex-col items-center text-xs">
                  <FiUpload size={16} />
                  <span className="mt-1">{uploadingGallery ? '...' : 'Them'}</span>
                </label>
              </div>
            </div>
          </div>

          {/* Category + Facebook */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Danh muc</label>
              <select value={form.category} onChange={(e) => set('category', e.target.value)} className="input-field">
                <option value="">-- Chon danh muc --</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Quan ly danh muc tai /post-categories
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link Facebook</label>
              <input type="url" value={form.facebookUrl} onChange={(e) => set('facebookUrl', e.target.value)}
                className="input-field" placeholder="https://facebook.com/..." />
            </div>
          </div>

          {/* isActive + publishedAt */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngay dang</label>
              <input type="datetime-local" value={form.publishedAt} onChange={(e) => set('publishedAt', e.target.value)}
                className="input-field" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)}
                  className="w-4 h-4 rounded" />
                <span className="text-sm text-gray-700">Hien thi (Active)</span>
              </label>
            </div>
          </div>

          {/* SEO Section */}
          <div className="border rounded-lg overflow-hidden">
            <button type="button" onClick={() => setShowSeo(!showSeo)}
              className="w-full px-4 py-3 bg-gray-50 text-left text-sm font-medium text-gray-700 flex items-center justify-between hover:bg-gray-100 transition-colors">
              SEO Settings
              <span className="text-gray-400">{showSeo ? '▲' : '▼'}</span>
            </button>
            {showSeo && (
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">SEO Title</label>
                  <input type="text" value={form.seoTitle} onChange={(e) => set('seoTitle', e.target.value)}
                    className="input-field" placeholder="SEO title (neu de trong, dung title)" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">SEO Description</label>
                  <textarea value={form.seoDescription} onChange={(e) => set('seoDescription', e.target.value)}
                    className="input-field resize-none" rows={2} placeholder="Mo ta SEO" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">SEO Keywords</label>
                  <input type="text" value={form.seoKeywords} onChange={(e) => set('seoKeywords', e.target.value)}
                    className="input-field" placeholder="keyword1, keyword2, ..." />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <button type="button" onClick={() => navigate('/posts')} className="btn-secondary">Huy</button>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">{saving ? 'Dang luu...' : 'Luu bai viet'}</button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default PostForm;
