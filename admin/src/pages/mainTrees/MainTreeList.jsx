import { useEffect, useMemo, useCallback, useRef } from 'react';
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
  FiCpu,
} from 'react-icons/fi';
import Header from '../../components/Header';
import SEO from '../../components/SEO';
import DataTable from '../../components/DataTable';
import Skeleton from '../../components/Skeleton';
import {
  useAdminStore,
  useAdminStoreEntity,
  useEntitySelection,
  useNotification,
} from '../../hooks/useAdminStore';

const MainTreeList = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const mainTrees = useAdminStoreEntity('mainTrees');
  const ui = useAdminStore((s) => s.ui);
  const openConfirm = useAdminStore((s) => s.ui.openConfirm);

  const { selectedIds, clearSelection } = useEntitySelection('mainTrees');

  const filters = ui.filters.mainTrees || {};
  const search = filters.search || '';
  const showInactive = Boolean(filters.showInactive);

  const setFilter = useCallback(
    (partial) => ui.setFilter('mainTrees', partial),
    [ui]
  );

  // Load data on mount
  const loadedRef = useRef(false);
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    mainTrees.fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mainTrees.fetchAll is stable — do NOT add mainTrees to deps

  const filtered = useMemo(() => {
    let list = [...mainTrees.allItems];
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
  }, [mainTrees.allItems, search, showInactive]);

  // Clear selection when filter changes
  const prevSearch = useRef(search);
  const prevShowInactive = useRef(showInactive);
  useEffect(() => {
    if (
      search !== prevSearch.current ||
      showInactive !== prevShowInactive.current
    ) {
      prevSearch.current = search;
      prevShowInactive.current = showInactive;
      clearSelection();
    }
  }, [search, showInactive, clearSelection]);

  const handleDelete = useCallback(
    (id) => {
      openConfirm({
        title: 'Xóa ngành hàng',
        message: 'Bạn có chắc muốn xóa ngành hàng này?',
        confirmText: 'Xóa',
        confirmStyle: 'danger',
        onConfirm: async () => {
          try {
            await mainTrees.remove(id);
            addNotification('Xóa ngành hàng thành công');
            clearSelection();
          } catch (err) {
            addNotification(
              err.response?.data?.message || 'Có lỗi xảy ra khi xóa',
              'error'
            );
          }
        },
      });
    },
    [openConfirm, mainTrees, addNotification, clearSelection]
  );

  const handleDeleteSelected = useCallback(async () => {
    if (selectedIds.length === 0) return;
    openConfirm({
      title: 'Xóa hàng loạt',
      message: `Xóa ${selectedIds.length} ngành hàng đã chọn? Hành động này không thể hoàn tác.`,
      confirmText: 'Xóa',
      confirmStyle: 'danger',
      onConfirm: async () => {
        try {
          await mainTrees.removeMany(selectedIds);
          addNotification(`Đã xóa ${selectedIds.length} ngành hàng`);
          clearSelection();
        } catch (err) {
          addNotification(
            err.response?.data?.message || 'Có lỗi xảy ra khi xóa',
            'error'
          );
        }
      },
    });
  }, [selectedIds, openConfirm, mainTrees, addNotification, clearSelection]);

  const handleToggleActiveSelected = useCallback(
    async (value) => {
      if (selectedIds.length === 0) return;
      openConfirm({
        title: value ? 'Hiện ngành hàng' : 'Ẩn ngành hàng',
        message: `Cập nhật trạng thái cho ${selectedIds.length} ngành hàng đã chọn?`,
        confirmText: 'Cập nhật',
        confirmStyle: 'primary',
        onConfirm: async () => {
          try {
            await mainTrees.update(selectedIds[0], {
              _bulk: selectedIds,
              isActive: value,
            });
            addNotification(
              `Đã cập nhật trạng thái cho ${selectedIds.length} ngành hàng`
            );
            clearSelection();
            mainTrees.invalidateList();
            mainTrees.fetchAll();
          } catch (err) {
            addNotification(
              err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật',
              'error'
            );
          }
        },
      });
    },
    [selectedIds, openConfirm, mainTrees, addNotification, clearSelection]
  );

  const handleMove = useCallback(
    async (tree, direction) => {
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
        await mainTrees.reorder(order);
        addNotification('Cập nhật thứ tự thành công');
      } catch {
        addNotification('Cập nhật thứ tự thất bại', 'error');
      }
    },
    [filtered, mainTrees, addNotification]
  );

  const columns = useMemo(
    () => [
      {
        header: 'STT',
        accessor: '_id',
        render: (_, row, idx) => (
          <span className="text-gray-400 font-mono text-xs block w-5 text-center">{idx + 1}</span>
        ),
        className: 'w-8',
      },
      {
        header: 'Hình ảnh',
        accessor: 'imageUrl',
        render: (val) => (
          <div className="flex items-center justify-center">
            {val ? (
              <img
                src={val}
                alt=""
                className="w-10 h-10 rounded object-cover border border-gray-200"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                🌳
              </div>
            )}
          </div>
        ),
        className: 'text-center',
      },
      {
        header: 'Tên ngành hàng',
        accessor: 'name',
        render: (val, row) => (
          <div className="min-w-0">
            <div className="text-xs font-semibold text-gray-800">{val}</div>
            {row.nameEn && (
              <div className="text-[10px] text-gray-400 mt-0.5">{row.nameEn}</div>
            )}
            {row.isActive === false && (
              <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 bg-red-50 text-red-600 rounded">
                Tạm ẩn
              </span>
            )}
          </div>
        ),
      },
      {
        header: 'Slug',
        accessor: 'slug',
        render: (val) => <span className="text-gray-500 text-xs">{val}</span>,
      },
      {
        header: 'Công nghệ',
        accessor: 'technologies',
        render: (val) => {
          const count = Array.isArray(val) ? val.length : 0;
          return (
            <div className="flex items-center justify-center">
              {count > 0 ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                  <FiCpu size={12} />
                  {count}
                </span>
              ) : (
                <span className="text-gray-300 text-xs">—</span>
              )}
            </div>
          );
        },
        className: 'text-center',
      },
      {
        header: 'Mô tả',
        accessor: 'description',
        render: (val) => {
          if (!val) return <span className="text-gray-300">—</span>;
          const temp = document.createElement('div');
          temp.innerHTML = val;
          const plainText = temp.textContent || temp.innerText || '';
          const truncated =
            plainText.length > 80 ? plainText.slice(0, 80) + '...' : plainText;
          return (
            <div className="max-w-xs">
              <span
                className="text-gray-600 text-xs leading-relaxed line-clamp-2"
                title={plainText}
              >
                {truncated}
              </span>
            </div>
          );
        },
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

  const hasSelection = selectedIds.length > 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <SEO
        title="Cây ngành sản phẩm"
        description="Quản lý cây ngành sản phẩm"
        url="/main-trees"
      />
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
                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-green-50 text-green-700 rounded hover:bg-green-100"
                >
                  <FiEye size={14} />
                  Hiện ({selectedIds.length})
                </button>
                <button
                  onClick={() => handleToggleActiveSelected(false)}
                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-amber-50 text-amber-700 rounded hover:bg-amber-100"
                >
                  <FiEyeOff size={14} />
                  Ẩn ({selectedIds.length})
                </button>
                <button
                  onClick={handleDeleteSelected}
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
                onChange={(e) => setFilter({ showInactive: e.target.checked })}
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
                placeholder="Tìm kiếm..."
                value={search}
                onChange={(e) => setFilter({ search: e.target.value })}
                className="input-field pl-8 pr-8 text-xs py-1.5 w-52"
              />
              {search && (
                <button
                  onClick={() => setFilter({ search: '' })}
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
          {mainTrees.loading ? (
            <Skeleton.List rows={6} />
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
              <span className="text-3xl">🌳</span>
              <p className="text-sm">
                {search
                  ? 'Không tìm thấy ngành hàng phù hợp'
                  : 'Chưa có ngành hàng nào'}
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
              onSelectChange={(ids) =>
                useAdminStore.getState().selection.setSelected('mainTrees', ids)
              }
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MainTreeList;
