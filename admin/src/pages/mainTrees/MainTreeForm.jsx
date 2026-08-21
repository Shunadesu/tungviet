import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  FiLink,
  FiExternalLink,
} from 'react-icons/fi';
import HeaderWithBreadcrumb from '../settings/HeaderWithBreadcrumb';
import RichEditor from '../../components/RichEditor';
import SEO from '../../components/SEO';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../context/NotificationContext';

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
  technologies: [],
  applications: [],
};

const SubDocCard = ({
  item,
  index,
  kind,
  onUpdate,
  onRemove,
  onUpload,
  uploading,
  availableMainTrees,
}) => {
  const [expanded, setExpanded] = useState(false);
  const Icon = kind === 'technologies' ? FiCpu : FiPackage;

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
              <Icon size={14} />
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

const MainTreeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [uploadingSubDoc, setUploadingSubDoc] = useState(false);
  const [availableMainTrees, setAvailableMainTrees] = useState([]);
  const [formData, setFormData] = useState({ ...emptyForm });

  useEffect(() => {
    const loadMainTrees = async () => {
      try {
        const res = await adminApi.getMainTrees({ isActive: true });
        const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setAvailableMainTrees(
          list.filter((mt) => !isEditing || mt._id !== id)
        );
      } catch (err) {
        console.error('Failed to load main trees', err);
      }
    };
    loadMainTrees();
  }, [id, isEditing]);

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
          technologies: Array.isArray(tree.technologies)
            ? tree.technologies.map((t) => ({
                ...emptySubDoc,
                ...t,
                linkToMainTree:
                  t.linkToMainTree?._id || t.linkToMainTree || null,
              }))
            : [],
          applications: Array.isArray(tree.applications)
            ? tree.applications.map((a) => ({
                ...emptySubDoc,
                ...a,
                linkToMainTree:
                  a.linkToMainTree?._id || a.linkToMainTree || null,
              }))
            : [],
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

  const handleSubDocImageUpload = async (kind, index, file) => {
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
        { ...emptySubDoc, order: (prev[kind] || []).length },
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addNotification('Vui lòng nhập tên ngành hàng', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...formData,
        technologies: (formData.technologies || []).map((t) => ({
          ...t,
          description: t.description || undefined,
          descriptionEn: t.descriptionEn || undefined,
        })),
        applications: (formData.applications || []).map((a) => ({
          ...a,
          description: a.description || undefined,
          descriptionEn: a.descriptionEn || undefined,
        })),
      };
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
          {/* Basic info */}
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
                  onClick={() => navigate(`/main-trees/${id}/technologies`)}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <FiExternalLink size={12} />
                  Quản lý công nghệ
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => addSubDoc('technologies')}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <FiPlus size={12} />
                  Thêm công nghệ
                </button>
              )}
            </div>
            {isEditing ? (
              <button
                type="button"
                onClick={() => navigate(`/main-trees/${id}/technologies`)}
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
                Chưa có công nghệ nào.
              </p>
            ) : (
              <div className="space-y-2">
                {formData.technologies.map((item, idx) => (
                  <SubDocCard
                    key={`tech-${idx}`}
                    item={item}
                    index={idx}
                    kind="technologies"
                    onUpdate={(next) => updateSubDoc('technologies', idx, next)}
                    onRemove={() => removeSubDoc('technologies', idx)}
                    onUpload={(file) =>
                      handleSubDocImageUpload('technologies', idx, file)
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
                  onClick={() => navigate(`/main-trees/${id}/applications`)}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <FiExternalLink size={12} />
                  Quản lý ứng dụng
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => addSubDoc('applications')}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <FiPlus size={12} />
                  Thêm ứng dụng
                </button>
              )}
            </div>
            {isEditing ? (
              <button
                type="button"
                onClick={() => navigate(`/main-trees/${id}/applications`)}
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
                Chưa có ứng dụng nào.
              </p>
            ) : (
              <div className="space-y-2">
                {formData.applications.map((item, idx) => (
                  <SubDocCard
                    key={`app-${idx}`}
                    item={item}
                    index={idx}
                    kind="applications"
                    onUpdate={(next) => updateSubDoc('applications', idx, next)}
                    onRemove={() => removeSubDoc('applications', idx)}
                    onUpload={(file) =>
                      handleSubDocImageUpload('applications', idx, file)
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
