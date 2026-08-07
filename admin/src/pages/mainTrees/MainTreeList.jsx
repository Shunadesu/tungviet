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
  FiArrowUp,
  FiArrowDown,
} from 'react-icons/fi';
import Header from '../../components/Header';
import Modal from '../../components/Modal';
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

const MainTreeList = () => {
  const [trees, setTrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTree, setEditingTree] = useState(null);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchTrees();
  }, []);

  const fetchTrees = async () => {
    try {
      const res = await adminApi.getMainTrees();
      const data = res.data?.data;
      setTrees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let list = [...trees];
    if (!showInactive) {
      list = list.filter((t) => t.isActive !== false);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.name?.toLowerCase().includes(q) ||
          t.nameEn?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [trees, search, showInactive]);

  const resetForm = () => setFormData({ ...emptyForm });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (editingTree) {
        await adminApi.updateMainTree(editingTree._id, payload);
        addNotification('Cập nhật ngành hàng thành công');
      } else {
        await adminApi.createMainTree(payload);
        addNotification('Thêm ngành hàng thành công');
      }
      setModalOpen(false);
      setEditingTree(null);
      resetForm();
      fetchTrees();
    } catch (error) {
      addNotification(error.response?.data?.message || 'Có lỗi xảy ra', 'error');
    }
  };

  const handleEdit = (tree) => {
    setEditingTree(tree);
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
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa ngành hàng này?')) return;
    try {
      await adminApi.deleteMainTree(id);
      addNotification('Xóa ngành hàng thành công');
      fetchTrees();
    } catch (error) {
      addNotification(error.response?.data?.message || 'Có lỗi xảy ra', 'error');
    }
  };

  const handleMove = async (tree, direction) => {
    const sorted = [...filtered];
    const idx = sorted.findIndex((t) => t._id === tree._id);
    if (idx < 0) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;
    const tmp = sorted[idx];
    sorted[idx] = sorted[targetIdx];
    sorted[targetIdx] = tmp;
    const order = sorted.map((t, i) => ({ _id: t._id, order: i }));
    try {
      await adminApi.reorderMainTrees(order);
      addNotification('Cập nhật thứ tự thành công');
      fetchTrees();
    } catch (err) {
      addNotification('Cập nhật thứ tự thất bại', 'error');
    }
  };

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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <SEO title="Ngành hàng" description="Quản lý ngành hàng" url="/main-trees" />
      <Header title="Quản lý ngành hàng" />

      <div className="p-4">
        <div className="flex flex-wrap gap-2 items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">
            Danh sách ngành hàng
            <span className="ml-1.5 text-gray-400 font-normal">
              ({filtered.length} {showInactive ? '' : 'đang hoạt động'})
            </span>
          </h2>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded"
              />
              Hiện tạm ẩn
            </label>
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
              onClick={() => {
                resetForm();
                setEditingTree(null);
                setModalOpen(true);
              }}
              className="btn-primary flex items-center gap-1 text-xs"
            >
              <FiPlus size={14} />
              Thêm ngành hàng
            </button>
          </div>
        </div>

        <div className="card">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
              <span className="text-3xl">🌳</span>
              <p className="text-sm">
                {search ? 'Không tìm thấy ngành hàng phù hợp' : 'Chưa có ngành hàng nào'}
              </p>
              {!search && (
                <button
                  onClick={() => {
                    resetForm();
                    setModalOpen(true);
                  }}
                  className="text-xs text-primary hover:underline"
                >
                  Thêm ngành hàng đầu tiên
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="table-header">
                    <th className="px-2 py-2 text-left text-xs w-12">#</th>
                    <th className="px-2 py-2 text-left text-xs">Tên</th>
                    <th className="px-2 py-2 text-left text-xs">Slug</th>
                    <th className="px-2 py-2 text-left text-xs">Mô tả</th>
                    <th className="px-2 py-2 text-center text-xs">Thứ tự</th>
                    <th className="px-2 py-2 text-right text-xs">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((tree, idx) => (
                    <tr key={tree._id} className="table-row">
                      <td className="px-2 py-2 text-xs text-gray-400 font-mono">{idx + 1}</td>
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-2">
                          {tree.iconUrl ? (
                            <img
                              src={tree.iconUrl}
                              alt=""
                              className="w-7 h-7 rounded object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-7 h-7 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                              🌳
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="text-xs font-medium">{tree.name}</div>
                            {tree.nameEn && (
                              <div className="text-[10px] text-gray-400">{tree.nameEn}</div>
                            )}
                            {tree.isActive === false && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-500 rounded">
                                Tạm ẩn
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-2 text-xs text-gray-500">{tree.slug}</td>
                      <td className="px-2 py-2 text-xs text-gray-500 max-w-xs truncate">
                        {tree.description || '—'}
                      </td>
                      <td className="px-2 py-2 text-center">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleMove(tree, 'up')}
                            className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                            title="Lên"
                          >
                            <FiArrowUp size={12} />
                          </button>
                          <span className="text-xs">{tree.order ?? 0}</span>
                          <button
                            onClick={() => handleMove(tree, 'down')}
                            className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                            title="Xuống"
                          >
                            <FiArrowDown size={12} />
                          </button>
                        </div>
                      </td>
                      <td className="px-2 py-2 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => handleEdit(tree)}
                            className="p-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                            title="Sửa"
                          >
                            <FiEdit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(tree._id)}
                            className="p-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
                            title="Xóa"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTree ? 'Sửa ngành hàng' : 'Thêm ngành hàng'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">
                Tên ngành hàng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="input-field"
                placeholder="VD: Hóa chất công nghiệp"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Tên tiếng Anh</label>
              <input
                type="text"
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                className="input-field"
                placeholder="Industrial Chemicals"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Slug (tự động nếu trống)</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="input-field"
              placeholder="hoa-chat-cong-nghiep"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Mô tả</label>
            <RichEditor
              value={formData.description}
              onChange={(value) => setFormData({ ...formData, description: value })}
              placeholder="Mô tả ngắn..."
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

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Banner (imageUrl)</label>
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
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
                className="input-field mt-2 text-xs"
                placeholder="Hoặc nhập URL"
              />
            </div>
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

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-secondary text-xs"
            >
              Hủy
            </button>
            <button type="submit" className="btn-primary text-xs">
              {editingTree ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default MainTreeList;