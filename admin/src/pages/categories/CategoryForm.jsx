import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiUpload, FiImage } from 'react-icons/fi';
import HeaderWithBreadcrumb from '../settings/HeaderWithBreadcrumb';
import RichEditor from '../../components/RichEditor';
import SEO from '../../components/SEO';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../context/NotificationContext';

const emptyForm = {
  name: '',
  nameEn: '',
  slug: '',
  description: '',
  descriptionEn: '',
  imageUrl: '',
  mainTree: '',
  order: 0,
  isActive: true,
};

const CategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [mainTrees, setMainTrees] = useState([]);
  const [formData, setFormData] = useState({ ...emptyForm });

  useEffect(() => {
    const fetchMainTrees = async () => {
      try {
        const res = await adminApi.getMainTrees();
        setMainTrees(Array.isArray(res.data?.data) ? res.data.data : []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMainTrees();
  }, []);

  useEffect(() => {
    if (!isEditing || !id) return;
    const fetchCategory = async () => {
      try {
        const res = await adminApi.getCategory(id);
        const cat = res.data?.data;
        if (!cat) {
          addNotification('Không tìm thấy product line', 'error');
          navigate('/categories');
          return;
        }
        const mtId = cat.mainTree?._id || cat.mainTree || '';
        setFormData({
          name: cat.name || '',
          nameEn: cat.nameEn || '',
          slug: cat.slug || '',
          description: cat.description || '',
          descriptionEn: cat.descriptionEn || '',
          imageUrl: cat.imageUrl || '',
          mainTree: mtId,
          order: cat.order ?? 0,
          isActive: cat.isActive !== false,
        });
      } catch (error) {
        addNotification(
          error.response?.data?.message || 'Không thể tải product line',
          'error'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [id, isEditing, navigate, addNotification]);

  const handleImageUpload = async (file) => {
    setUploadingImage(true);
    try {
      const res = await adminApi.uploadImage(file);
      const url = res?.data?.data?.url;
      if (url) {
        setFormData((prev) => ({ ...prev, imageUrl: url }));
        addNotification('Upload ảnh thành công');
      }
    } catch (err) {
      addNotification('Upload ảnh thất bại', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addNotification('Vui lòng nhập tên', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...formData,
        mainTree: formData.mainTree || null,
      };
      if (isEditing) {
        await adminApi.updateCategory(id, payload);
        addNotification('Cập nhật product line thành công');
      } else {
        await adminApi.createCategory(payload);
        addNotification('Thêm product line thành công');
      }
      navigate('/categories');
    } catch (error) {
      addNotification(
        error.response?.data?.message || 'Có lỗi xảy ra',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <>
      <SEO
        title={isEditing ? 'Sửa product line' : 'Thêm product line'}
        description="Quản lý product line"
        url="/categories"
      />
      <HeaderWithBreadcrumb
        title={isEditing ? 'Sửa product line' : 'Thêm product line'}
        breadcrumbs={[
          { label: 'Product line', path: '/categories' },
          { label: isEditing ? 'Sửa' : 'Thêm mới' },
        ]}
        actions={
          <button
            type="button"
            onClick={() => navigate('/categories')}
            className="btn-secondary flex items-center gap-1.5 text-xs"
          >
            <FiArrowLeft size={14} />
            Quay lại
          </button>
        }
      />

      <div className="p-4">
        <form
          onSubmit={handleSubmit}
          className="card max-w-4xl mx-auto space-y-3"
        >
          <div>
            <label className="block text-xs font-medium mb-1">
              Tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              className="input-field"
              placeholder="VD: ROSIN MODIFIED MALEIC RESIN"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">
              Tên tiếng Anh
            </label>
            <input
              type="text"
              value={formData.nameEn}
              onChange={(e) =>
                setFormData({ ...formData, nameEn: e.target.value })
              }
              className="input-field"
              placeholder="English name (optional)"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">
              Slug (tự động nếu trống)
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              className="input-field"
              placeholder="rosin-modified-maleic-resin"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">
              Ngành hàng
            </label>
            <select
              value={formData.mainTree}
              onChange={(e) =>
                setFormData({ ...formData, mainTree: e.target.value })
              }
              className="input-field"
            >
              <option value="">— Chọn ngành hàng —</option>
              {mainTrees.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} {t.nameEn ? `(${t.nameEn})` : ''}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-gray-400 mt-1">
              Optional. Có thể để trống nếu product line đứng độc lập.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Hình ảnh</label>
            <div className="flex items-center gap-2">
              {formData.imageUrl ? (
                <img
                  src={formData.imageUrl}
                  alt=""
                  className="w-12 h-12 rounded object-cover border"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                  <FiImage size={16} />
                </div>
              )}
              <label className="btn-secondary text-xs flex items-center gap-1 cursor-pointer">
                <FiUpload size={12} />
                {uploadingImage ? 'Đang upload...' : 'Upload'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                    e.target.value = '';
                  }}
                />
              </label>
            </div>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) =>
                setFormData({ ...formData, imageUrl: e.target.value })
              }
              className="input-field mt-2 text-xs"
              placeholder="Hoặc nhập URL"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Mô tả</label>
            <RichEditor
              value={formData.description}
              onChange={(value) =>
                setFormData({ ...formData, description: value })
              }
              placeholder="Mô tả..."
              minHeight={140}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">
              Mô tả tiếng Anh
            </label>
            <RichEditor
              value={formData.descriptionEn}
              onChange={(value) =>
                setFormData({ ...formData, descriptionEn: value })
              }
              placeholder="English description"
              minHeight={140}
            />
          </div>

          <div className="flex items-center gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">
                Thứ tự
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    order: Number(e.target.value) || 0,
                  })
                }
                className="input-field w-24"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none mt-5">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="rounded"
              />
              <span className="text-xs font-medium">Đang hoạt động</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => navigate('/categories')}
              className="btn-secondary text-xs"
              disabled={saving}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn-primary text-xs flex items-center gap-1.5 disabled:opacity-50"
              disabled={saving}
            >
              <FiSave size={14} />
              {saving
                ? 'Đang lưu...'
                : isEditing
                ? 'Cập nhật'
                : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CategoryForm;