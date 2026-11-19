import { useEffect, useMemo, useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiX,
  FiFilter,
  FiBox,
  FiLayers,
  FiEye,
  FiEyeOff,
  FiPackage,
} from 'react-icons/fi';
import Header from '../../components/Header';
import SEO from '../../components/SEO';
import DataTable from '../../components/DataTable';
import RichText from '../../components/RichText';
import StatCard from '../../components/StatCard';
import Skeleton from '../../components/Skeleton';
import Pagination from '../../components/Pagination';
import BulkActionBar from '../../components/BulkActionBar';
import adminApi from '../../api/adminApi';
import useDebounce from '../../hooks/useDebounce';
import {
  useAdminStore,
  useAdminStoreEntity,
  useEntitySelection,
  useNotification,
} from '../../hooks/useAdminStore';

const PAGE_SIZE = 20;

const SORT_OPTIONS = [
  { value: 'order_asc', label: 'Thứ tự hiển thị' },
  { value: 'name_asc', label: 'Tên A → Z' },
  { value: 'name_desc', label: 'Tên Z → A' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'sku_desc', label: 'Nhiều SKU nhất' },
];

const CategoryList = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const categories = useAdminStoreEntity('categories');
  const mainTrees = useAdminStoreEntity('mainTrees');
  const ui = useAdminStore((s) => s.ui);
  const openConfirm = useAdminStore((s) => s.ui.openConfirm);

  const { selectedIds, clearSelection } = useEntitySelection('categories');

  // ── Bộ lọc (lưu trong store để giữ giữa các lần vào trang) ─────
  const filters = ui.filters.categories || {};
  const search = filters.search || '';
  const filterMainTree = filters.mainTree || '';
  const filterStatus = filters.status || 'all';
  const filterHasProducts = filters.hasProducts || '';
  const filterSort = filters.sort || 'order_asc';
  const page = filters.page || 1;

  /**
   * Cập nhật bộ lọc. Mọi thay đổi tiêu chí lọc đều đưa về trang 1.
   * Việc gộp `page: 1` vào cùng một lần setState giúp chỉ phát sinh
   * MỘT lần tải dữ liệu (không phải hai: một lần với trang cũ, một lần với trang 1).
   */
  const applyFilter = useCallback(
    (partial) => {
      ui.setFilter('categories', { ...partial, page: 1 });
      clearSelection();
    },
    [ui, clearSelection]
  );

  // Ô tìm kiếm có debounce để không gọi API mỗi ký tự gõ
  const [searchInput, setSearchInput] = useState(() => search);
  const debouncedSearch = useDebounce(searchInput, 300);

  // Đẩy từ khoá đã debounce vào store (kèm quay về trang 1)
  const prevDebouncedRef = useRef(debouncedSearch);
  useEffect(() => {
    if (prevDebouncedRef.current === debouncedSearch) return;
    prevDebouncedRef.current = debouncedSearch;
    applyFilter({ search: debouncedSearch.trim() });
  }, [debouncedSearch, applyFilter]);

  // ── Số liệu tổng quan ─────────────────────────────────────────
  const [stats, setStats] = useState(null);
  const loadStats = useCallback(async () => {
    try {
      const res = await adminApi.getCategoryStats();
      setStats(res.data?.data || null);
    } catch {
      // Bỏ qua lỗi thống kê — không chặn việc hiển thị danh sách
    }
  }, []);

  // ── Tải dữ liệu ───────────────────────────────────────────────
  const loadedRef = useRef(false);
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    mainTrees.fetchAll();
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // fetchAll / loadStats là hàm ổn định — không thêm vào deps

  // Tham số gửi lên server
  const requestParams = useMemo(() => {
    const params = {
      page,
      limit: PAGE_SIZE,
      sort: filterSort,
      status: filterStatus,
    };
    if (search.trim()) params.search = search.trim();
    if (filterMainTree) params.mainTree = filterMainTree;
    if (filterHasProducts) params.hasProducts = filterHasProducts;
    return params;
  }, [page, filterSort, filterStatus, search, filterMainTree, filterHasProducts]);

  // Mọi thay đổi tham số đều gọi lại server
  const paramsKey = JSON.stringify(requestParams);
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        await categories.fetchPage(JSON.parse(paramsKey));
      } catch (err) {
        if (cancelled) return;
        addNotification(
          err.response?.data?.message || 'Có lỗi khi tải danh mục',
          'error'
        );
      }
    };
    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  const items = categories.allItems;
  const pagination = categories.pagination || {};
  const totalItems = pagination.total ?? items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  // Nếu trang hiện tại vượt quá số trang (ví dụ sau khi xoá bớt dữ liệu) → kéo về trang cuối
  useEffect(() => {
    if (page > totalPages && totalItems > 0) {
      ui.setFilter('categories', { page: totalPages });
    }
  }, [page, totalPages, totalItems, ui]);

  // ── Danh sách chip đang lọc ───────────────────────────────────
  const mainTreeById = useMemo(() => {
    const map = new Map();
    for (const t of mainTrees.allItems) map.set(String(t._id), t);
    return map;
  }, [mainTrees.allItems]);

  const activeChips = useMemo(() => {
    const chips = [];
    if (search.trim()) {
      chips.push({
        key: 'search',
        label: `Tìm: "${search.trim()}"`,
        onRemove: () => {
          setSearchInput('');
          applyFilter({ search: '' });
        },
      });
    }
    if (filterMainTree) {
      const mt = mainTreeById.get(String(filterMainTree));
      chips.push({
        key: 'mainTree',
        label: `Ngành hàng: ${mt?.name || '—'}`,
        onRemove: () => applyFilter({ mainTree: '' }),
      });
    }
    if (filterStatus !== 'all') {
      chips.push({
        key: 'status',
        label: filterStatus === 'active' ? 'Đang hoạt động' : 'Tạm ẩn',
        onRemove: () => applyFilter({ status: 'all' }),
      });
    }
    if (filterHasProducts) {
      chips.push({
        key: 'hasProducts',
        label: filterHasProducts === '1' ? 'Có sản phẩm' : 'Chưa có sản phẩm',
        onRemove: () => applyFilter({ hasProducts: '' }),
      });
    }
    if (filterSort !== 'order_asc') {
      const opt = SORT_OPTIONS.find((o) => o.value === filterSort);
      chips.push({
        key: 'sort',
        label: `Sắp xếp: ${opt?.label || filterSort}`,
        onRemove: () => applyFilter({ sort: 'order_asc' }),
      });
    }
    return chips;
  }, [
    search,
    filterMainTree,
    filterStatus,
    filterHasProducts,
    filterSort,
    mainTreeById,
    applyFilter,
  ]);

  const hasFilters = activeChips.length > 0;

  const handleResetFilters = useCallback(() => {
    setSearchInput('');
    prevDebouncedRef.current = '';
    ui.clearFilter('categories');
    clearSelection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui, clearSelection]);

  // ── Điều hướng tới trang sản phẩm theo danh mục ───────────────
  const goToProducts = useCallback(
    (categoryId) => {
      navigate(`/products?productLine=${categoryId}`);
    },
    [navigate]
  );

  const columns = useMemo(
    () => [
      {
        header: 'STT',
        accessor: '_id',
        headerClassName: 'w-10',
        className: 'w-10',
        render: (_, row, idx) => (
          <span className="text-gray-400 font-mono text-xs">
            {(currentPage - 1) * PAGE_SIZE + idx + 1}
          </span>
        ),
      },
      {
        header: 'Hình ảnh',
        accessor: 'imageUrl',
        headerClassName: 'w-16',
        className: 'w-16',
        render: (val) =>
          val ? (
            <img
              src={val}
              alt=""
              className="w-10 h-10 rounded object-cover border border-gray-200"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-10 h-10 rounded bg-gray-50 flex items-center justify-center text-gray-300">
              <FiBox size={16} />
            </div>
          ),
      },
      {
        header: 'Tên',
        accessor: 'name',
        render: (val, row) => (
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => navigate(`/categories/${row._id}/edit`)}
              className="text-left font-medium text-gray-800 hover:text-primary hover:underline"
            >
              {val}
            </button>
            {row.nameEn && (
              <div className="text-[10px] text-gray-400">{row.nameEn}</div>
            )}
          </div>
        ),
      },
      {
        header: 'Slug',
        accessor: 'slug',
        render: (val) => (
          <span className="text-[11px] text-gray-400 font-mono">
            {val || '—'}
          </span>
        ),
      },
      {
        header: 'Ngành hàng',
        accessor: 'mainTree',
        render: (val) => {
          const mt =
            typeof val === 'object' && val !== null
              ? val
              : mainTreeById.get(String(val));
          return (
            <span className="text-xs text-gray-600">{mt ? mt.name : '—'}</span>
          );
        },
      },
      {
        header: 'Sản phẩm',
        accessor: 'skuCount',
        headerClassName: 'text-center',
        className: 'text-center',
        render: (val, row) => {
          const count = Number(val) || 0;
          if (count === 0) {
            return (
              <span className="inline-flex items-center justify-center min-w-[34px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 text-xs font-medium">
                0
              </span>
            );
          }
          return (
            <button
              type="button"
              onClick={() => goToProducts(row._id)}
              title={`Xem ${count} sản phẩm thuộc "${row.name}"`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-50 text-primary text-xs font-semibold hover:bg-primary hover:text-white transition-colors"
            >
              {count}
              <FiPackage size={11} />
            </button>
          );
        },
      },
      {
        header: 'Mô tả',
        accessor: 'description',
        render: (val) => (
          <RichText html={val} clamp={3} className="max-w-[220px]" />
        ),
      },
      {
        header: 'Trạng thái',
        accessor: 'isActive',
        headerClassName: 'text-center',
        className: 'text-center',
        render: (val) =>
          val === false ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[10px] font-medium">
              <FiEyeOff size={10} />
              Tạm ẩn
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-[10px] font-medium">
              <FiEye size={10} />
              Hoạt động
            </span>
          ),
      },
      {
        header: 'Thứ tự',
        accessor: 'order',
        headerClassName: 'text-center w-16',
        className: 'text-center w-16',
        render: (val) => (
          <span className="text-xs text-gray-500">{val ?? 0}</span>
        ),
      },
    ],
    [mainTreeById, goToProducts, navigate, currentPage]
  );

  /** Tải lại danh sách sau khi thay đổi dữ liệu (xoá) */
  const refresh = useCallback(() => {
    loadStats();
    categories.fetchPage(JSON.parse(paramsKey)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadStats, categories, paramsKey]);

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
            refresh();
          } catch (err) {
            addNotification(
              err.response?.data?.message || 'Có lỗi xảy ra',
              'error'
            );
          }
        },
      });
    },
    [openConfirm, categories, addNotification, refresh]
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
          refresh();
        } catch (err) {
          addNotification(
            err.response?.data?.message || 'Có lỗi xảy ra khi xóa nhiều',
            'error'
          );
        }
      },
    });
  }, [selectedIds, openConfirm, categories, addNotification, clearSelection, refresh]);

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
          title="Tạo sản phẩm trong danh mục này"
        >
          <FiPlus size={14} />
        </button>
        <button
          onClick={() => goToProducts(row._id)}
          className="p-1.5 text-primary hover:bg-primary-50 rounded transition-colors"
          title="Xem sản phẩm thuộc danh mục"
        >
          <FiLayers size={14} />
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <SEO
        title="Product line"
        description="Quản lý Danh mục Sản phẩm"
        url="/categories"
      />
      <Header title="Quản lý Danh mục Sản phẩm" />

      <div className="p-4 space-y-3">
        {/* ── Thẻ thống kê ─────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <StatCard
            icon={<FiLayers size={18} />}
            label="Tổng danh mục"
            value={stats?.total ?? '—'}
            color="primary"
          />
          <StatCard
            icon={<FiEye size={18} />}
            label="Đang hoạt động"
            value={stats?.active ?? '—'}
            color="green"
            delay={0.05}
          />
          <StatCard
            icon={<FiEyeOff size={18} />}
            label="Tạm ẩn"
            value={stats?.inactive ?? '—'}
            color="red"
            delay={0.1}
          />
          <StatCard
            icon={<FiPackage size={18} />}
            label="Tổng SKU"
            value={stats?.totalSku ?? '—'}
            color="blue"
            delay={0.15}
          />
        </div>

        {/* ── Thanh bộ lọc ───────────────────────────────────── */}
        <div className="card p-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <FiSearch
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Tìm tên, slug, mô tả..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="input-field pl-8 pr-8 text-xs py-1.5"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  title="Xoá tìm kiếm"
                >
                  <FiX size={12} />
                </button>
              )}
            </div>

            <select
              value={filterMainTree}
              onChange={(e) => applyFilter({ mainTree: e.target.value })}
              className="input-field text-xs py-1.5 w-44"
              title="Lọc theo ngành hàng"
            >
              <option value="">Tất cả ngành hàng</option>
              {mainTrees.allItems.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => applyFilter({ status: e.target.value })}
              className="input-field text-xs py-1.5 w-36"
              title="Lọc theo trạng thái"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Tạm ẩn</option>
            </select>

            <select
              value={filterHasProducts}
              onChange={(e) => applyFilter({ hasProducts: e.target.value })}
              className="input-field text-xs py-1.5 w-40"
              title="Lọc theo số sản phẩm"
            >
              <option value="">Tất cả (có/chưa có SP)</option>
              <option value="1">Có sản phẩm</option>
              <option value="0">Chưa có sản phẩm</option>
            </select>

            <select
              value={filterSort}
              onChange={(e) => applyFilter({ sort: e.target.value })}
              className="input-field text-xs py-1.5 w-44"
              title="Sắp xếp"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            {hasFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <FiFilter size={12} />
                Xoá lọc
              </button>
            )}

            <button
              onClick={() => navigate('/categories/new')}
              className="btn-primary flex items-center gap-1 text-xs ml-auto"
            >
              <FiPlus size={14} />
              Thêm product line
            </button>
          </div>

          {/* Chip các filter đang áp dụng */}
          {activeChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-2 border-t border-gray-100">
              <span className="text-[11px] text-gray-400">Đang lọc:</span>
              {activeChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.onRemove}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-50 text-primary text-[11px] font-medium hover:bg-primary hover:text-white transition-colors"
                >
                  {chip.label}
                  <FiX size={10} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Thanh bulk action ──────────────────────────────── */}
        <BulkActionBar
          selectedCount={selectedIds.length}
          entityName="product line"
          onClear={clearSelection}
          onDelete={handleDeleteSelected}
        />

        {/* ── Bảng ──────────────────────────────────────────── */}
        <div className="card">
          <div className="flex items-center justify-between px-2 pt-1 pb-2 flex-wrap gap-2">
            <h2 className="text-sm font-semibold text-gray-700">
              Danh sách product line
              <span className="ml-1.5 text-gray-400 font-normal">
                ({totalItems} danh mục)
              </span>
            </h2>
            {totalPages > 1 && (
              <span className="text-[11px] text-gray-400">
                Trang {currentPage} / {totalPages}
              </span>
            )}
          </div>

          {categories.loading ? (
            <Skeleton.List rows={6} />
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
              <span className="text-3xl">📂</span>
              <p className="text-sm">
                {hasFilters
                  ? 'Không tìm thấy danh mục phù hợp'
                  : 'Chưa có product line nào'}
              </p>
              {hasFilters ? (
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-primary hover:underline"
                >
                  Xoá bộ lọc
                </button>
              ) : (
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
              data={items}
              actions={renderActions}
              selectable
              selected={selectedIds}
              onSelectChange={(ids) =>
                useAdminStore
                  .getState()
                  .selection.setSelected('categories', ids)
              }
            />
          )}

          {totalPages > 1 && (
            <div className="px-2 pb-3 pt-2 border-t border-gray-100">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => {
                  ui.setFilter('categories', { page: p });
                  clearSelection();
                }}
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CategoryList;
