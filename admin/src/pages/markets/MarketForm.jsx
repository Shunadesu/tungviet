import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiUpload, FiX, FiPlus, FiEdit2, FiTrash2, FiSearch, FiImage } from 'react-icons/fi';
import HeaderWithBreadcrumb from '../settings/HeaderWithBreadcrumb';
import RichEditor from '../../components/RichEditor';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../context/NotificationContext';

const emptyTech = {
  _id: null,
  title: '',
  titleEn: '',
  imageUrl: '',
  description: '',
  descriptionEn: '',
  products: [],
  isActive: true,
};

const emptyApp = {
  _id: null,
  title: '',
  titleEn: '',
  imageUrl: '',
  benefits: '',
  benefitsEn: '',
  products: [],
  isActive: true,
};

const MarketForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [techUploading, setTechUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    titleEn: '',
    imageUrl: '',
    iconUrl: '',
    description: '',
    descriptionEn: '',
    tdsUrl: '',
    technologies: [],
    isActive: true,
  });

  const [technologies, setTechnologies] = useState([]);
  const [editingTech, setEditingTech] = useState(null);
  const [showTechModal, setShowTechModal] = useState(false);
  const [techFormData, setTechFormData] = useState({ ...emptyTech });

  const [applications, setApplications] = useState([]);
  const [editingApp, setEditingApp] = useState(null);
  const [showAppModal, setShowAppModal] = useState(false);
  const [appFormData, setAppFormData] = useState({ ...emptyApp });
  const [appUploading, setAppUploading] = useState(false);

  const [allProducts, setAllProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');

  useEffect(() => {
    if (isEditing) {
      fetchMarket();
    }
    fetchProducts();
  }, [id]);

  const fetchMarket = async () => {
    try {
      const res = await adminApi.getMarket(id);
      const market = res.data.data;
      setFormData({
        title: market.title || '',
        titleEn: market.titleEn || '',
        imageUrl: market.imageUrl || '',
        iconUrl: market.iconUrl || '',
        description: market.description || '',
        descriptionEn: market.descriptionEn || '',
        tdsUrl: market.tdsUrl || '',
        technologies: market.technologies || [],
        isActive: market.isActive !== false,
      });
      setTechnologies(market.technologies || []);
      setApplications(market.applications || []);
    } catch (error) {
      addNotification('Không tải được thông tin thị trường', 'error');
      navigate('/markets');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await adminApi.getProductsForSelect();
      setAllProducts(res.data.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        ...formData,
        technologies,
        applications,
      };

      if (isEditing) {
        await adminApi.updateMarket(id, data);
        addNotification('Cập nhật thị trường thành công');
      } else {
        await adminApi.createMarket(data);
        addNotification('Thêm thị trường thành công');
      }
      navigate('/markets');
    } catch (error) {
      addNotification(error.response?.data?.message || 'Có lỗi xảy ra', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadPDF = async (file) => {
    setUploading(true);
    try {
      const res = await adminApi.uploadPDF(file);
      const url = res.data.data?.url;
      if (url) {
        setFormData((prev) => ({ ...prev, tdsUrl: url }));
        addNotification('Upload PDF thành công');
      }
      return res;
    } catch (error) {
      addNotification('Upload PDF thất bại', 'error');
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const openAddTech = () => {
    setTechFormData({ ...emptyTech });
    setEditingTech(null);
    setShowTechModal(true);
  };

  const openEditTech = (tech, index) => {
    setTechFormData({ ...tech, products: tech.products?.map(p => p._id || p) || [] });
    setEditingTech(index);
    setShowTechModal(true);
  };

  const closeTechModal = () => {
    setShowTechModal(false);
    setEditingTech(null);
    setTechFormData({ ...emptyTech });
  };

  const handleSaveTech = () => {
    if (!techFormData.title.trim()) {
      addNotification('Vui lòng nhập tên công nghệ', 'error');
      return;
    }

    const techData = {
      ...techFormData,
      _id: editingTech !== null ? technologies[editingTech]._id : null,
    };

    if (editingTech !== null) {
      const updated = [...technologies];
      updated[editingTech] = techData;
      setTechnologies(updated);
    } else {
      setTechnologies([...technologies, techData]);
    }

    closeTechModal();
  };

  const handleDeleteTech = (index) => {
    setTechnologies(technologies.filter((_, i) => i !== index));
  };

  const handleTechImageUpload = async (file) => {
    setTechUploading(true);
    try {
      const res = await adminApi.uploadImage(file);
      const url = res.data.data?.url;
      if (url) {
        setTechFormData((prev) => ({ ...prev, imageUrl: url }));
        addNotification('Upload ảnh thành công');
      }
    } catch (err) {
      addNotification('Upload thất bại', 'error');
    } finally {
      setTechUploading(false);
    }
  };

  // Application handlers
  const openAddApp = () => {
    setAppFormData({ ...emptyApp });
    setEditingApp(null);
    setShowAppModal(true);
  };

  const openEditApp = (app, index) => {
    setAppFormData({ ...app, products: app.products?.map(p => p._id || p) || [] });
    setEditingApp(index);
    setShowAppModal(true);
  };

  const closeAppModal = () => {
    setShowAppModal(false);
    setEditingApp(null);
    setAppFormData({ ...emptyApp });
  };

  const handleSaveApp = () => {
    if (!appFormData.title.trim()) {
      addNotification('Vui lòng nhập tên ứng dụng', 'error');
      return;
    }

    const appData = {
      ...appFormData,
      _id: editingApp !== null ? applications[editingApp]._id : null,
    };

    if (editingApp !== null) {
      const updated = [...applications];
      updated[editingApp] = appData;
      setApplications(updated);
    } else {
      setApplications([...applications, appData]);
    }

    closeAppModal();
  };

  const handleDeleteApp = (index) => {
    setApplications(applications.filter((_, i) => i !== index));
  };

  const handleAppImageUpload = async (file) => {
    setAppUploading(true);
    try {
      const res = await adminApi.uploadImage(file);
      const url = res.data.data?.url;
      if (url) {
        setAppFormData((prev) => ({ ...prev, imageUrl: url }));
        addNotification('Upload ảnh thành công');
      }
    } catch (err) {
      addNotification('Upload thất bại', 'error');
    } finally {
      setAppUploading(false);
    }
  };

  const toggleAppProduct = (productId) => {
    setAppFormData((prev) => ({
      ...prev,
      products: prev.products.includes(productId)
        ? prev.products.filter((id) => id !== productId)
        : [...prev.products, productId],
    }));
  };

  const toggleProduct = (productId) => {
    setTechFormData((prev) => ({
      ...prev,
      products: prev.products.includes(productId)
        ? prev.products.filter((id) => id !== productId)
        : [...prev.products, productId],
    }));
  };

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return allProducts;
    const q = productSearch.toLowerCase();
    return allProducts.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.nameEn?.toLowerCase().includes(q)
    );
  }, [allProducts, productSearch]);

  const selectedProductNames = useMemo(() => {
    return allProducts
      .filter((p) => techFormData.products.includes(p._id))
      .map((p) => p.name || p.nameEn);
  }, [allProducts, techFormData.products]);

  if (loading) {
    return (
      <>
        <HeaderWithBreadcrumb
          title={isEditing ? 'Sửa thị trường' : 'Thêm thị trường'}
          backTo="/markets"
        />
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <HeaderWithBreadcrumb
        title={isEditing ? 'Sửa thị trường' : 'Thêm thị trường'}
        backTo="/markets"
      />
      <div className="p-4 pt-3 max-w-4xl">
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">
                  Tên thị trường <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="input-field"
                  placeholder="VD: Thị trường xây dựng"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">
                  Tên tiếng Anh
                </label>
                <input
                  type="text"
                  value={formData.titleEn}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                  className="input-field"
                  placeholder="English name (optional)"
                />
              </div>
            </div>

            {/* Image URL */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">
                  Link ảnh banner
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="input-field"
                  placeholder="https://..."
                />
              </div>

              {/* Icon URL */}
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">
                  Icon thị trường
                </label>
                <div className="flex items-center gap-2">
                  {formData.iconUrl ? (
                    <div className="relative group">
                      <img
                        src={formData.iconUrl}
                        alt="Icon"
                        className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                        onError={(e) => {
                          e.target.src = '';
                          e.target.classList.add('hidden');
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, iconUrl: '' })}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FiX size={10} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">
                      Chưa có
                    </div>
                  )}
                  <label className="btn-secondary flex items-center gap-1 text-xs cursor-pointer">
                    <FiUpload size={14} />
                    {uploading ? '...' : 'Upload'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUploading(true);
                          try {
                            const res = await adminApi.uploadImage(file);
                            const url = res.data.data?.url;
                            if (url) {
                              setFormData((prev) => ({ ...prev, iconUrl: url }));
                              addNotification('Upload icon thành công');
                            }
                          } catch (err) {
                            addNotification('Upload thất bại', 'error');
                          } finally {
                            setUploading(false);
                          }
                        }
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">PNG, SVG, JPG (nên dùng ảnh vuông)</p>
              </div>
            </div>

            {/* Description VI */}
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">
                Mô tả (tiếng Việt)
              </label>
              <RichEditor
                value={formData.description}
                onChange={(html) => setFormData({ ...formData, description: html })}
                placeholder="Nhập mô tả chi tiết về thị trường..."
                onUploadPDF={handleUploadPDF}
              />
            </div>

            {/* Description EN */}
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">
                Mô tả (tiếng Anh)
              </label>
              <RichEditor
                value={formData.descriptionEn}
                onChange={(html) => setFormData({ ...formData, descriptionEn: html })}
                placeholder="Enter English description..."
                onUploadPDF={handleUploadPDF}
              />
            </div>

            {/* TDS URL */}
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">
                File TDS (PDF)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={formData.tdsUrl}
                  onChange={(e) => setFormData({ ...formData, tdsUrl: e.target.value })}
                  className="input-field flex-1"
                  placeholder="https://.../file.pdf"
                />
                <label className="btn-secondary flex items-center gap-1 text-xs cursor-pointer">
                  <FiUpload size={14} />
                  {uploading ? 'Đang upload...' : 'Upload PDF'}
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const res = await adminApi.uploadPDF(file);
                          const url = res.data.data?.url;
                          if (url) {
                            setFormData((prev) => ({ ...prev, tdsUrl: url }));
                            addNotification('Upload PDF thành công');
                          }
                        } catch (err) {
                          addNotification('Upload thất bại', 'error');
                        }
                      }
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
              {formData.tdsUrl && (
                <p className="text-[10px] text-green-600 mt-1 flex items-center gap-1">
                  ✓ Đã chọn file TDS
                </p>
              )}
            </div>

            {/* Technologies Section */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">
                    Công nghệ / Sản phẩm
                  </label>
                  <p className="text-[10px] text-gray-400">
                    Thêm công nghệ với ảnh, mô tả và sản phẩm liên kết
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openAddTech}
                  className="btn-secondary flex items-center gap-1.5 text-xs"
                >
                  <FiPlus size={14} />
                  Thêm công nghệ
                </button>
              </div>

              {/* Tech List */}
              {technologies.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm border border-dashed rounded-lg">
                  Chưa có công nghệ nào. Click "Thêm công nghệ" để bắt đầu.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {technologies.map((tech, index) => (
                    <div
                      key={tech._id || index}
                      className={`border rounded-lg p-3 bg-white ${
                        tech.isActive === false ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        {tech.imageUrl ? (
                          <img
                            src={tech.imageUrl}
                            alt={tech.title}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                            onError={(e) => {
                              e.target.src = '';
                              e.target.classList.add('hidden');
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                            <FiImage size={16} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-800 truncate">
                            {tech.title}
                          </h4>
                          {tech.titleEn && (
                            <p className="text-[10px] text-gray-400 truncate">
                              {tech.titleEn}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-2">
                        <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">
                          {tech.products?.length || 0} sản phẩm
                        </span>
                        {!tech.isActive && (
                          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                            Ẩn
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditTech(tech, index)}
                          className="flex-1 text-[10px] px-2 py-1 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                        >
                          <FiEdit2 size={10} />
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTech(index)}
                          className="flex-1 text-[10px] px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                        >
                          <FiTrash2 size={10} />
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Applications Section */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">
                    Ứng dụng
                  </label>
                  <p className="text-[10px] text-gray-400">
                    Thêm ứng dụng với ảnh, lợi ích và sản phẩm liên kết
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openAddApp}
                  className="btn-secondary flex items-center gap-1.5 text-xs"
                >
                  <FiPlus size={14} />
                  Thêm ứng dụng
                </button>
              </div>

              {/* App List */}
              {applications.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm border border-dashed rounded-lg">
                  Chưa có ứng dụng nào. Click "Thêm ứng dụng" để bắt đầu.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {applications.map((app, index) => (
                    <div
                      key={app._id || index}
                      className={`border rounded-lg p-3 bg-white ${
                        app.isActive === false ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        {app.imageUrl ? (
                          <img
                            src={app.imageUrl}
                            alt={app.title}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                            onError={(e) => {
                              e.target.src = '';
                              e.target.classList.add('hidden');
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-400 flex-shrink-0">
                            <FiImage size={16} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-800 truncate">
                            {app.title}
                          </h4>
                          {app.titleEn && (
                            <p className="text-[10px] text-gray-400 truncate">
                              {app.titleEn}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-2">
                        <span className="px-1.5 py-0.5 bg-green-50 text-green-600 rounded">
                          {app.products?.length || 0} sản phẩm
                        </span>
                        {!app.isActive && (
                          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                            Ẩn
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditApp(app, index)}
                          className="flex-1 text-[10px] px-2 py-1 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                        >
                          <FiEdit2 size={10} />
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteApp(index)}
                          className="flex-1 text-[10px] px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                        >
                          <FiTrash2 size={10} />
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Active Status */}
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
                onClick={() => navigate('/markets')}
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
                {saving ? 'Đang lưu...' : (isEditing ? 'Cập nhật' : 'Thêm mới')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Tech Modal */}
      {showTechModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold text-gray-800">
                {editingTech !== null ? 'Sửa công nghệ' : 'Thêm công nghệ mới'}
              </h3>
              <button
                type="button"
                onClick={closeTechModal}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Tech Title */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">
                    Tên công nghệ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={techFormData.title}
                    onChange={(e) => setTechFormData({ ...techFormData, title: e.target.value })}
                    className="input-field"
                    placeholder="VD: Keo gia cố kết cấu"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">
                    Tên tiếng Anh
                  </label>
                  <input
                    type="text"
                    value={techFormData.titleEn}
                    onChange={(e) => setTechFormData({ ...techFormData, titleEn: e.target.value })}
                    className="input-field"
                    placeholder="English name"
                  />
                </div>
              </div>

              {/* Tech Image */}
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">
                  Ảnh minh họa
                </label>
                <div className="flex items-center gap-3">
                  {techFormData.imageUrl ? (
                    <div className="relative group">
                      <img
                        src={techFormData.imageUrl}
                        alt="Tech"
                        className="w-16 h-16 rounded-lg object-cover border"
                        onError={(e) => {
                          e.target.src = '';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setTechFormData({ ...techFormData, imageUrl: '' })}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FiX size={10} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">
                      Chưa có
                    </div>
                  )}
                  <label className="btn-secondary flex items-center gap-1 text-xs cursor-pointer">
                    <FiUpload size={14} />
                    {techUploading ? '...' : 'Upload ảnh'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleTechImageUpload(file);
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Tech Description */}
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">
                  Mô tả (tiếng Việt)
                </label>
                <RichEditor
                  value={techFormData.description}
                  onChange={(html) => setTechFormData({ ...techFormData, description: html })}
                  placeholder="Mô tả về công nghệ..."
                  onUploadPDF={handleUploadPDF}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">
                  Mô tả (tiếng Anh)
                </label>
                <RichEditor
                  value={techFormData.descriptionEn}
                  onChange={(html) => setTechFormData({ ...techFormData, descriptionEn: html })}
                  placeholder="English description..."
                  onUploadPDF={handleUploadPDF}
                />
              </div>

              {/* Product Selector */}
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">
                  Sản phẩm sử dụng công nghệ này
                </label>
                
                {/* Selected Products Tags */}
                {techFormData.products.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {techFormData.products.map((pid) => {
                      const product = allProducts.find((p) => p._id === pid);
                      if (!product) return null;
                      return (
                        <span
                          key={pid}
                          className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-lg"
                        >
                          {product.name || product.nameEn}
                          <button
                            type="button"
                            onClick={() => toggleProduct(pid)}
                            className="hover:text-red-500"
                          >
                            <FiX size={10} />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Product Search */}
                <div className="relative mb-2">
                  <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="input-field pl-8 text-xs"
                    placeholder="Tìm kiếm sản phẩm..."
                  />
                </div>

                {/* Product List */}
                <div className="border rounded-lg max-h-48 overflow-y-auto">
                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-4 text-gray-400 text-xs">
                      Không tìm thấy sản phẩm
                    </div>
                  ) : (
                    filteredProducts.map((product) => {
                      const isSelected = techFormData.products.includes(product._id);
                      return (
                        <label
                          key={product._id}
                          className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                            isSelected ? 'bg-blue-50' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleProduct(product._id)}
                            className="rounded w-3.5 h-3.5"
                          />
                          <span className="text-xs text-gray-700 flex-1 truncate">
                            {product.name || product.nameEn}
                          </span>
                          {product.imageUrl && (
                            <img
                              src={product.imageUrl}
                              alt=""
                              className="w-6 h-6 rounded object-cover"
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          )}
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={techFormData.isActive}
                    onChange={(e) => setTechFormData({ ...techFormData, isActive: e.target.checked })}
                    className="rounded w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">Hoạt động</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 px-4 py-3 border-t bg-gray-50">
              <button
                type="button"
                onClick={closeTechModal}
                className="btn-secondary text-sm"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveTech}
                className="btn-primary text-sm"
              >
                {editingTech !== null ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* App Modal */}
      {showAppModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold text-gray-800">
                {editingApp !== null ? 'Sửa ứng dụng' : 'Thêm ứng dụng mới'}
              </h3>
              <button
                type="button"
                onClick={closeAppModal}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* App Title */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">
                    Tên ứng dụng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={appFormData.title}
                    onChange={(e) => setAppFormData({ ...appFormData, title: e.target.value })}
                    className="input-field"
                    placeholder="VD: Chống thấm tầng hầm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">
                    Tên tiếng Anh
                  </label>
                  <input
                    type="text"
                    value={appFormData.titleEn}
                    onChange={(e) => setAppFormData({ ...appFormData, titleEn: e.target.value })}
                    className="input-field"
                    placeholder="English name"
                  />
                </div>
              </div>

              {/* App Image */}
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">
                  Ảnh minh họa
                </label>
                <div className="flex items-center gap-3">
                  {appFormData.imageUrl ? (
                    <div className="relative group">
                      <img
                        src={appFormData.imageUrl}
                        alt="App"
                        className="w-16 h-16 rounded-lg object-cover border"
                        onError={(e) => {
                          e.target.src = '';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setAppFormData({ ...appFormData, imageUrl: '' })}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FiX size={10} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">
                      Chưa có
                    </div>
                  )}
                  <label className="btn-secondary flex items-center gap-1 text-xs cursor-pointer">
                    <FiUpload size={14} />
                    {appUploading ? '...' : 'Upload ảnh'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleAppImageUpload(file);
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Benefits VI */}
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">
                  Lợi ích (tiếng Việt)
                </label>
                <RichEditor
                  value={appFormData.benefits}
                  onChange={(html) => setAppFormData({ ...appFormData, benefits: html })}
                  placeholder="Mô tả lợi ích của ứng dụng..."
                  onUploadPDF={handleUploadPDF}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">
                  Lợi ích (tiếng Anh)
                </label>
                <RichEditor
                  value={appFormData.benefitsEn}
                  onChange={(html) => setAppFormData({ ...appFormData, benefitsEn: html })}
                  placeholder="English benefits..."
                  onUploadPDF={handleUploadPDF}
                />
              </div>

              {/* Product Selector */}
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">
                  Sản phẩm sử dụng ứng dụng này
                </label>

                {/* Selected Products Tags */}
                {appFormData.products.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {appFormData.products.map((pid) => {
                      const product = allProducts.find((p) => p._id === pid);
                      if (!product) return null;
                      return (
                        <span
                          key={pid}
                          className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-green-50 text-green-600 rounded-lg"
                        >
                          {product.name || product.nameEn}
                          <button
                            type="button"
                            onClick={() => toggleAppProduct(pid)}
                            className="hover:text-red-500"
                          >
                            <FiX size={10} />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Product Search */}
                <div className="relative mb-2">
                  <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="input-field pl-8 text-xs"
                    placeholder="Tìm kiếm sản phẩm..."
                  />
                </div>

                {/* Product List */}
                <div className="border rounded-lg max-h-48 overflow-y-auto">
                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-4 text-gray-400 text-xs">
                      Không tìm thấy sản phẩm
                    </div>
                  ) : (
                    filteredProducts.map((product) => {
                      const isSelected = appFormData.products.includes(product._id);
                      return (
                        <label
                          key={product._id}
                          className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                            isSelected ? 'bg-green-50' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleAppProduct(product._id)}
                            className="rounded w-3.5 h-3.5"
                          />
                          <span className="text-xs text-gray-700 flex-1 truncate">
                            {product.name || product.nameEn}
                          </span>
                          {product.imageUrl && (
                            <img
                              src={product.imageUrl}
                              alt=""
                              className="w-6 h-6 rounded object-cover"
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          )}
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={appFormData.isActive}
                    onChange={(e) => setAppFormData({ ...appFormData, isActive: e.target.checked })}
                    className="rounded w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">Hoạt động</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 px-4 py-3 border-t bg-gray-50">
              <button
                type="button"
                onClick={closeAppModal}
                className="btn-secondary text-sm"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveApp}
                className="btn-primary text-sm"
              >
                {editingApp !== null ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MarketForm;
