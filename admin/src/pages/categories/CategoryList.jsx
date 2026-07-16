import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX } from 'react-icons/fi';
import Header from '../../components/Header';
import Modal from '../../components/Modal';
import SEO from '../../components/SEO';
import DataTable from '../../components/DataTable';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../context/NotificationContext';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [selected, setSelected] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const { addNotification } = useNotification();

  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    description: '',
    descriptionEn: '',
    imageUrl: '',
    isActive: true,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await adminApi.getCategories({ page: 1, limit: 100 });
      setCategories(res.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let list = categories;
    if (!showInactive) {
      list = list.filter((c) => c.isActive !== false);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
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
        header: 'Tên danh mục',
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
    []
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await adminApi.updateCategory(editingCategory._id, formData);
        addNotification('Cập nhật danh mục thành công');
      } else {
        await adminApi.createCategory(formData);
        addNotification('Thêm danh mục thành công');
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
    setFormData({
      name: category.name,
      nameEn: category.nameEn || '',
      description: category.description || '',
      descriptionEn: category.descriptionEn || '',
      imageUrl: category.imageUrl || '',
      isActive: category.isActive !== false,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return;
    try {
      await adminApi.deleteCategory(id);
      addNotification('Xóa danh mục thành công');
      fetchCategories();
    } catch (error) {
      addNotification('Có lỗi xảy ra', 'error');
    }
  };

  const handleDeleteSelected = async () => {
    if (selected.length === 0) return;
    if (!confirm(`Xóa ${selected.length} danh mục đã chọn?`)) return;
    setDeleting(true);
    try {
      await adminApi.deleteCategories(selected);
      addNotification(`Đã xóa ${selected.length} danh mục`);
      setSelected([]);
      fetchCategories();
    } catch (error) {
      addNotification('Có lỗi xảy ra khi xóa nhiều', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', nameEn: '', description: '', descriptionEn: '', imageUrl: '', isActive: true });
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
      <SEO title="Danh mục" description="Quản lý danh mục sản phẩm" url="/categories" />
      <Header title="Quản lý danh mục" />

      <div className="p-4">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-2 items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">
            Danh sách danh mục
            <span className="ml-1.5 text-gray-400 font-normal">
              ({filtered.length}{' '}
              {showInactive ? '' : 'đang hoạt động'})
            </span>
          </h2>
          <div className="flex items-center gap-2">
            {selected.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                disabled={deleting}
                className="btn-danger flex items-center gap-1 text-xs"
              >
                <FiTrash2 size={14} />
                Xóa ({selected.length})
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
              Thêm danh mục
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="card">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
              <span className="text-3xl">📂</span>
              <p className="text-sm">
                {search
                  ? 'Không tìm thấy danh mục phù hợp'
                  : 'Chưa có danh mục nào'}
              </p>
              {!search && (
                <button
                  onClick={() => {
                    resetForm();
                    setModalOpen(true);
                  }}
                  className="text-xs text-primary hover:underline"
                >
                  Thêm danh mục đầu tiên
                </button>
              )}
            </div>
          ) : (
            <DataTable columns={columns} data={filtered} actions={renderActions} selectable selected={selected} onSelectChange={setSelected} />
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Sửa danh mục' : 'Thêm danh mục'}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1">Tên danh mục *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="input-field"
              placeholder="VD: Cây Cảnh Trong Nhà"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Tên tiếng Anh</label>
            <input
              type="text"
              value={formData.nameEn}
              onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
              className="input-field"
              placeholder="English name (tùy chọn)"
            />
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
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="input-field resize-none"
              placeholder="Mô tả ngắn về danh mục..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Mô tả tiếng Anh</label>
            <textarea
              value={formData.descriptionEn}
              onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
              rows={3}
              className="input-field resize-none"
              placeholder="English description (tùy chọn)"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded"
              />
              <span className="text-xs font-medium">Đang hoạt động</span>
            </label>
            <p className="text-[10px] text-gray-400 mt-0.5 ml-5">
              Bỏ chọn để tạm ẩn danh mục khỏi trang công khai
            </p>
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
