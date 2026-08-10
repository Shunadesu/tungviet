import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiX,
  FiUpload,
  FiImage,
  FiFolder,
  FiFolderPlus,
  FiCpu,
  FiPackage,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi';
import Header from '../../components/Header';
import Modal from '../../components/Modal';
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
  productIds: [],
};

const emptyForm = {
  mainTree: '',
  parent: null,
  title: '',
  titleEn: '',
  description: '',
  descriptionEn: '',
  imageUrl: '',
  order: 0,
  isActive: true,
  technologies: [],
  applications: [],
};

const SubDocCard = ({ item, index, onUpdate, onRemove, onUpload, uploading }) => {
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
              <div className="text-[10px] text-gray-400 truncate">{item.titleEn}</div>
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
                onChange={(e) => onUpdate({ ...item, titleEn: e.target.value })}
                className="input-field text-xs"
                placeholder="English title"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-medium mb-0.5 text-gray-700">Mô tả</label>
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
            <label className="block text-[10px] font-medium mb-0.5 text-gray-700">Hình ảnh</label>
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
              <label className="block text-[10px] font-medium mb-0.5 text-gray-700">Thứ tự</label>
              <input
                type="number"
                value={item.order ?? 0}
                onChange={(e) => onUpdate({ ...item, order: Number(e.target.value) || 0 })}
                className="input-field w-20 text-xs"
              />
            </div>
            <label className="flex items-center gap-1 cursor-pointer select-none mt-3.5">
              <input
                type="checkbox"
                checked={item.isActive !== false}
                onChange={(e) => onUpdate({ ...item, isActive: e.target.checked })}
                className="rounded w-3 h-3"
              />
              <span className="text-[10px] font-medium">Hiển thị</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

const MarketTreeList = () => {
  const [mainTrees, setMainTrees] = useState([]);
  const [selectedMainTree, setSelectedMainTree] = useState('');
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNode, setEditingNode] = useState(null);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [uploading, setUploading] = useState(false);
  const [uploadingSubDoc, setUploadingSubDoc] = useState(false);
  const [search, setSearch] = useState('');
  const [availableProducts, setAvailableProducts] = useState([]);
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchMainTrees();
  }, []);

  useEffect(() => {
    if (selectedMainTree) {
      fetchNodes();
      fetchProducts();
    } else {
      setNodes([]);
      setAvailableProducts([]);
    }
  }, [selectedMainTree]);

  const fetchMainTrees = async () => {
    try {
      const res = await adminApi.getMainTrees();
      const data = res.data?.data;
      const list = Array.isArray(data) ? data : [];
      setMainTrees(list);
      if (list.length > 0 && !selectedMainTree) {
        setSelectedMainTree(list[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNodes = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getMarketTrees({ mainTree: selectedMainTree });
      setNodes(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await adminApi.getProducts({ mainTree: selectedMainTree, limit: 200 });
      const items = Array.isArray(res.data?.data) ? res.data.data : [];
      setAvailableProducts(items);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return nodes;
    const q = search.toLowerCase();
    return nodes.filter(
      (n) =>
        n.title?.toLowerCase().includes(q) ||
        n.titleEn?.toLowerCase().includes(q)
    );
  }, [nodes, search]);

  const parents = useMemo(() => filtered.filter((n) => !n.parent), [filtered]);
  const childMap = useMemo(() => {
    const map = new Map();
    for (const n of filtered) {
      if (n.parent) {
        const key = String(n.parent);
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(n);
      }
    }
    return map;
  }, [filtered]);

  const resetForm = () =>
    setFormData({
      mainTree: selectedMainTree,
      parent: null,
      title: '',
      titleEn: '',
      description: '',
      descriptionEn: '',
      imageUrl: '',
      order: 0,
      isActive: true,
      technologies: [],
      applications: [],
    });

  const handleAddParent = () => {
    resetForm();
    setEditingNode(null);
    setModalOpen(true);
  };

  const handleAddChild = (parentNode) => {
    resetForm();
    setFormData((prev) => ({ ...prev, parent: parentNode._id }));
    setEditingNode(null);
    setModalOpen(true);
  };

  const handleEdit = (node) => {
    setEditingNode(node);
    setFormData({
      mainTree: selectedMainTree,
      parent: node.parent || null,
      title: node.title || '',
      titleEn: node.titleEn || '',
      description: node.description || '',
      descriptionEn: node.descriptionEn || '',
      imageUrl: node.imageUrl || '',
      order: node.order ?? 0,
      isActive: node.isActive !== false,
      technologies: Array.isArray(node.technologies)
        ? node.technologies.map((t) => ({
            ...emptySubDoc,
            ...t,
            productIds: [],
          }))
        : [],
      applications: Array.isArray(node.applications)
        ? node.applications.map((a) => ({
            ...emptySubDoc,
            ...a,
            productIds: Array.isArray(a.productIds) ? a.productIds.map((p) => p?._id || p) : [],
          }))
        : [],
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        mainTree: selectedMainTree,
      };
      if (editingNode) {
        await adminApi.updateMarketTree(editingNode._id, payload);
        addNotification('Cập nhật thành công');
      } else {
        await adminApi.createMarketTree(payload);
        addNotification('Thêm thành công');
      }
      setModalOpen(false);
      setEditingNode(null);
      fetchNodes();
    } catch (err) {
      addNotification(err.response?.data?.message || 'Có lỗi xảy ra', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa mục này? (Cả mục con cũng sẽ bị xóa)')) return;
    try {
      await adminApi.deleteMarketTree(id);
      addNotification('Xóa thành công');
      fetchNodes();
    } catch (err) {
      addNotification(err.response?.data?.message || 'Có lỗi xảy ra', 'error');
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
      [kind]: [...(prev[kind] || []), { ...emptySubDoc, order: (prev[kind] || []).length }],
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

  const toggleProductSelection = (appIndex, productId) => {
    setFormData((prev) => {
      const list = [...(prev.applications || [])];
      const current = new Set(list[appIndex].productIds || []);
      if (current.has(productId)) {
        current.delete(productId);
      } else {
        current.add(productId);
      }
      list[appIndex] = { ...list[appIndex], productIds: Array.from(current) };
      return { ...prev, applications: list };
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <SEO title="Cây ngành" description="Quản lý cây ngành" url="/market-trees" />
      <Header title="Quản lý cây ngành" />

      <div className="p-4">
        <div className="flex flex-wrap gap-2 items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-gray-700">Cây ngành</h2>
            <select
              value={selectedMainTree}
              onChange={(e) => setSelectedMainTree(e.target.value)}
              className="input-field text-xs py-1.5 w-64"
            >
              {mainTrees.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} {t.nameEn ? `(${t.nameEn})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <FiSearch size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-8 pr-8 text-xs py-1.5 w-52"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiX size={12} />
                </button>
              )}
            </div>
            <button
              onClick={handleAddParent}
              className="btn-primary flex items-center gap-1 text-xs"
              disabled={!selectedMainTree}
            >
              <FiPlus size={14} />
              Thêm danh mục cha
            </button>
          </div>
        </div>

        <div className="card">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary" />
            </div>
          ) : parents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
              <span className="text-3xl">🌿</span>
              <p className="text-sm">Chưa có danh mục cha nào trong ngành này.</p>
              <button
                onClick={handleAddParent}
                className="text-xs text-primary hover:underline"
                disabled={!selectedMainTree}
              >
                Thêm danh mục cha đầu tiên
              </button>
            </div>
          ) : (
            <div className="divide-y">
              {parents.map((parent) => (
                <div key={parent._id} className="p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      {parent.imageUrl ? (
                        <img
                          src={parent.imageUrl}
                          alt=""
                          className="w-9 h-9 rounded object-cover flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-9 h-9 rounded bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                          <FiFolder size={16} />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{parent.title}</span>
                          {parent.titleEn && (
                            <span className="text-xs text-gray-400">{parent.titleEn}</span>
                          )}
                          {parent.isActive === false && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-500 rounded">
                              Ẩn
                            </span>
                          )}
                          {Array.isArray(parent.applications) && parent.applications.length > 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded">
                              {parent.applications.length} ứng dụng
                            </span>
                          )}
                          {Array.isArray(parent.technologies) && parent.technologies.length > 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded">
                              {parent.technologies.length} công nghệ
                            </span>
                          )}
                        </div>
                        {parent.description && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                            {parent.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleAddChild(parent)}
                        className="p-1 bg-green-50 text-green-600 rounded hover:bg-green-100"
                        title="Thêm mục con"
                      >
                        <FiFolderPlus size={14} />
                      </button>
                      <button
                        onClick={() => handleEdit(parent)}
                        className="p-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                        title="Sửa"
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(parent._id)}
                        className="p-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
                        title="Xóa"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Children */}
                  {(childMap.get(String(parent._id)) || []).length > 0 && (
                    <div className="ml-11 mt-2 space-y-1.5 border-l-2 border-gray-100 pl-3">
                      {childMap.get(String(parent._id)).map((child) => (
                        <div
                          key={child._id}
                          className="flex items-center justify-between gap-2 py-1.5"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-gray-400">↳</span>
                            <span className="text-xs font-medium">{child.title}</span>
                            {child.titleEn && (
                              <span className="text-xs text-gray-400">{child.titleEn}</span>
                            )}
                            {child.isActive === false && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-500 rounded">
                                Ẩn
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEdit(child)}
                              className="p-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                              title="Sửa"
                            >
                              <FiEdit2 size={12} />
                            </button>
                            <button
                              onClick={() => handleDelete(child._id)}
                              className="p-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
                              title="Xóa"
                            >
                              <FiTrash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingNode ? 'Sửa mục' : formData.parent ? 'Thêm mục con' : 'Thêm danh mục cha'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formData.parent && (
            <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
              Đang thêm/sửa mục con của danh mục cha đã chọn.
            </div>
          )}

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
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="input-field"
                  placeholder="VD: Sơn PU"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Tiêu đề tiếng Anh</label>
                <input
                  type="text"
                  value={formData.titleEn}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                  className="input-field"
                  placeholder="PU Coatings"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Mô tả</label>
              <RichEditor
                value={formData.description}
                onChange={(value) => setFormData({ ...formData, description: value })}
                placeholder="Mô tả..."
                minHeight={140}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Mô tả tiếng Anh</label>
              <RichEditor
                value={formData.descriptionEn}
                onChange={(value) => setFormData({ ...formData, descriptionEn: value })}
                placeholder="English description"
                minHeight={140}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Hình minh họa</label>
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
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="input-field mt-2 text-xs"
                placeholder="Hoặc nhập URL"
              />
            </div>

            <div className="flex items-center gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Thứ tự</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) || 0 })}
                  className="input-field w-24"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none mt-5">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                <span className="text-xs font-medium">Đang hoạt động</span>
              </label>
            </div>
          </div>

          {/* Section: Technologies */}
          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-1">
                <FiCpu size={14} />
                Công nghệ
              </h3>
              <button
                type="button"
                onClick={() => addSubDoc('technologies')}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <FiPlus size={12} />
                Thêm công nghệ
              </button>
            </div>
            {(formData.technologies || []).length === 0 ? (
              <p className="text-[11px] text-gray-400 italic">Chưa có công nghệ nào.</p>
            ) : (
              <div className="space-y-2">
                {formData.technologies.map((item, idx) => (
                  <SubDocCard
                    key={`tech-${idx}`}
                    item={item}
                    index={idx}
                    onUpdate={(next) => updateSubDoc('technologies', idx, next)}
                    onRemove={() => removeSubDoc('technologies', idx)}
                    onUpload={(file) => handleSubDocImageUpload(file, 'technologies', idx)}
                    uploading={uploadingSubDoc}
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
                Ứng dụng
              </h3>
              <button
                type="button"
                onClick={() => addSubDoc('applications')}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <FiPlus size={12} />
                Thêm ứng dụng
              </button>
            </div>
            {(formData.applications || []).length === 0 ? (
              <p className="text-[11px] text-gray-400 italic">Chưa có ứng dụng nào.</p>
            ) : (
              <div className="space-y-2">
                {formData.applications.map((item, idx) => (
                  <div key={`app-${idx}`} className="space-y-2">
                    <SubDocCard
                      item={item}
                      index={idx}
                      onUpdate={(next) => updateSubDoc('applications', idx, next)}
                      onRemove={() => removeSubDoc('applications', idx)}
                      onUpload={(file) => handleSubDocImageUpload(file, 'applications', idx)}
                      uploading={uploadingSubDoc}
                    />
                    {/* Product picker for this application */}
                    <div className="ml-3 p-2 bg-white border border-gray-100 rounded">
                      <label className="block text-[10px] font-medium mb-1 text-gray-600">
                        Sản phẩm sử dụng ({(item.productIds || []).length} đã chọn)
                      </label>
                      {availableProducts.length === 0 ? (
                        <p className="text-[10px] text-gray-400 italic">
                          Chưa có sản phẩm trong ngành này.
                        </p>
                      ) : (
                        <div className="max-h-40 overflow-y-auto border border-gray-100 rounded p-1 space-y-1">
                          {availableProducts.map((p) => {
                            const checked = (item.productIds || []).includes(p._id);
                            return (
                              <label
                                key={p._id}
                                className="flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded"
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleProductSelection(idx, p._id)}
                                  className="rounded w-3 h-3"
                                />
                                <span className="truncate">{p.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-secondary text-xs"
            >
              Hủy
            </button>
            <button type="submit" className="btn-primary text-xs">
              {editingNode ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default MarketTreeList;