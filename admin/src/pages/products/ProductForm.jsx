import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiUpload, FiX, FiFile, FiImage } from 'react-icons/fi';
import HeaderWithBreadcrumb from '../settings/HeaderWithBreadcrumb';
import RichEditor from '../../components/RichEditor';
import SEO from '../../components/SEO';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../context/NotificationContext';

const emptyForm = {
  name: '',
  nameEn: '',
  description: '',
  descriptionEn: '',
  imageUrl: '',
  softeningPoint: '',
  acidValue: '',
  color: '',
  benefits: [],
  applications: [],
  tdsUrl: '',
  isActive: true,
};

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingTDS, setUploadingTDS] = useState(false);

  const [formData, setFormData] = useState({ ...emptyForm });
  const [newBenefit, setNewBenefit] = useState('');
  const [newApplication, setNewApplication] = useState('');

  useEffect(() => {
    if (isEditing) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await adminApi.getProduct(id);
      const product = res.data.data;
      setFormData({
        name: product.name || '',
        nameEn: product.nameEn || '',
        description: product.description || '',
        descriptionEn: product.descriptionEn || '',
        imageUrl: product.imageUrl || '',
        softeningPoint: product.softeningPoint || '',
        acidValue: product.acidValue || '',
        color: product.color || '',
        benefits: product.benefits || [],
        applications: product.applications || [],
        tdsUrl: product.tdsUrl || '',
        isActive: product.isActive !== false,
      });
    } catch (error) {
      addNotification('Không tải được thông tin sản phẩm', 'error');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        ...formData,
        benefits: formData.benefits.filter((b) => b.trim()),
        applications: formData.applications.filter((a) => a.trim()),
      };

      if (isEditing) {
        await adminApi.updateProduct(id, data);
        addNotification('Cập nhật sản phẩm thành công');
      } else {
        await adminApi.createProduct(data);
        addNotification('Thêm sản phẩm thành công');
      }
      navigate('/products');
    } catch (error) {
      addNotification(error.response?.data?.message || 'Có lỗi xảy ra', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file) => {
    setUploadingImage(true);
    try {
      const res = await adminApi.uploadImage(file);
      const url = res?.data?.data?.url;
      if (url) {
        setFormData((prev) => ({ ...prev, imageUrl: url }));
        addNotification('Upload ảnh thành công');
      } else {
        addNotification(res?.data?.message || 'Upload ảnh thất bại', 'error');
      }
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || 'Upload ảnh thất bại';
      console.error('[ProductForm] upload error:', error);
      addNotification(msg, 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleTDSUpload = async (file) => {
    setUploadingTDS(true);
    try {
      const res = await adminApi.uploadPDF(file);
      const url = res?.data?.data?.url;
      if (url) {
        setFormData((prev) => ({ ...prev, tdsUrl: url }));
        addNotification('Upload TDS thành công');
      } else {
        addNotification(res?.data?.message || 'Upload TDS thất bại', 'error');
      }
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || 'Upload TDS thất bại';
      console.error('[ProductForm] upload TDS error:', error);
      addNotification(msg, 'error');
    } finally {
      setUploadingTDS(false);
    }
  };

  const handleAddBenefit = () => {
    if (newBenefit.trim()) {
      setFormData({ ...formData, benefits: [...formData.benefits, newBenefit.trim()] });
      setNewBenefit('');
    }
  };

  const handleAddApplication = () => {
    if (newApplication.trim()) {
      setFormData({ ...formData, applications: [...formData.applications, newApplication.trim()] });
      setNewApplication('');
    }
  };

  const handleRemoveBenefit = (index) => {
    setFormData({
      ...formData,
      benefits: formData.benefits.filter((_, i) => i !== index),
    });
  };

  const handleRemoveApplication = (index) => {
    setFormData({
      ...formData,
      applications: formData.applications.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return (
      <>
        <HeaderWithBreadcrumb
          title={isEditing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
          backTo="/products"
          backLabel="Danh sách sản phẩm"
        />
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO title={isEditing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'} description="Quản lý sản phẩm" url="/products" />
      <HeaderWithBreadcrumb
        title={isEditing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
        backTo="/products"
        backLabel="Danh sách sản phẩm"
      />
      <div className="p-4 pt-3 max-w-4xl">
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tên sản phẩm */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">
                  Tên sản phẩm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="input-field"
                  placeholder="Tên tiếng Việt"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">
                  Tên tiếng Anh
                </label>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  className="input-field"
                  placeholder="English name (tùy chọn)"
                />
              </div>
            </div>

            {/* Thông số kỹ thuật */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">
                  Điểm làm mềm
                </label>
                <input
                  type="text"
                  value={formData.softeningPoint}
                  onChange={(e) => setFormData({ ...formData, softeningPoint: e.target.value })}
                  className="input-field"
                  placeholder="VD: 85-95°C"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">
                  Chỉ số axit
                </label>
                <input
                  type="text"
                  value={formData.acidValue}
                  onChange={(e) => setFormData({ ...formData, acidValue: e.target.value })}
                  className="input-field"
                  placeholder="VD: ≤ 0.1 mg/g"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">
                  Màu sắc
                </label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="input-field"
                  placeholder="VD: Vàng nhạt"
                />
              </div>
            </div>

            {/* Ảnh sản phẩm */}
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">
                Ảnh sản phẩm
              </label>
              <div className="flex items-center gap-3">
                {formData.imageUrl ? (
                  <div className="relative group">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-20 h-20 rounded-lg object-cover border"
                      onError={(e) => {
                        e.target.src = '';
                        e.target.classList.add('hidden');
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: '' })}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiX size={10} />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                    <FiImage size={20} />
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <label className="btn-secondary flex items-center gap-1 text-xs cursor-pointer">
                    <FiUpload size={14} />
                    {uploadingImage ? 'Đang upload...' : 'Upload ảnh'}
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
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="input-field text-xs"
                    placeholder="Hoặc nhập URL: https://..."
                  />
                </div>
              </div>
            </div>

            {/* Lợi ích */}
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">
                Lợi ích sản phẩm
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddBenefit();
                    }
                  }}
                  className="input-field flex-1"
                  placeholder="VD: Chịu nhiệt tốt..."
                />
                <button type="button" onClick={handleAddBenefit} className="btn-secondary text-xs px-3">
                  Thêm
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {formData.benefits.map((b, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-green-50 text-green-600 rounded-lg"
                  >
                    {b}
                    <button
                      type="button"
                      onClick={() => handleRemoveBenefit(i)}
                      className="hover:text-red-500"
                    >
                      <FiX size={10} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Ứng dụng */}
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">
                Ứng dụng
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newApplication}
                  onChange={(e) => setNewApplication(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddApplication();
                    }
                  }}
                  className="input-field flex-1"
                  placeholder="VD: Đường bộ, Cầu cảng..."
                />
                <button type="button" onClick={handleAddApplication} className="btn-secondary text-xs px-3">
                  Thêm
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {formData.applications.map((a, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-purple-50 text-purple-600 rounded-lg"
                  >
                    {a}
                    <button
                      type="button"
                      onClick={() => handleRemoveApplication(i)}
                      className="hover:text-red-500"
                    >
                      <FiX size={10} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Mô tả */}
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">
                Mô tả (tiếng Việt)
              </label>
              <RichEditor
                value={formData.description}
                onChange={(value) => setFormData({ ...formData, description: value })}
                placeholder="Nhập mô tả sản phẩm (tiếng Việt)..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">
                Mô tả (tiếng Anh)
              </label>
              <RichEditor
                value={formData.descriptionEn}
                onChange={(value) => setFormData({ ...formData, descriptionEn: value })}
                placeholder="English description (optional)"
              />
            </div>

            {/* TDS File */}
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">
                File TDS (PDF)
              </label>
              <div className="flex items-center gap-2">
                {formData.tdsUrl ? (
                  <a
                    href={formData.tdsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 px-3 py-2 bg-blue-50 rounded-lg"
                  >
                    <FiFile size={14} />
                    Xem file hiện tại
                  </a>
                ) : (
                  <span className="text-xs text-gray-400 px-3 py-2">Chưa có file</span>
                )}
                <label className="btn-secondary flex items-center gap-1 text-xs cursor-pointer">
                  <FiUpload size={14} />
                  {uploadingTDS ? 'Đang upload...' : 'Upload PDF'}
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleTDSUpload(file);
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Trạng thái */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700">Đang hoạt động</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t">
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                <FiArrowLeft size={16} />
                Quay lại
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <FiSave size={16} />
                {saving ? 'Đang lưu...' : isEditing ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ProductForm;