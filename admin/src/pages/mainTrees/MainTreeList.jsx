import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiX,
  FiArrowUp,
  FiArrowDown,
  FiEye,
  FiEyeOff,
} from 'react-icons/fi';
import Header from '../../components/Header';
import SEO from '../../components/SEO';
import DataTable from '../../components/DataTable';
import ConfirmModal from '../../components/ConfirmModal';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../context/NotificationContext';

const MainTreeList = () => {
  const navigate = useNavigate();
  const [trees, setTrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchTrees();
  }, []);

  useEffect(() => {
    setSelectedIds([]);
  }, [search, showInactive]);

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

  const handleDelete = async (id) => {
    setConfirmDelete({ ids: [id], mode: 'single' });
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    setConfirmDelete({ ids: [...selectedIds], mode: 'bulk' });
  };

  const executeDelete = async () => {
    if (!confirmDelete) return;
    const { ids } = confirmDelete;
    setDeleting(true);
    try {
      if (ids.length === 1) {
        await adminApi.deleteMainTree(ids[0]);
        addNotification('Xóa ngành hàng thành công');
      } else {
        const res = await adminApi.bulkMainTrees({ action: 'delete', ids });
        const deleted = res.data?.deleted ?? ids.length;
        addNotification(`Đã xóa ${deleted} ngành hàng`);
      }
      setConfirmDelete(null);
      setSelectedIds([]);
      fetchTrees();
    } catch (error) {
      addNotification(error.response?.data?.message || 'Có lỗi xảy ra khi xóa', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActiveSelected = async (value) => {
    if (selectedIds.length === 0) return;
    setToggling(true);
    try {
      await adminApi.bulkMainTrees({ action: 'toggleActive', ids: selectedIds, isActive: value });
      addNotification(
        `Đã cập nhật trạng thái cho ${selectedIds.length} ngành hàng`
      );
      setSelectedIds([]);
      fetchTrees();
    } catch (error) {
      addNotification(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật', 'error');
    } finally {
      setToggling(false);
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

  const renderActions = (row) => (
    <>
      <button
        onClick={() => handleMove(row, 'up')}
        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
        title="Lên"
      >
        <FiArrowUp size={12} />
      </button>
      <button
        onClick={() => handleMove(row, 'down')}
        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
        title="Xuống"
      >
        <FiArrowDown size={12} />
      </button>
      <button
        onClick={() => navigate(`/main-trees/${row._id}/edit`)}
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
            {row.iconUrl ? (
              <img
                src={row.iconUrl}
                alt=""
                className="w-7 h-7 rounded object-cover flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-7 h-7 rounded bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-400 text-xs">
                🌳
              </div>
            )}
            <div className="min-w-0">
              <div className="text-xs font-medium">{val}</div>
              {row.nameEn && (
                <div className="text-[10px] text-gray-400">{row.nameEn}</div>
              )}
              {row.isActive === false && (
                <span className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-500 rounded">
                  Tạm ẩn
                </span>
              )}
            </div>
          </div>
        ),
      },
      {
        header: 'Slug',
        accessor: 'slug',
        render: (val) => <span className="text-gray-500">{val}</span>,
      },
      {
        header: 'Mô tả',
        accessor: 'description',
        render: (val) => (
          <span className="text-gray-500 max-w-xs truncate inline-block align-middle" title={val}>
            {val || '—'}
          </span>
        ),
      },
      {
        header: 'Thứ tự',
        accessor: 'order',
        render: (val) => (
          <span className="text-xs text-center block">{val ?? 0}</span>
        ),
        className: 'text-center',
      },
    ],
    []
  );

  const hasSelection = selectedIds.length > 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <SEO title="Cây ngành sản phẩm" description="Quản lý cây ngành sản phẩm" url="/main-trees" />
      <Header title="Quản lý cây ngành sản phẩm" />

      <div className="p-4">
        <div className="flex flex-wrap gap-2 items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">
            Danh sách ngành hàng
            <span className="ml-1.5 text-gray-400 font-normal">
              ({filtered.length} {showInactive ? '' : 'đang hoạt động'})
            </span>
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            {hasSelection && (
              <>
                <button
                  onClick={() => handleToggleActiveSelected(true)}
                  disabled={toggling || deleting}
                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-green-50 text-green-700 rounded hover:bg-green-100 disabled:opacity-50"
                >
                  <FiEye size={14} />
                  Hiện ({selectedIds.length})
                </button>
                <button
                  onClick={() => handleToggleActiveSelected(false)}
                  disabled={toggling || deleting}
                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-amber-50 text-amber-700 rounded hover:bg-amber-100 disabled:opacity-50"
                >
                  <FiEyeOff size={14} />
                  Ẩn ({selectedIds.length})
                </button>
                <button
                  onClick={handleDeleteSelected}
                  disabled={deleting || toggling}
                  className="btn-danger flex items-center gap-1 text-xs"
                >
                  <FiTrash2 size={14} />
                  Xóa ({selectedIds.length})
                </button>
              </>
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
              onClick={() => navigate('/main-trees/new')}
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
                  onClick={() => navigate('/main-trees/new')}
                  className="text-xs text-primary hover:underline"
                >
                  Thêm ngành hàng đầu tiên
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

      <ConfirmModal
        isOpen={Boolean(confirmDelete)}
        onClose={() => !deleting && setConfirmDelete(null)}
        onConfirm={executeDelete}
        title="Xóa ngành hàng"
        message={
          confirmDelete?.ids.length === 1
            ? 'Bạn có chắc muốn xóa ngành hàng này?'
            : `Bạn có chắc muốn xóa ${confirmDelete?.ids.length ?? 0} ngành hàng đã chọn? Hành động này không thể hoàn tác.`
        }
        confirmText="Xóa"
        confirmStyle="danger"
        loading={deleting}
      />
    </motion.div>
  );
};

export default MainTreeList;