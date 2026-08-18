import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX } from 'react-icons/fi';
import Header from '../../components/Header';
import SEO from '../../components/SEO';
import DataTable from '../../components/DataTable';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../context/NotificationContext';

const CategoryList = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [mainTrees, setMainTrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [filterMainTree, setFilterMainTree] = useState('');
  const { addNotification } = useNotification();

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
    let list = [...categories].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0) || (a.name || '').localeCompare(b.name || '')
    );
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
            <span className="text-xs text-gray-500">{mt ? mt.name : '—'}</span>
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

  const renderActions = (row) => (
    <>
      <button
        onClick={() => navigate(`/categories/${row._id}/edit`)}
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
              <FiSearch size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
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
              onClick={() => navigate('/categories/new')}
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
                {search ? 'Không tìm thấy mục phù hợp' : 'Chưa có product line nào'}
              </p>
              {!search && (
                <button
                  onClick={() => navigate('/categories/new')}
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
    </motion.div>
  );
};

export default CategoryList;