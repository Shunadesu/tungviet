import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiUpload, FiX, FiFile, FiImage, FiList, FiChevronDown, FiChevronUp, FiPlus, FiTrash2, FiPackage } from 'react-icons/fi';
import HeaderWithBreadcrumb from '../settings/HeaderWithBreadcrumb';
import RichEditor from '../../components/RichEditor';
import SEO from '../../components/SEO';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../context/NotificationContext';

const MultiIndustrySelect = ({ items, selected, onChange }) => {
  const [open, setOpen] = useState(false);
  const selectedIds = Array.isArray(selected) ? selected : [];
  const selectedSet = new Set(selectedIds);
  const selectedNodes = items.filter((m) => selectedSet.has(m._id));

  const toggle = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(Array.from(next));
  };

  const remove = (id, e) => {
    e.stopPropagation();
    onChange(selectedIds.filter((x) => x !== id));
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="input-field text-xs flex items-center justify-between w-full"
      >
        <span className="truncate text-left flex-1">
          {selectedNodes.length === 0
            ? '— Chọn ngành hàng (có thể chọn nhiều) —'
            : `Đã chọn ${selectedNodes.length} ngành`}
        </span>
        {open ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
      </button>
      {selectedNodes.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {selectedNodes.map((m) => (
            <span
              key={m._id}
              className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-lg"
            >
              {m.name}
              <button type="button" onClick={(e) => remove(m._id, e)} className="hover:text-red-500">
                <FiX size={10} />
              </button>
            </span>
          ))}
        </div>
      )}
      {open && (
        <div className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
          {items.length === 0 ? (
            <p className="text-xs text-gray-400 px-3 py-3">Chưa có ngành hàng nào.</p>
          ) : (
            <ul className="py-1">
              {items.map((m) => (
                <li key={m._id}>
                  <label className="flex items-center gap-2 px-3 py-1.5 text-xs cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedSet.has(m._id)}
                      onChange={() => toggle(m._id)}
                      className="rounded w-3.5 h-3.5"
                    />
                    <span className="flex-1 truncate">{m.name}</span>
                    {m.nameEn && (
                      <span className="text-[10px] text-gray-400 truncate">{m.nameEn}</span>
                    )}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

const emptyApplication = {
  title: '',
  titleEn: '',
  description: '',
  descriptionEn: '',
  imageUrl: '',
  order: 0,
  isActive: true,
};

const MultiMarketSelect = ({ items, selected, onChange, disabled }) => {
  const [open, setOpen] = useState(false);
  const selectedIds = Array.isArray(selected) ? selected : [];
  const selectedSet = new Set(selectedIds);
  const selectedNodes = items.filter((m) => selectedSet.has(m._id));

  const toggle = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(Array.from(next));
  };

  const remove = (id, e) => {
    e.stopPropagation();
    onChange(selectedIds.filter((x) => x !== id));
  };

  return (
    <div className={`relative ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="input-field text-xs flex items-center justify-between w-full"
        disabled={disabled}
      >
        <span className="truncate text-left flex-1">
          {selectedNodes.length === 0
            ? '— Chọn thị trường (có thể chọn nhiều) —'
            : `Đã chọn ${selectedNodes.length} thị trường`}
        </span>
        {open ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
      </button>
      {selectedNodes.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {selectedNodes.map((m) => (
            <span
              key={m._id}
              className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded-lg"
            >
              {m.title}
              <button type="button" onClick={(e) => remove(m._id, e)} className="hover:text-red-500">
                <FiX size={10} />
              </button>
            </span>
          ))}
        </div>
      )}
      {open && !disabled && (
        <div className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
          {items.length === 0 ? (
            <p className="text-xs text-gray-400 px-3 py-3">
              Chưa có cây ngành nào trong ngành này. Tạo cây ngành trước.
            </p>
          ) : (
            <ul className="py-1">
              {items.map((m) => (
                <li key={m._id}>
                  <label className="flex items-center gap-2 px-3 py-1.5 text-xs cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedSet.has(m._id)}
                      onChange={() => toggle(m._id)}
                      className="rounded w-3.5 h-3.5"
                    />
                    <span className="flex-1 truncate">{m.title}</span>
                    {m.titleEn && (
                      <span className="text-[10px] text-gray-400 truncate">{m.titleEn}</span>
                    )}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

const emptyForm = {
  productCode: '',
  name: '',
  nameEn: '',
  description: '',
  descriptionEn: '',
  imageUrl: '',
  industries: [],
  marketIds: [],
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

const ApplicationEditor = ({ items, onChange, onUpload, uploading }) => {
  const updateItem = (idx, patch) => {
    onChange(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };
  const removeItem = (idx) => {
    onChange(items.filter((_, i) => i !== idx));
  };
  const addItem = () => {
    onChange([...items, { ...emptyApplication, order: items.length }]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-gray-700 flex items-center gap-1">
          <FiPackage size={14} />
          Ứng dụng sản phẩm (có ảnh + mô tả)
        </label>
        <button
          type="button"
          onClick={addItem}
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          <FiPlus size={12} />
          Thêm ứng dụng
        </button>
      </div>
      <p className="text-[10px] text-gray-500">
        Mỗi ứng dụng của sản phẩm. Khi sản phẩm được chọn trong "Ứng dụng" của cây ngành thị trường, bạn sẽ chọn được ứng dụng cụ thể này.
      </p>
      {items.length === 0 ? (
        <p className="text-[11px] text-gray-400 italic">Chưa có ứng dụng nào.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div
              key={`app-${idx}`}
              className="border border-gray-200 rounded-lg p-3 bg-gray-50/40 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-gray-700">
                  #{idx + 1} {item.title || '(Chưa đặt tên)'}
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="p-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
                  title="Xóa"
                >
                  <FiTrash2 size={12} />
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-medium mb-0.5 text-gray-700">
                    Tiêu đề <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={item.title || ''}
                    onChange={(e) => updateItem(idx, { title: e.target.value })}
                    className="input-field text-xs"
                    placeholder="VD: Sơn lót"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium mb-0.5 text-gray-700">
                    Tiêu đề tiếng Anh
                  </label>
                  <input
                    type="text"
                    value={item.titleEn || ''}
                    onChange={(e) => updateItem(idx, { titleEn: e.target.value })}
                    className="input-field text-xs"
                    placeholder="English title"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-medium mb-0.5 text-gray-700">
                  Mô tả
                </label>
                <RichEditor
                  value={item.description || ''}
                  onChange={(value) => updateItem(idx, { description: value })}
                  placeholder="Mô tả ứng dụng..."
                  minHeight={100}
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium mb-0.5 text-gray-700">
                  Mô tả tiếng Anh
                </label>
                <RichEditor
                  value={item.descriptionEn || ''}
                  onChange={(value) => updateItem(idx, { descriptionEn: value })}
                  placeholder="English description"
                  minHeight={100}
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium mb-0.5 text-gray-700">
                  Hình ảnh ứng dụng
                </label>
                <div className="flex items-center gap-2">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="w-10 h-10 rounded object-cover border"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded bg-gray-100 text-gray-400 flex items-center justify-center">
                      <FiImage size={14} />
                    </div>
                  )}
                  <label className="btn-secondary text-[10px] flex items-center gap-1 cursor-pointer">
                    <FiUpload size={10} />
                    {uploading ? 'Đang upload...' : 'Upload'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onUpload(file, idx);
                        e.target.value = '';
                      }}
                    />
                  </label>
                  <input
                    type="url"
                    value={item.imageUrl || ''}
                    onChange={(e) => updateItem(idx, { imageUrl: e.target.value })}
                    className="input-field text-[10px] flex-1"
                    placeholder="Hoặc URL"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div>
                  <label className="block text-[10px] font-medium mb-0.5 text-gray-700">
                    Thứ tự
                  </label>
                  <input
                    type="number"
                    value={item.order ?? 0}
                    onChange={(e) =>
                      updateItem(idx, { order: Number(e.target.value) || 0 })
                    }
                    className="input-field w-20 text-xs"
                  />
                </div>
                <label className="flex items-center gap-1 cursor-pointer select-none mt-3.5">
                  <input
                    type="checkbox"
                    checked={item.isActive !== false}
                    onChange={(e) => updateItem(idx, { isActive: e.target.checked })}
                    className="rounded w-3 h-3"
                  />
                  <span className="text-[10px] font-medium">Hiển thị</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
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
  const [columns, setColumns] = useState([]);
  const [mainTrees, setMainTrees] = useState([]);
  const [marketTrees, setMarketTrees] = useState([]);
  const [benefitsTab, setBenefitsTab] = useState('list'); // 'list' | 'text'
  const [newBenefit, setNewBenefit] = useState('');
  const [applicationUploading, setApplicationUploading] = useState(false);

  useEffect(() => {
    fetchColumns();
    fetchMainTrees();
    fetchMarketTrees();
    if (isEditing) {
      fetchProduct();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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

  const fetchMarketTrees = async () => {
    try {
      // Load all active markets so the picker isn't blocked when industries change.
      const res = await adminApi.getMarketTrees();
      const items = Array.isArray(res.data?.data) ? res.data.data : [];
      setItemsInOrder(items, setMarketTrees);
    } catch (error) {
      console.error('Error loading market trees:', error);
    }
  };

  const setItemsInOrder = (items, setter) => {
    setter([...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || (a.name || '').localeCompare(b.name || '')));
  };

  const fetchProduct = async () => {
    try {
      const res = await adminApi.getProduct(id);
      const product = res.data.data;
      const industriesRaw = Array.isArray(product.industries) ? product.industries : [];
      const industries = industriesRaw
        .map((m) => (m && typeof m === 'object' ? m._id : m))
        .filter(Boolean);
      const marketIdsRaw = Array.isArray(product.marketIds) ? product.marketIds : [];
      const marketIds = marketIdsRaw
        .map((m) => (m && typeof m === 'object' ? m._id : m))
        .filter(Boolean);
      setFormData({
        productCode: product.productCode || '',
        name: product.name || '',
        nameEn: product.nameEn || '',
        description: product.description || '',
        descriptionEn: product.descriptionEn || '',
        imageUrl: product.imageUrl || '',
        industries,
        marketIds,
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
        applications: Array.isArray(product.applications)
          ? product.applications.map((a) => ({
              ...emptyApplication,
              ...(typeof a === 'object' && a !== null ? a : { title: String(a || '') }),
            }))
          : [],
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
        applications: (formData.applications || []).filter(
          (a) => a && (a.title || a.titleEn)
        ),
        industries: (formData.industries || []).filter(Boolean),
        marketIds: (formData.marketIds || []).filter(Boolean),
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

  const handleApplicationImageUpload = async (file, index) => {
    setApplicationUploading(true);
    try {
      const res = await adminApi.uploadImage(file);
      const url = res?.data?.data?.url;
      if (url) {
        setFormData((prev) => {
          const list = [...(prev.applications || [])];
          if (!list[index]) return prev;
          list[index] = { ...list[index], imageUrl: url };
          return { ...prev, applications: list };
        });
        addNotification('Upload ảnh thành công');
      }
    } catch (error) {
      addNotification('Upload ảnh thất bại', 'error');
    } finally {
      setApplicationUploading(false);
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

            {/* Phân cấp: Industries (multi) + Product Line (dependent on first industry) */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">
                  Ngành hàng
                </label>
                <MultiIndustrySelect
                  items={mainTrees}
                  selected={formData.industries || []}
                  onChange={(ids) => setFormData({ ...formData, industries: ids })}
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Có thể chọn nhiều ngành nếu sản phẩm phục vụ nhiều lĩnh vực.
                </p>
              </div>
            </div>

            {/* Markets (multi-select, không phụ thuộc ngành) */}
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">
                Thị trường ứng dụng
              </label>
              <MultiMarketSelect
                items={marketTrees}
                selected={formData.marketIds || []}
                onChange={(ids) => setFormData({ ...formData, marketIds: ids })}
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Chọn các thị trường mà sản phẩm này được sử dụng. Có thể chọn nhiều thị trường.
              </p>
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

            {/* Applications — list of structured entries */}
            <ApplicationEditor
              items={formData.applications || []}
              onChange={(next) => setFormData({ ...formData, applications: next })}
              onUpload={handleApplicationImageUpload}
              uploading={applicationUploading}
            />

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