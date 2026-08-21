import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  FiArrowLeft,
  FiSave,
  FiUpload,
  FiImage,
  FiCpu,
  FiPackage,
  FiPlus,
  FiTrash2,
  FiChevronDown,
  FiChevronUp,
  FiInfo,
  FiLink,
  FiExternalLink,
  FiX,
} from 'react-icons/fi';
import HeaderWithBreadcrumb from '../settings/HeaderWithBreadcrumb';
import RichEditor from '../../components/RichEditor';
import SEO from '../../components/SEO';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../context/NotificationContext';
import useFormDraft from '../../hooks/useFormDraft';

const emptySubDoc = {
  title: '',
  titleEn: '',
  description: '',
  descriptionEn: '',
  imageUrl: '',
  order: 0,
  isActive: true,
  linkToMainTree: null,
  linkCustomUrl: '',
};

const emptyApplication = {
  ...emptySubDoc,
  productEntries: [],
};

const emptyForm = {
  title: '',
  titleEn: '',
  description: '',
  descriptionEn: '',
  introductions: { vi: '', en: '' },
  imageUrl: '',
  order: 0,
  isActive: true,
  isFeatured: false,
  technologies: [],
  applications: [],
  productEntries: [],
};

const SubDocCard = ({ item, index, onUpdate, onRemove, onUpload, uploading, availableMainTrees }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50/40">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt=""
              className="w-8 h-8 rounded object-cover border flex-shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-8 h-8 rounded bg-gray-100 text-gray-400 flex items-center justify-center flex-shrink-0">
              <FiImage size={14} />
            </div>
          )}
          <div className="min-w-0">
            <div className="text-xs font-semibold text-gray-700 truncate">
              #{index + 1} {item.title || '(Chưa đặt tên)'}
            </div>
            {item.titleEn && (
              <div className="text-[10px] text-gray-400 truncate">
                {item.titleEn}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="p-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
            title={expanded ? 'Thu gọn' : 'Mở rộng'}
          >
            {expanded ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="p-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
            title="Xóa"
          >
            <FiTrash2 size={12} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 space-y-2 border-t border-gray-200 pt-3">
          <div className="grid md:grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-medium mb-0.5 text-gray-700">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={item.title}
                onChange={(e) => onUpdate({ ...item, title: e.target.value })}
                className="input-field text-xs"
                placeholder="VD: Công nghệ chống thấm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium mb-0.5 text-gray-700">
                Tiêu đề tiếng Anh
              </label>
              <input
                type="text"
                value={item.titleEn}
                onChange={(e) =>
                  onUpdate({ ...item, titleEn: e.target.value })
                }
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
              value={item.description}
              onChange={(value) => onUpdate({ ...item, description: value })}
              placeholder="Mô tả..."
              minHeight={100}
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium mb-0.5 text-gray-700">
              Mô tả tiếng Anh
            </label>
            <RichEditor
              value={item.descriptionEn}
              onChange={(value) => onUpdate({ ...item, descriptionEn: value })}
              placeholder="English description"
              minHeight={100}
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium mb-0.5 text-gray-700">
              Hình ảnh
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
                <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-400">
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
                    if (file) onUpload(file);
                    e.target.value = '';
                  }}
                />
              </label>
              <input
                type="url"
                value={item.imageUrl}
                onChange={(e) => onUpdate({ ...item, imageUrl: e.target.value })}
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
                  onUpdate({ ...item, order: Number(e.target.value) || 0 })
                }
                className="input-field w-20 text-xs"
              />
            </div>
            <label className="flex items-center gap-1 cursor-pointer select-none mt-3.5">
              <input
                type="checkbox"
                checked={item.isActive !== false}
                onChange={(e) =>
                  onUpdate({ ...item, isActive: e.target.checked })
                }
                className="rounded w-3 h-3"
              />
              <span className="text-[10px] font-medium">Hiển thị</span>
            </label>
          </div>

          {/* Link section */}
          <div className="border-t border-gray-100 pt-2 mt-2">
            <div className="flex items-center gap-1 mb-1.5">
              <FiLink size={11} className="text-gray-500" />
              <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide">
                Link tiếp tục đến cây ngành sản phẩm
              </span>
            </div>
            <div className="grid md:grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-medium mb-0.5 text-gray-600">
                  Chọn cây ngành sản phẩm
                </label>
                <select
                  value={item.linkToMainTree || ''}
                  onChange={(e) =>
                    onUpdate({
                      ...item,
                      linkToMainTree: e.target.value || null,
                    })
                  }
                  className="input-field text-[10px]"
                >
                  <option value="">-- Không chọn --</option>
                  {(availableMainTrees || []).map((mt) => (
                    <option key={mt._id} value={mt._id}>
                      {mt.name}
                      {mt.nameEn ? ` / ${mt.nameEn}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-medium mb-0.5 text-gray-600 flex items-center gap-1">
                  <FiExternalLink size={10} />
                  URL tuỳ chỉnh
                </label>
                <input
                  type="text"
                  value={item.linkCustomUrl || ''}
                  onChange={(e) =>
                    onUpdate({ ...item, linkCustomUrl: e.target.value })
                  }
                  className="input-field text-[10px]"
                  placeholder="https://... hoặc /duong-dan"
                />
              </div>
            </div>
            {(item.linkToMainTree || item.linkCustomUrl) && (
              <p className="text-[9px] text-gray-400 mt-1">
                {item.linkCustomUrl
                  ? 'URL tuỳ chỉnh sẽ được ưu tiên khi hiển thị.'
                  : 'Click vào cây ngành sản phẩm sẽ chuyển đến trang chi tiết.'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ProductEntryRow = ({
  productId,
  applicationIndex,
  product,
  onChange,
  onRemove,
}) => {
  const applications = Array.isArray(product?.applications)
    ? product.applications
    : [];

  return (
    <div className="flex items-start gap-2 p-2 border border-gray-100 rounded bg-white">
      {product?.imageUrl ? (
        <img
          src={product.imageUrl}
          alt=""
          className="w-10 h-10 rounded object-cover border flex-shrink-0"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <div className="w-10 h-10 rounded bg-gray-100 text-gray-400 flex items-center justify-center flex-shrink-0">
          <FiPackage size={14} />
        </div>
      )}
      <div className="min-w-0 flex-1 grid md:grid-cols-2 gap-2">
        <div className="min-w-0">
          <div className="text-xs font-medium truncate">
            {product?.name || `Sản phẩm #${productId}`}
          </div>
          {product?.productCode && (
            <div className="text-[10px] text-gray-400 font-mono">
              {product.productCode}
            </div>
          )}
        </div>
        <select
          value={applicationIndex ?? -1}
          onChange={(e) =>
            onChange({ productId, applicationIndex: Number(e.target.value) })
          }
          className="input-field text-[10px]"
        >
          <option value={-1}>-- Chưa chọn ứng dụng --</option>
          {applications.map((app, idx) => (
            <option key={app._id || idx} value={idx}>
              #{idx + 1} {app.title || app.titleEn || '(không tên)'}
            </option>
          ))}
        </select>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="p-1 bg-red-50 text-red-600 rounded hover:bg-red-100 flex-shrink-0"
        title="Bỏ sản phẩm"
      >
        <FiTrash2 size={12} />
      </button>
    </div>
  );
};

const MarketTreeForm = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingSubDoc, setUploadingSubDoc] = useState(false);

  const [availableProducts, setAvailableProducts] = useState([]);
  const [availableMainTrees, setAvailableMainTrees] = useState([]);
  const [formData, setFormData] = useState({ ...emptyForm });

  const draftKey = `draft:marketTree:${isEditing ? `edit:${id}` : 'new'}`;
  const { loadedFromDraft, clearDraft } = useFormDraft(
    draftKey,
    formData,
    setFormData,
    { enabled: !loading }
  );

  useEffect(() => {
    const loadAll = async () => {
      try {
        const prodRes = await adminApi.getProducts({ limit: 200 });
        setAvailableProducts(
          Array.isArray(prodRes.data?.data) ? prodRes.data.data : []
        );
      } catch (err) {
        console.error(err);
      }
    };
    loadAll();
  }, []);

  useEffect(() => {
    const loadMainTrees = async () => {
      try {
        const res = await adminApi.getMainTrees({ isActive: true });
        const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setAvailableMainTrees(list.filter((mt) => mt._id !== id));
      } catch (err) {
        console.error('Failed to load main trees', err);
      }
    };
    loadMainTrees();
  }, [id]);

  useEffect(() => {
    if (!isEditing || !id) return;
    const fetchNode = async () => {
      try {
        const res = await adminApi.getMarketTree(id);
        const node = res.data?.data;
        if (!node) {
          addNotification('Không tìm thấy cây ngành', 'error');
          navigate('/market-trees');
          return;
        }
        setFormData({
          title: node.title || '',
          titleEn: node.titleEn || '',
          description: node.description || '',
          descriptionEn: node.descriptionEn || '',
          introductions: {
            vi: node.introductions?.vi || '',
            en: node.introductions?.en || '',
          },
          imageUrl: node.imageUrl || '',
          order: node.order ?? 0,
          isActive: node.isActive !== false,
          isFeatured: node.isFeatured === true,
          technologies: Array.isArray(node.technologies)
            ? node.technologies.map((t) => ({
                ...emptySubDoc,
                ...t,
                linkToMainTree:
                  t.linkToMainTree?._id || t.linkToMainTree || null,
              }))
            : [],
          applications: Array.isArray(node.applications)
            ? node.applications.map((a) => ({
                ...emptyApplication,
                ...a,
                linkToMainTree:
                  a.linkToMainTree?._id || a.linkToMainTree || null,
                productEntries: Array.isArray(a.productEntries)
                  ? a.productEntries.map((entry) => ({
                      productId:
                        entry.productId?._id || entry.productId || null,
                      applicationIndex: Number.isFinite(
                        entry.applicationIndex
                      )
                        ? entry.applicationIndex
                        : -1,
                    }))
                  : [],
              }))
            : [],
          productEntries: Array.isArray(node.productEntries)
            ? node.productEntries.map((entry) => ({
                productId: entry.productId?._id || entry.productId || null,
              }))
            : [],
        });
      } catch (error) {
        addNotification(
          error.response?.data?.message || 'Không thể tải cây ngành',
          'error'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchNode();
  }, [id, isEditing, navigate, addNotification]);

  const productMap = useMemo(() => {
    const map = new Map();
    for (const p of availableProducts) {
      if (p && p._id) map.set(String(p._id), p);
    }
    return map;
  }, [availableProducts]);

  const handleCancel = () => {
    clearDraft();
    navigate('/market-trees');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      addNotification('Vui lòng nhập tiêu đề', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = buildSavePayload();
      if (isEditing) {
        await adminApi.updateMarketTree(id, payload);
        addNotification('Cập nhật cây ngành thành công');
      } else {
        await adminApi.createMarketTree(payload);
        addNotification('Thêm cây ngành thành công');
      }
      clearDraft();
      navigate('/market-trees');
    } catch (error) {
      addNotification(
        error.response?.data?.message || 'Có lỗi xảy ra',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  const buildSavePayload = () => ({
    ...formData,
    introductions: {
      vi: formData.introductions?.vi || '',
      en: formData.introductions?.en || '',
    },
    technologies: (formData.technologies || []).map((t) => ({
      ...t,
      productEntries: undefined,
    })),
    applications: (formData.applications || []).map((a) => ({
      ...a,
      productEntries: (a.productEntries || []).filter(
        (entry) =>
          entry.productId &&
          Number.isFinite(entry.applicationIndex) &&
          entry.applicationIndex >= 0
      ),
    })),
    productEntries: (formData.productEntries || []).filter(
      (entry) => entry.productId
    ),
  });

  const handleQuickCreateAndNavigate = async (subRoute) => {
    if (!formData.title.trim()) {
      addNotification('Vui lòng nhập tiêu đề trước khi thêm công nghệ/ứng dụng', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = buildSavePayload();
      const res = await adminApi.createMarketTree(payload);
      const newId = res?.data?.data?._id;
      if (!newId) {
        addNotification('Không thể lấy ID cây ngành mới', 'error');
        return;
      }
      addNotification('Đã tạo cây ngành, chuyển đến trang quản lý...');
      // Intentionally keep the draft so user can resume editing on /market-trees/:id/edit after they come back.
      navigate(`/market-trees/${newId}/${subRoute}`);
    } catch (error) {
      addNotification(
        error.response?.data?.message || 'Có lỗi xảy ra',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file) => {
    setUploading(true);
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
      setUploading(false);
    }
  };

  const handleSubDocImageUpload = async (file, kind, index) => {
    setUploadingSubDoc(true);
    try {
      const res = await adminApi.uploadImage(file);
      const url = res?.data?.data?.url;
      if (url) {
        setFormData((prev) => {
          const list = [...(prev[kind] || [])];
          list[index] = { ...list[index], imageUrl: url };
          return { ...prev, [kind]: list };
        });
        addNotification('Upload ảnh thành công');
      }
    } catch (err) {
      addNotification('Upload ảnh thất bại', 'error');
    } finally {
      setUploadingSubDoc(false);
    }
  };

  const addSubDoc = (kind) => {
    setFormData((prev) => ({
      ...prev,
      [kind]: [
        ...(prev[kind] || []),
        {
          ...(kind === 'applications' ? emptyApplication : emptySubDoc),
          order: (prev[kind] || []).length,
        },
      ],
    }));
  };

  const updateSubDoc = (kind, index, item) => {
    setFormData((prev) => {
      const list = [...(prev[kind] || [])];
      list[index] = item;
      return { ...prev, [kind]: list };
    });
  };

  const removeSubDoc = (kind, index) => {
    setFormData((prev) => {
      const list = [...(prev[kind] || [])];
      list.splice(index, 1);
      return { ...prev, [kind]: list };
    });
  };

  const updateAppProductEntries = (appIndex, entries) => {
    setFormData((prev) => {
      const list = [...(prev.applications || [])];
      list[appIndex] = { ...list[appIndex], productEntries: entries };
      return { ...prev, applications: list };
    });
  };

  const addAppProduct = (appIndex, productId) => {
    setFormData((prev) => {
      const list = [...(prev.applications || [])];
      const current = Array.isArray(list[appIndex].productEntries)
        ? [...list[appIndex].productEntries]
        : [];
      if (current.some((entry) => String(entry.productId) === String(productId))) {
        return prev;
      }
      const product = productMap.get(String(productId));
      const firstIdx =
        product && Array.isArray(product.applications) && product.applications.length > 0
          ? 0
          : -1;
      current.push({ productId, applicationIndex: firstIdx });
      list[appIndex] = { ...list[appIndex], productEntries: current };
      return { ...prev, applications: list };
    });
  };

  const addRootProduct = (productId) => {
    setFormData((prev) => {
      const current = Array.isArray(prev.productEntries)
        ? [...prev.productEntries]
        : [];
      if (current.some((entry) => String(entry.productId) === String(productId))) {
        return prev;
      }
      current.push({ productId });
      return { ...prev, productEntries: current };
    });
  };

  const removeRootProduct = (productId) => {
    setFormData((prev) => ({
      ...prev,
      productEntries: (prev.productEntries || []).filter(
        (entry) => String(entry.productId) !== String(productId)
      ),
    }));
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
        title={isEditing ? 'Sửa cây ngành' : 'Thêm cây ngành'}
        description="Quản lý cây ngành thị trường"
        url="/market-trees"
      />
      <HeaderWithBreadcrumb
        title={isEditing ? 'Sửa cây ngành' : 'Thêm cây ngành'}
        breadcrumbs={[
          { label: 'Cây ngành', path: '/market-trees' },
          { label: isEditing ? 'Sửa' : 'Thêm mới' },
        ]}
        actions={
          <button
            type="button"
            onClick={handleCancel}
            className="btn-secondary flex items-center gap-1.5 text-xs"
          >
            <FiArrowLeft size={14} />
            Quay lại
          </button>
        }
      />
      {loadedFromDraft && (
        <div className="px-4 pt-3 max-w-5xl mx-auto">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-3 py-2 flex items-center justify-between text-xs">
            <span>
              Đã khôi phục bản nháp chưa lưu.{' '}
              <button
                type="button"
                onClick={() => {
                  clearDraft();
                  setFormData({ ...emptyForm });
                }}
                className="underline font-medium hover:text-amber-900"
              >
                Bắt đầu lại
              </button>
            </span>
            <button
              type="button"
              onClick={() => clearDraft()}
              className="text-amber-700 hover:text-amber-900"
              aria-label="Đóng thông báo"
            >
              <FiX size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="p-4">
        <form
          onSubmit={handleSubmit}
          className="card max-w-5xl mx-auto space-y-4"
        >
          {/* Section: Thông tin cơ bản */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Thông tin cơ bản
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  className="input-field"
                  placeholder="VD: Sơn PU"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  Tiêu đề tiếng Anh
                </label>
                <input
                  type="text"
                  value={formData.titleEn}
                  onChange={(e) =>
                    setFormData({ ...formData, titleEn: e.target.value })
                  }
                  className="input-field"
                  placeholder="PU Coatings"
                />
              </div>
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

            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1 flex items-center gap-1">
                  <FiInfo size={12} />
                  Giới thiệu (Tiếng Việt)
                </label>
                <RichEditor
                  value={formData.introductions?.vi || ''}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      introductions: {
                        ...(prev.introductions || {}),
                        vi: value,
                      },
                    }))
                  }
                  placeholder="Mô tả chi tiết về cây ngành..."
                  minHeight={160}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 flex items-center gap-1">
                  <FiInfo size={12} />
                  Giới thiệu (Tiếng Anh)
                </label>
                <RichEditor
                  value={formData.introductions?.en || ''}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      introductions: {
                        ...(prev.introductions || {}),
                        en: value,
                      },
                    }))
                  }
                  placeholder="English introduction..."
                  minHeight={160}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">
                Hình minh họa cây ngành
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
                  {uploading ? 'Đang upload...' : 'Upload'}
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
              <label className="flex items-center gap-2 cursor-pointer select-none mt-5">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) =>
                    setFormData({ ...formData, isFeatured: e.target.checked })
                  }
                  className="rounded"
                />
                <span className="text-xs font-medium">
                  Đánh dấu nổi bật (featured)
                </span>
              </label>
            </div>
          </div>

          {/* Section: Sản phẩm sử dụng (cấp cây ngành) */}
          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-1">
                <FiPackage size={14} />
                Sản phẩm sử dụng (cây ngành)
              </h3>
              <span className="text-[10px] text-gray-500">
                {(formData.productEntries || []).length} đã chọn
              </span>
            </div>
            <p className="text-[10px] text-gray-500">
              Danh sách sản phẩm chính áp dụng cho toàn bộ cây ngành này
              (ngoài các sản phẩm đã gắn trong từng Ứng dụng).
            </p>

            {(() => {
              const usedIds = new Set(
                (formData.productEntries || []).map((entry) =>
                  String(entry.productId)
                )
              );
              const candidates = availableProducts.filter(
                (p) => !usedIds.has(String(p._id))
              );
              return candidates.length === 0 ? (
                <p className="text-[10px] text-gray-400 italic">
                  {availableProducts.length === 0
                    ? 'Chưa có sản phẩm nào trong hệ thống.'
                    : 'Đã thêm tất cả sản phẩm.'}
                </p>
              ) : (
                <select
                  value=""
                  onChange={(e) => {
                    const value = e.target.value;
                    e.target.value = '';
                    if (value) addRootProduct(value);
                  }}
                  className="input-field text-xs w-full"
                >
                  <option value="">-- Chọn sản phẩm để thêm --</option>
                  {candidates.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                      {p.productCode ? ` (${p.productCode})` : ''}
                    </option>
                  ))}
                </select>
              );
            })()}

            <div className="space-y-1">
              {(formData.productEntries || []).map((entry) => {
                const product = productMap.get(String(entry.productId));
                return (
                  <div
                    key={String(entry.productId)}
                    className="flex items-start gap-2 p-2 border border-gray-100 rounded bg-white"
                  >
                    {product?.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt=""
                        className="w-10 h-10 rounded object-cover border flex-shrink-0"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-gray-100 text-gray-400 flex items-center justify-center flex-shrink-0">
                        <FiPackage size={14} />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium truncate">
                        {product?.name || `Sản phẩm #${entry.productId}`}
                      </div>
                      {product?.productCode && (
                        <div className="text-[10px] text-gray-400 font-mono">
                          {product.productCode}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRootProduct(entry.productId)}
                      className="p-1 bg-red-50 text-red-600 rounded hover:bg-red-100 flex-shrink-0"
                      title="Bỏ sản phẩm"
                    >
                      <FiTrash2 size={12} />
                    </button>
                  </div>
                );
              })}
              {(formData.productEntries || []).length === 0 && (
                <p className="text-[10px] text-gray-400 italic">
                  Chưa chọn sản phẩm nào cho cây ngành.
                </p>
              )}
            </div>
          </div>

          {/* Section: Technologies */}
          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-1">
                <FiCpu size={14} />
                Công nghệ (technologies)
              </h3>
              {isEditing ? (
                <button
                  type="button"
                  onClick={() => navigate(`/market-trees/${id}/technologies`)}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <FiExternalLink size={12} />
                  Quản lý công nghệ
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleQuickCreateAndNavigate('technologies')}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                  disabled={saving}
                >
                  <FiPlus size={12} />
                  Thêm công nghệ
                </button>
              )}
            </div>
            {isEditing ? (
              <button
                type="button"
                onClick={() => navigate(`/market-trees/${id}/technologies`)}
                className="w-full text-left p-3 border border-gray-100 rounded bg-gray-50/40 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-gray-700">
                      {(formData.technologies || []).length} công nghệ đã cấu hình
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      Bấm để mở trang quản lý chi tiết
                    </div>
                  </div>
                  <span className="text-primary text-xs">→</span>
                </div>
              </button>
            ) : (formData.technologies || []).length === 0 ? (
              <p className="text-[11px] text-gray-400 italic">
                Sau khi lưu cây ngành, bạn có thể quản lý công nghệ ở trang riêng.
              </p>
            ) : (
              <div className="space-y-2">
                {formData.technologies.map((item, idx) => (
                  <SubDocCard
                    key={`tech-${idx}`}
                    item={item}
                    index={idx}
                    kind="technologies"
                    onUpdate={(next) =>
                      updateSubDoc('technologies', idx, next)
                    }
                    onRemove={() => removeSubDoc('technologies', idx)}
                    onUpload={(file) =>
                      handleSubDocImageUpload(file, 'technologies', idx)
                    }
                    uploading={uploadingSubDoc}
                    availableMainTrees={availableMainTrees}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Section: Applications */}
          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-1">
                <FiPackage size={14} />
                Ứng dụng (applications)
              </h3>
              {isEditing ? (
                <button
                  type="button"
                  onClick={() => navigate(`/market-trees/${id}/applications`)}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <FiExternalLink size={12} />
                  Quản lý ứng dụng
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleQuickCreateAndNavigate('applications')}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                  disabled={saving}
                >
                  <FiPlus size={12} />
                  Thêm ứng dụng
                </button>
              )}
            </div>
            {isEditing ? (
              <button
                type="button"
                onClick={() => navigate(`/market-trees/${id}/applications`)}
                className="w-full text-left p-3 border border-gray-100 rounded bg-gray-50/40 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-gray-700">
                      {(formData.applications || []).length} ứng dụng đã cấu hình
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      Bấm để mở trang quản lý chi tiết
                    </div>
                  </div>
                  <span className="text-primary text-xs">→</span>
                </div>
              </button>
            ) : (formData.applications || []).length === 0 ? (
              <p className="text-[11px] text-gray-400 italic">
                Sau khi lưu cây ngành, bạn có thể quản lý ứng dụng ở trang riêng.
              </p>
            ) : (
              <div className="space-y-2">
                {formData.applications.map((item, idx) => (
                  <SubDocCard
                    key={`app-${idx}`}
                    item={item}
                    index={idx}
                    kind="applications"
                    onUpdate={(next) =>
                      updateSubDoc('applications', idx, next)
                    }
                    onRemove={() => removeSubDoc('applications', idx)}
                    onUpload={(file) =>
                      handleSubDocImageUpload(file, 'applications', idx)
                    }
                    uploading={uploadingSubDoc}
                    availableMainTrees={availableMainTrees}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={handleCancel}
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

export default MarketTreeForm;
