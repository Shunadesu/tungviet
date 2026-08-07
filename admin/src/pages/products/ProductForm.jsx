import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiUpload, FiX, FiFile, FiImage, FiList } from 'react-icons/fi';
import HeaderWithBreadcrumb from '../settings/HeaderWithBreadcrumb';
import RichEditor from '../../components/RichEditor';
import SEO from '../../components/SEO';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../context/NotificationContext';

const emptyForm = {
  productCode: '',
  name: '',
  nameEn: '',
  description: '',
  descriptionEn: '',
  imageUrl: '',
  mainTree: '',
  productLine: '',
  price: 0,
  priceVisible: true,
  webStatus: 'draft',
  targetAudience: '',
  softeningPoint: '',
  acidValue: '',
  color: '',
  attributes: {},
  benefits: [],
  benefitsText: '',
  applications: [],
  tdsUrl: '',
  isActive: true,
};

const WEB_STATUS_OPTIONS = [
  { value: 'draft', label: 'Nháp' },
  { value: 'published', label: 'Đã xuất bản' },
  { value: 'archived', label: 'Lưu trữ' },
];

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
  const [columns, setColumns] = useState([]);
  const [mainTrees, setMainTrees] = useState([]);
  const [categories, setCategories] = useState([]);
  const [benefitsTab, setBenefitsTab] = useState('list'); // 'list' | 'text'
  const [newBenefit, setNewBenefit] = useState('');

  useEffect(() => {
    fetchColumns();
    fetchMainTrees();
    if (isEditing) {
      fetchProduct();
    }
  }, [id]);

  useEffect(() => {
    fetchCategories();
  }, [formData.mainTree]);

  const fetchColumns = async () => {
    try {
      const res = await adminApi.getProductColumns();
      const items = Array.isArray(res.data?.data) ? res.data.data : [];
      setColumns(
        items.filter((column) => column.isActive !== false).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      );
    } catch (error) {
      console.error('Error loading product columns:', error);
    }
  };

  const fetchMainTrees = async () => {
    try {
      const res = await adminApi.getMainTrees();
      const items = Array.isArray(res.data?.data) ? res.data.data : [];
      setItemsInOrder(items, setMainTrees);
    } catch (error) {
      console.error('Error loading main trees:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const params = formData.mainTree ? { mainTree: formData.mainTree } : undefined;
      const res = await adminApi.getCategories(params);
      const items = Array.isArray(res.data?.data) ? res.data.data : res.data?.data?.items || [];
      setItemsInOrder(items, setCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const setItemsInOrder = (items, setter) => {
    setter([...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || (a.name || '').localeCompare(b.name || '')));
  };

  const fetchProduct = async () => {
    try {
      const res = await adminApi.getProduct(id);
      const product = res.data.data;
      const mainTreeId = product.mainTree?._id || product.mainTree || '';
      const productLineId = product.productLine?._id || product.productLine || '';
      setFormData({
        productCode: product.productCode || '',
        name: product.name || '',
        nameEn: product.nameEn || '',
        description: product.description || '',
        descriptionEn: product.descriptionEn || '',
        imageUrl: product.imageUrl || '',
        mainTree: mainTreeId,
        productLine: productLineId,
        price: product.price ?? 0,
        priceVisible: product.priceVisible !== false,
        webStatus: product.webStatus || 'draft',
        targetAudience: product.targetAudience || '',
        softeningPoint: product.softeningPoint || '',
        acidValue: product.acidValue || '',
        color: product.color || '',
        attributes: product.attributes && typeof product.attributes === 'object' ? product.attributes : {},
        benefits: product.benefits || [],
        benefitsText: '',
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
      let benefits = formData.benefits;
      if (benefitsTab === 'text' && formData.benefitsText.trim()) {
        // Parse text mode on submit
        benefits = formData.benefitsText
          .split(/\r?\n/)
          .map((line) => line.replace(/^[\s*▪•\-\u2022]+/, '').trim())
          .filter((line) => line.length > 0);
      } else {
        benefits = (formData.benefits || []).filter((b) => b.trim());
      }

      const data = {
        ...formData,
        attributes: { ...formData.attributes },
        benefits,
        applications: (formData.applications || []).filter((a) => a.trim()),
        mainTree: formData.mainTree || null,
        productLine: formData.productLine || null,
      };
      delete data.benefitsText;

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
      addNotification(error?.response?.data?.message || error?.message || 'Upload ảnh thất bại', 'error');
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
      }
    } catch (error) {
      addNotification(error?.response?.data?.message || 'Upload TDS thất bại', 'error');
    } finally {
      setUploadingTDS(false);
    }
  };

  const handleAddBenefit = () => {
    if (newBenefit.trim()) {
      setFormData({
        ...formData,
        benefits: [...(formData.benefits || []), newBenefit.trim()],
      });
      setNewBenefit('');
    }
  };

  const handleRemoveBenefit = (index) => {
    setFormData({
      ...formData,
      benefits: formData.benefits.filter((_, i) => i !== index),
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
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
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
            {/* Product Code */}
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">
                Mã sản phẩm (SKU)
              </label>
              <input
                type="text"
                value={formData.productCode}
                onChange={(e) => setFormData({ ...formData, productCode: e.target.value.toUpperCase() })}
                className="input-field"
                placeholder="VD: M130335"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Mã SKU duy nhất. Tự động uppercase.
              </p>
            </div>

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

            {/* Phân cấp: Main Tree + Product Line (dependent) */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">
                  Ngành hàng
                </label>
                <select
                  value={formData.mainTree}
                  onChange={(e) => setFormData({ ...formData, mainTree: e.target.value, productLine: '' })}
                  className="input-field"
                >
                  <option value="">— Chọn ngành hàng —</option>
                  {mainTrees.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} {t.nameEn ? `(${t.nameEn})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">
                  Product line
                </label>
                <select
                  value={formData.productLine}
                  onChange={(e) => setFormData({ ...formData, productLine: e.target.value })}
                  className="input-field"
                  disabled={!formData.mainTree}
                >
                  <option value="">— Chọn product line —</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} {c.nameEn ? `(${c.nameEn})` : ''}
                    </option>
                  ))}
                </select>
                {!formData.mainTree && (
                  <p className="text-[10px] text-gray-400 mt-1">
                    Chọn ngành hàng trước.
                  </p>
                )}
              </div>
            </div>

            {/* Price + visibility */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">
                  Giá (VND)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) || 0 })}
                  className="input-field"
                  min={0}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">
                  Hiển thị giá
                </label>
                <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.priceVisible}
                    onChange={(e) => setFormData({ ...formData, priceVisible: e.target.checked })}
                    className="rounded w-4 h-4"
                  />
                  <span className="text-xs">
                    {formData.priceVisible ? 'Hiển thị số tiền' : 'Hiển thị "Liên hệ"'}
                  </span>
                </label>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">
                  Trạng thái web
                </label>
                <select
                  value={formData.webStatus}
                  onChange={(e) => setFormData({ ...formData, webStatus: e.target.value })}
                  className="input-field"
                >
                  {WEB_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">
                Đối tượng mục tiêu
              </label>
              <textarea
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                rows={2}
                className="input-field resize-none"
                placeholder="VD: Nhà máy sản xuất sơn, xưởng mộc..."
              />
            </div>

            {/* Thông số kỹ thuật */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-gray-700">Thông số kỹ thuật</h3>
                <button
                  type="button"
                  onClick={() => navigate('/products/columns')}
                  className="text-[10px] text-primary hover:underline"
                >
                  Quản lý cột
                </button>
              </div>
              {columns.length > 0 ? (
                <div className="grid md:grid-cols-3 gap-4">
                  {columns.map((column) => (
                    <div key={column._id || column.key}>
                      <label className="block text-xs font-medium mb-1 text-gray-700">
                        {column.name}
                        {column.nameEn && <span className="text-[10px] text-gray-400 ml-1">({column.nameEn})</span>}
                      </label>
                      <input
                        type="text"
                        value={formData.attributes?.[column.key] ?? formData[column.key] ?? ''}
                        onChange={(event) =>
                          setFormData((previous) => ({
                            ...previous,
                            attributes: { ...previous.attributes, [column.key]: event.target.value },
                            ...(column.key in previous ? { [column.key]: event.target.value } : {}),
                          }))
                        }
                        className="input-field"
                        placeholder="Nhập thông số"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-300 px-4 py-5 text-xs text-gray-500">
                  Chưa có cột động. Các trường cũ vẫn có thể nhập bên dưới.
                </div>
              )}
              <details className="mt-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                <summary className="cursor-pointer text-xs text-gray-600">
                  Hiện trường thông số cũ (tương thích dữ liệu trước đây)
                </summary>
                <div className="grid md:grid-cols-3 gap-4 pt-3">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-700">Điểm làm mềm</label>
                    <input
                      type="text"
                      value={formData.softeningPoint}
                      onChange={(e) => setFormData({ ...formData, softeningPoint: e.target.value })}
                      className="input-field"
                      placeholder="VD: 85-95°C"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-700">Chỉ số axit</label>
                    <input
                      type="text"
                      value={formData.acidValue}
                      onChange={(e) => setFormData({ ...formData, acidValue: e.target.value })}
                      className="input-field"
                      placeholder="VD: ≤ 0.1 mg/g"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-700">Màu sắc</label>
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="input-field"
                      placeholder="VD: Vàng nhạt"
                    />
                  </div>
                </div>
              </details>
            </div>

            {/* Ảnh sản phẩm */}
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">Ảnh sản phẩm</label>
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
                    placeholder="Hoặc nhập URL"
                  />
                </div>
              </div>
            </div>

            {/* Lợi ích - 2 tabs */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-gray-700">Lợi ích sản phẩm</label>
                <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setBenefitsTab('list')}
                    className={`px-3 py-1 text-xs ${
                      benefitsTab === 'list' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Từng item
                  </button>
                  <button
                    type="button"
                    onClick={() => setBenefitsTab('text')}
                    className={`px-3 py-1 text-xs ${
                      benefitsTab === 'text' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Nhập text
                  </button>
                </div>
              </div>

              {benefitsTab === 'list' ? (
                <>
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
                    {(formData.benefits || []).map((b, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-green-50 text-green-600 rounded-lg"
                      >
                        {b}
                        <button type="button" onClick={() => handleRemoveBenefit(i)} className="hover:text-red-500">
                          <FiX size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <textarea
                    value={formData.benefitsText}
                    onChange={(e) => setFormData({ ...formData, benefitsText: e.target.value })}
                    rows={6}
                    className="input-field resize-none font-mono text-xs"
                    placeholder={'* Cải thiện độ cứng\n▪ Độ bám dính mạnh\n• Độ bóng tốt'}
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Hỗ trợ các ký tự đầu dòng: <code>*</code> <code>▪</code> <code>•</code> <code>-</code>.
                    Mỗi dòng là một lợi ích.
                  </p>
                </>
              )}
            </div>

            {/* Mô tả */}
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">Mô tả (tiếng Việt)</label>
              <RichEditor
                value={formData.description}
                onChange={(value) => setFormData({ ...formData, description: value })}
                placeholder="Nhập mô tả sản phẩm (tiếng Việt)..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">Mô tả (tiếng Anh)</label>
              <RichEditor
                value={formData.descriptionEn}
                onChange={(value) => setFormData({ ...formData, descriptionEn: value })}
                placeholder="English description (optional)"
              />
            </div>

            {/* TDS File */}
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">File TDS (PDF)</label>
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