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
  iconUrl: '',
  order: 0,
  isActive: true,
};

const MainTreeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [formData, setFormData] = useState({ ...emptyForm });

  useEffect(() => {
    if (!isEditing) return;
    const fetchTree = async () => {
      try {
        const res = await adminApi.getMainTree(id);
        const tree = res.data?.data;
        if (!tree) {
          addNotification('Không tìm thấy ngành hàng', 'error');
          navigate('/main-trees');
          return;
        }
        setFormData({
          name: tree.name || '',
          nameEn: tree.nameEn || '',
          slug: tree.slug || '',
          description: tree.description || '',
          descriptionEn: tree.descriptionEn || '',
          imageUrl: tree.imageUrl || '',
          iconUrl: tree.iconUrl || '',
          order: tree.order ?? 0,
          isActive: tree.isActive !== false,
        });
      } catch (error) {
        addNotification(
          error.response?.data?.message || 'Không thể tải ngành hàng',
          'error'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchTree();
  }, [id, isEditing, navigate, addNotification]);

  const handleImageUpload = async (file, field) => {
    const setter = field === 'iconUrl' ? setUploadingIcon : setUploadingImage;
    setter(true);
    try {
      const res = await adminApi.uploadImage(file);
      const url = res?.data?.data?.url;
      if (url) {
        setFormData((prev) => ({ ...prev, [field]: url }));
        addNotification('Upload ảnh thành công');
      }
    } catch (err) {
      addNotification('Upload ảnh thất bại', 'error');
    } finally {
      setter(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addNotification('Vui lòng nhập tên ngành hàng', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...formData };
      if (isEditing) {
        await adminApi.updateMainTree(id, payload);
        addNotification('Cập nhật ngành hàng thành công');
      } else {
        await adminApi.createMainTree(payload);
        addNotification('Thêm ngành hàng thành công');
      }
      navigate('/main-trees');
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
        title={isEditing ? 'Sửa ngành sản phẩm' : 'Thêm ngành sản phẩm'}
        description="Quản lý cây ngành sản phẩm"
        url="/main-trees"
      />
      <HeaderWithBreadcrumb
        title={isEditing ? 'Sửa ngành sản phẩm' : 'Thêm ngành sản phẩm'}
        breadcrumbs={[
          { label: 'Cây ngành sản phẩm', path: '/main-trees' },
          { label: isEditing ? 'Sửa' : 'Thêm mới' },
        ]}
        actions={
          <button
            type="button"
            onClick={() => navigate('/main-trees')}
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
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">
                Tên ngành hàng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="input-field"
                placeholder="VD: Hóa chất công nghiệp"
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
                placeholder="Industrial Chemicals"
              />
            </div>
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
              placeholder="hoa-chat-cong-nghiep"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Mô tả</label>
            <RichEditor
              value={formData.description}
              onChange={(value) =>
                setFormData({ ...formData, description: value })
              }
              placeholder="Mô tả ngắn..."
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

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">
                Banner (imageUrl)
              </label>
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
                      if (file) handleImageUpload(file, 'imageUrl');
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
              <label className="block text-xs font-medium mb-1">Icon</label>
              <div className="flex items-center gap-2">
                {formData.iconUrl ? (
                  <img
                    src={formData.iconUrl}
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
                  {uploadingIcon ? 'Đang upload...' : 'Upload'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'iconUrl');
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
              <input
                type="url"
                value={formData.iconUrl}
                onChange={(e) =>
                  setFormData({ ...formData, iconUrl: e.target.value })
                }
                className="input-field mt-2 text-xs"
                placeholder="Hoặc nhập URL"
              />
            </div>
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
              onClick={() => navigate('/main-trees')}
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

export default MainTreeForm;