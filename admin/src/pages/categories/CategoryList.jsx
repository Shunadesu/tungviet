import { useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX } from 'react-icons/fi';
import Header from '../../components/Header';
import SEO from '../../components/SEO';
import DataTable from '../../components/DataTable';
import {
  useAdminStore,
  useAdminStoreEntity,
  useEntitySelection,
  useNotification,
} from '../../hooks/useAdminStore';

const CategoryList = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const categories = useAdminStoreEntity('categories');
  const mainTrees = useAdminStoreEntity('mainTrees');
  const products = useAdminStoreEntity('products');
  const ui = useAdminStore((s) => s.ui);
  const openConfirm = useAdminStore((s) => s.ui.openConfirm);

  const { selectedIds, clearSelection } = useEntitySelection('categories');

  const filters = ui.filters.categories || {};
  const search = filters.search || '';
  const showInactive = Boolean(filters.showInactive);
  const filterMainTree = filters.mainTree || '';

  const setFilter = useCallback(
    (partial) => ui.setFilter('categories', partial),
    [ui]
  );

  const loadedRef = useRef(false);
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    categories.fetchAll();
    mainTrees.fetchAll();
    products.fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // fetchAll methods are stable — do NOT add entity objects to deps

  const prevMainTree = useRef(filterMainTree);
  useEffect(() => {
    if (filterMainTree !== prevMainTree.current) {
      prevMainTree.current = filterMainTree;
      categories.invalidateList();
      const params = filterMainTree ? { mainTree: filterMainTree } : undefined;
      categories.fetchAll(params);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMainTree]); // categories.invalidateList/fetchAll are stable

  const mainTreeById = useMemo(() => {
    const map = new Map();
    for (const t of mainTrees.allItems) map.set(String(t._id), t);
    return map;
  }, [mainTrees.allItems]);

  const productsByCategory = useMemo(() => {
    const map = new Map();
    for (const p of products.allItems) {
      const lines = Array.isArray(p.productLines) ? p.productLines : [];
      for (const lineId of lines) {
        const key = String(typeof lineId === 'object' ? lineId._id : lineId);
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(p);
      }
    }
    return map;
  }, [products.allItems]);

  const filtered = useMemo(() => {
    let list = [...categories.allItems].sort(
      (a, b) =>
        (a.order ?? 0) - (b.order ?? 0) ||
        (a.name || '').localeCompare(b.name || '')
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
  }, [categories.allItems, search, showInactive]);

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
        header: 'Hình ảnh',
        accessor: 'imageUrl',
        render: (val) =>
          val ? (
            <img
              src={val}
              alt="Category"
              className="w-12 h-12 rounded object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
              N/A
            </div>
          ),
      },
      {
        header: 'Tên',
        accessor: 'name',
        render: (val, row) => (
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
        ),
      },
      {
        header: 'Ngành hàng',
        accessor: 'mainTree',
        render: (val) => {
          const mt =
            typeof val === 'object' ? val : mainTreeById.get(String(val));
          return (
            <span className="text-xs text-gray-500">{mt ? mt.name : '—'}</span>
          );
        },
      },
      {
        header: 'Sản phẩm',
        accessor: '_id',
        render: (val) => {
          const prods = productsByCategory.get(String(val)) || [];
          if (prods.length === 0) {
            return <span className="text-xs text-gray-400">—</span>;
          }
          return (
            <div className="flex flex-col gap-1">
              {prods.map((p) => (
                <button
                  key={p._id}
                  onClick={() => navigate(`/products/${p._id}/edit`)}
                  className="text-left text-xs text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {p.name}{' '}
                  {p.productCode ? `(${p.productCode})` : ''}
                </button>
              ))}
            </div>
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
    [mainTreeById, productsByCategory, navigate]
  );

  const handleDelete = useCallback(
    (id) => {
      openConfirm({
        title: 'Xóa product line',
        message: 'Bạn có chắc muốn xóa product line này?',
        confirmText: 'Xóa',
        confirmStyle: 'danger',
        onConfirm: async () => {
          try {
            await categories.remove(id);
            addNotification('Xóa thành công');
          } catch (err) {
            addNotification(
              err.response?.data?.message || 'Có lỗi xảy ra',
              'error'
            );
          }
        },
      });
    },
    [openConfirm, categories, addNotification]
  );

  const handleDeleteSelected = useCallback(async () => {
    if (selectedIds.length === 0) return;
    openConfirm({
      title: 'Xóa hàng loạt',
      message: `Xóa ${selectedIds.length} mục đã chọn? Hành động này không thể hoàn tác.`,
      confirmText: 'Xóa',
      confirmStyle: 'danger',
      onConfirm: async () => {
        try {
          await categories.removeMany(selectedIds);
          addNotification(`Đã xóa ${selectedIds.length} mục`);
          clearSelection();
        } catch (err) {
          addNotification(
            err.response?.data?.message || 'Có lỗi xảy ra khi xóa nhiều',
            'error'
          );
        }
      },
    });
  }, [selectedIds, openConfirm, categories, addNotification, clearSelection]);

  const renderActions = (row) => {
    const mainTreeId =
      typeof row.mainTree === 'object' ? row.mainTree?._id : row.mainTree;
    const queryParams = new URLSearchParams();
    queryParams.set('productLine', row._id);
    if (mainTreeId) queryParams.set('industry', mainTreeId);

    return (
      <>
        <button
          onClick={() => navigate(`/products/new?${queryParams.toString()}`)}
          className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
          title="Tạo sản phẩm"
        >
          <FiPlus size={14} />
        </button>
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
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <SEO
        title="Product line"
        description="Quản lý product line"
        url="/categories"
      />
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
              onChange={(e) => setFilter({ mainTree: e.target.value })}
              className="input-field text-xs py-1.5 w-44"
            >
              <option value="">Tất cả ngành hàng</option>
              {mainTrees.allItems.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
            {selectedIds.length > 0 && (
              <button
                onClick={handleDeleteSelected}
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
                placeholder="Tìm tên, mô tả..."
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
              onClick={() => navigate('/categories/new')}
              className="btn-primary flex items-center gap-1 text-xs"
            >
              <FiPlus size={14} />
              Thêm product line
            </button>
          </div>
        </div>

        <div className="card">
          {categories.loading ? (
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
              onSelectChange={(ids) =>
                useAdminStore.getState().selection.setSelected('categories', ids)
              }
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CategoryList;
