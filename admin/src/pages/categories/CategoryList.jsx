import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX } from 'react-icons/fi';
import Header from '../../components/Header';
import Modal from '../../components/Modal';
import RichEditor from '../../components/RichEditor';
import SEO from '../../components/SEO';
import DataTable from '../../components/DataTable';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../context/NotificationContext';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [mainTrees, setMainTrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [filterMainTree, setFilterMainTree] = useState('');
  const { addNotification } = useNotification();

  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    slug: '',
    description: '',
    descriptionEn: '',
    imageUrl: '',
    mainTree: '',
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchMainTrees();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMainTree]);

  const fetchMainTrees = async () => {
    try {
      const res = await adminApi.getMainTrees();
      setMainTrees(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const params = filterMainTree ? { mainTree: filterMainTree } : undefined;
      const res = await adminApi.getCategories(params);
      const data = res.data?.data;
      setCategories(Array.isArray(data) ? data : data?.items || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const mainTreeById = useMemo(() => {
    const map = new Map();
    for (const t of mainTrees) map.set(String(t._id), t);
    return map;
  }, [mainTrees]);

  const filtered = useMemo(() => {
    let list = [...categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || (a.name || '').localeCompare(b.name || ''));
    if (!showInactive) {
      list = list.filter((c) => c.isActive !== false);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.nameEn?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [categories, search, showInactive]);

  const columns = useMemo(
    () => [
      {
        header: 'STT',
        accessor: '_id',
        render: (_, row, idx) => (
          <span className="text-gray-400 font-mono text-xs">{idx + 1}</span>
        ),
      },
      {
        header: 'Tên',
        accessor: 'name',
        render: (val, row) => (
          <div className="flex items-center gap-2">
            {row.imageUrl ? (
              <img
                src={row.imageUrl}
                alt={val}
                className="w-8 h-8 rounded object-cover flex-shrink-0"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-8 h-8 rounded bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-400 text-xs">
                N/A
              </div>
            )}
            <div className="min-w-0">
              <span className="font-medium text-gray-800">{val}</span>
              {row.nameEn && (
                <div className="text-[10px] text-gray-400">{row.nameEn}</div>
              )}
              {row.isActive === false && (
                <span className="ml-1.5 text-[10px] px-1.5 py-0.5 bg-red-50 text-red-500 rounded">
                  Tạm ẩn
                </span>
              )}
            </div>
          </div>
        ),
      },
      {
        header: 'Ngành hàng',
        accessor: 'mainTree',
        render: (val) => {
          const mt = typeof val === 'object' ? val : mainTreeById.get(String(val));
          return (
            <span className="text-xs text-gray-500">
              {mt ? mt.name : '—'}
            </span>
          );
        },
      },
      {
        header: 'Mô tả',
        accessor: 'description',
        render: (val) => (
          <span className="text-gray-500 line-clamp-2 max-w-xs" title={val}>
            {val || '—'}
          </span>
        ),
      },
      {
        header: 'Ngày tạo',
        accessor: 'createdAt',
        render: (val) => (
          <span className="text-gray-500 text-xs">
            {val ? new Date(val).toLocaleDateString('vi-VN') : '—'}
          </span>
        ),
      },
    ],
    [mainTreeById]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        mainTree: formData.mainTree || null,
      };
      if (editingCategory) {
        await adminApi.updateCategory(editingCategory._id, payload);
        addNotification('Cập nhật thành công');
      } else {
        await adminApi.createCategory(payload);
        addNotification('Thêm thành công');
      }
      setModalOpen(false);
      setEditingCategory(null);
      resetForm();
      fetchCategories();
    } catch (error) {
      addNotification(error.response?.data?.message || 'Có lỗi xảy ra', 'error');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    const mtId = category.mainTree?._id || category.mainTree || '';
    setFormData({
      name: category.name,
      nameEn: category.nameEn || '',
      slug: category.slug || '',
      description: category.description || '',
      descriptionEn: category.descriptionEn || '',
      imageUrl: category.imageUrl || '',
      mainTree: mtId,
      order: category.order ?? 0,
      isActive: category.isActive !== false,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa?')) return;
    try {
      await adminApi.deleteCategory(id);
      addNotification('Xóa thành công');
      fetchCategories();
    } catch (error) {
      addNotification('Có lỗi xảy ra', 'error');
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Xóa ${selectedIds.length} mục đã chọn?`)) return;
    setDeleting(true);
    try {
      await adminApi.deleteCategories(selectedIds);
      addNotification(`Đã xóa ${selectedIds.length} mục`);
      setSelectedIds([]);
      fetchCategories();
    } catch (error) {
      addNotification('Có lỗi xảy ra khi xóa nhiều', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      nameEn: '',
      slug: '',
      description: '',
      descriptionEn: '',
      imageUrl: '',
      mainTree: filterMainTree || '',
      order: 0,
      isActive: true,
    });
  };

  const renderActions = (row) => (
    <>
      <button
        onClick={() => handleEdit(row)}
        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
        title="Sửa"
      >
        <FiEdit2 size={14} />
      </button>
      <button
        onClick={() => handleDelete(row._id)}
        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
        title="Xóa"
      >
        <FiTrash2 size={14} />
      </button>
    </>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <SEO title="Product line" description="Quản lý product line" url="/categories" />
      <Header title="Quản lý Product line" />

      <div className="p-4">
        <div className="flex flex-wrap gap-2 items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">
            Danh sách product line
            <span className="ml-1.5 text-gray-400 font-normal">
              ({filtered.length} {showInactive ? '' : 'đang hoạt động'})
            </span>
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={filterMainTree}
              onChange={(e) => setFilterMainTree(e.target.value)}
              className="input-field text-xs py-1.5 w-44"
            >
              <option value="">Tất cả ngành hàng</option>
              {mainTrees.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
            {selectedIds.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                disabled={deleting}
                className="btn-danger flex items-center gap-1 text-xs"
              >
                <FiTrash2 size={14} />
                Xóa ({selectedIds.length})
              </button>
            )}
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
              <FiSearch
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Tìm tên, mô tả..."
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
                setEditingCategory(null);
                setModalOpen(true);
              }}
              className="btn-primary flex items-center gap-1 text-xs"
            >
              <FiPlus size={14} />
              Thêm product line
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
              <span className="text-3xl">📂</span>
              <p className="text-sm">
                {search
                  ? 'Không tìm thấy mục phù hợp'
                  : 'Chưa có product line nào'}
              </p>
              {!search && (
                <button
                  onClick={() => {
                    resetForm();
                    setModalOpen(true);
                  }}
                  className="text-xs text-primary hover:underline"
                >
                  Thêm mục đầu tiên
                </button>
              )}
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filtered}
              actions={renderActions}
              selectable
              selected={selectedIds}
              onSelectChange={setSelectedIds}
            />
          )}
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Sửa product line' : 'Thêm product line'}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1">
              Tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="input-field"
              placeholder="VD: ROSIN MODIFIED MALEIC RESIN"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Tên tiếng Anh</label>
            <input
              type="text"
              value={formData.nameEn}
              onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
              className="input-field"
              placeholder="English name (optional)"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Slug (tự động nếu trống)</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="input-field"
              placeholder="rosin-modified-maleic-resin"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Ngành hàng</label>
            <select
              value={formData.mainTree}
              onChange={(e) => setFormData({ ...formData, mainTree: e.target.value })}
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
            <label className="block text-xs font-medium mb-1">Link ảnh</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="input-field"
              placeholder="https://..."
            />
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

          <div className="flex items-center gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Thứ tự</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) =>
                  setFormData({ ...formData, order: Number(e.target.value) || 0 })
                }
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
              {editingCategory ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default CategoryList;