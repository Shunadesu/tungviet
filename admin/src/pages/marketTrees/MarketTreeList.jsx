import React, { useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiX,
  FiFolder,
  FiChevronDown,
  FiChevronUp,
  FiCpu,
  FiPackage,
  FiImage,
} from 'react-icons/fi';
import Header from '../../components/Header';
import SEO from '../../components/SEO';
import BulkActionBar from '../../components/BulkActionBar';
import {
  useAdminStore,
  useAdminStoreEntity,
  useEntitySelection,
  useNotification,
} from '../../hooks/useAdminStore';

const stripHtml = (html) =>
  (html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const truncate = (s, n = 280) =>
  s.length > n ? `${s.slice(0, n).trim()}…` : s;

const SubDocRow = ({ index, item, kind }) => {
  const isApp = kind === 'applications';
  const Icon = isApp ? FiPackage : FiCpu;
  const active = item.isActive !== false;
  return (
    <div className="flex items-start gap-2 p-2 bg-gray-50/60 border border-gray-100 rounded">
      <div className="flex-shrink-0 mt-0.5">
        <Icon size={12} className="text-gray-500" />
      </div>
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
          <FiImage size={12} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium text-gray-800 truncate">
          #{index + 1} {item.title || '(Chưa đặt tên)'}
        </div>
        {item.titleEn && (
          <div className="text-[10px] text-gray-400 truncate">{item.titleEn}</div>
        )}
        {item.description && (
          <div className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">
            {truncate(stripHtml(item.description), 180)}
          </div>
        )}
      </div>
      <div className="flex-shrink-0 text-right">
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded ${
            active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-500'
          }`}
        >
          {active ? 'Hiển thị' : 'Ẩn'}
        </span>
        {isApp && (
          <div className="text-[10px] text-gray-400 mt-1">
            {(item.productEntries || []).length} SP
          </div>
        )}
      </div>
    </div>
  );
};

const ProductEntryItem = ({ entry, index, product }) => {
  const appIdx = entry.applicationIndex;
  const appLabel =
    Number.isFinite(appIdx) && appIdx >= 0
      ? `Ứng dụng #${appIdx + 1}${
          product?.applications?.[appIdx]?.title
            ? ` — ${product.applications[appIdx].title}`
            : ''
        }`
      : '— chưa gán ứng dụng —';
  return (
    <div className="flex items-center gap-2 p-1.5 bg-white border border-gray-100 rounded">
      {product?.imageUrl ? (
        <img
          src={product.imageUrl}
          alt=""
          className="w-7 h-7 rounded object-cover border flex-shrink-0"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <div className="w-7 h-7 rounded bg-gray-100 text-gray-400 flex items-center justify-center flex-shrink-0">
          <FiPackage size={11} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-medium text-gray-800 truncate">
          {product?.name || `Sản phẩm #${index + 1}`}
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
          {product?.productCode && (
            <span className="font-mono">{product.productCode}</span>
          )}
          <span className="text-gray-300">•</span>
          <span className="truncate">{appLabel}</span>
        </div>
      </div>
    </div>
  );
};

const CountBadge = ({ count, color = 'gray' }) => {
  if (!count || count === 0) {
    return <span className="text-gray-300 text-[10px]">—</span>;
  }
  const colorMap = {
    purple: 'bg-purple-50 text-purple-700',
    amber: 'bg-amber-50 text-amber-700',
    blue: 'bg-blue-50 text-blue-700',
    gray: 'bg-gray-50 text-gray-500',
  };
  return (
    <span
      className={`inline-block text-[10px] px-1.5 py-0.5 rounded font-semibold ${
        colorMap[color] || colorMap.gray
      }`}
    >
      {count}
    </span>
  );
};

const ExpandedDetail = ({ node, productMap }) => {
  const technologies = Array.isArray(node.technologies) ? node.technologies : [];
  const applications = Array.isArray(node.applications) ? node.applications : [];
  const rootProducts = Array.isArray(node.productEntries)
    ? node.productEntries
    : [];
  const descVi = truncate(stripHtml(node.description), 280);
  const descEn = truncate(stripHtml(node.descriptionEn), 280);
  const introVi = truncate(stripHtml(node.introductions?.vi), 280);
  const introEn = truncate(stripHtml(node.introductions?.en), 280);

  return (
    <div className="bg-gray-50/50 border-t border-gray-200 px-4 py-4">
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Thông tin cơ bản
            </h4>
            <dl className="space-y-1.5 text-[11px]">
              <div>
                <dt className="text-gray-500">Mô tả (VI)</dt>
                <dd className="text-gray-700">
                  {descVi || <span className="italic text-gray-400">—</span>}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Mô tả (EN)</dt>
                <dd className="text-gray-700">
                  {descEn || <span className="italic text-gray-400">—</span>}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Giới thiệu (VI)</dt>
                <dd className="text-gray-700">
                  {introVi || <span className="italic text-gray-400">—</span>}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Giới thiệu (EN)</dt>
                <dd className="text-gray-700">
                  {introEn || <span className="italic text-gray-400">—</span>}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
              <FiCpu size={11} />
              Công nghệ ({technologies.length})
            </h4>
            {technologies.length === 0 ? (
              <p className="text-[11px] text-gray-400 italic">Chưa có công nghệ nào.</p>
            ) : (
              <div className="space-y-1.5">
                {technologies.map((item, idx) => (
                  <SubDocRow
                    key={`tech-${idx}`}
                    index={idx}
                    item={item}
                    kind="technologies"
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
              <FiPackage size={11} />
              Sản phẩm cấp cây ngành ({rootProducts.length})
            </h4>
            {rootProducts.length === 0 ? (
              <p className="text-[11px] text-gray-400 italic">
                Chưa chọn sản phẩm nào cho cây ngành.
              </p>
            ) : (
              <div className="space-y-1">
                {rootProducts.map((entry, idx) => {
                  const productId =
                    typeof entry.productId === 'object'
                      ? entry.productId?._id
                      : entry.productId;
                  const product = productMap.get(String(productId));
                  return (
                    <div
                      key={`root-prod-${idx}`}
                      className="flex items-center gap-2 p-1.5 bg-white border border-gray-100 rounded"
                    >
                      {product?.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt=""
                          className="w-7 h-7 rounded object-cover border flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-7 h-7 rounded bg-gray-100 text-gray-400 flex items-center justify-center flex-shrink-0">
                          <FiPackage size={11} />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-medium text-gray-800 truncate">
                          {product?.name || `Sản phẩm #${idx + 1}`}
                        </div>
                        {product?.productCode && (
                          <div className="text-[10px] text-gray-400 font-mono">
                            {product.productCode}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
              <FiPackage size={11} />
              Ứng dụng ({applications.length})
            </h4>
            {applications.length === 0 ? (
              <p className="text-[11px] text-gray-400 italic">Chưa có ứng dụng nào.</p>
            ) : (
              <div className="space-y-2">
                {applications.map((item, idx) => {
                  const entries = Array.isArray(item.productEntries)
                    ? item.productEntries
                    : [];
                  return (
                    <div key={`app-${idx}`} className="space-y-1.5">
                      <SubDocRow index={idx} item={item} kind="applications" />
                      {entries.length > 0 && (
                        <div className="ml-3 space-y-1">
                          {entries.map((entry, eIdx) => {
                            const productId =
                              typeof entry.productId === 'object'
                                ? entry.productId?._id
                                : entry.productId;
                            return (
                              <ProductEntryItem
                                key={`entry-${idx}-${eIdx}`}
                                index={eIdx}
                                entry={entry}
                                product={productMap.get(String(productId))}
                              />
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MarketTreeList = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const marketTrees = useAdminStoreEntity('marketTrees');
  const products = useAdminStoreEntity('products');
  const ui = useAdminStore((s) => s.ui);
  const openConfirm = useAdminStore((s) => s.ui.openConfirm);

  const { selectedIds, clearSelection } = useEntitySelection('marketTrees');

  const filters = ui.filters.marketTrees || {};
  const search = filters.search || '';

  const setFilter = useCallback(
    (partial) => ui.setFilter('marketTrees', partial),
    [ui]
  );

  const [expandedIds, setExpandedIds] = React.useState(() => new Set());

  // Load data on mount
  const loadedRef = useRef(false);
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    marketTrees.fetchAll();
    products.fetchAll({ limit: 200 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // marketTrees.fetchAll, products.fetchAll are stable — do NOT add them to deps

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return marketTrees.allItems;
    return marketTrees.allItems.filter((n) => {
      const inTech = (n.technologies || []).some(
        (t) =>
          (t.title || '').toLowerCase().includes(q) ||
          (t.titleEn || '').toLowerCase().includes(q)
      );
      const inApp = (n.applications || []).some(
        (a) =>
          (a.title || '').toLowerCase().includes(q) ||
          (a.titleEn || '').toLowerCase().includes(q)
      );
      const inDesc =
        stripHtml(n.description).toLowerCase().includes(q) ||
        stripHtml(n.descriptionEn).toLowerCase().includes(q);
      return (
        (n.title || '').toLowerCase().includes(q) ||
        (n.titleEn || '').toLowerCase().includes(q) ||
        inDesc ||
        inTech ||
        inApp
      );
    });
  }, [marketTrees.allItems, search]);

  const productMap = useMemo(() => {
    const map = new Map();
    for (const p of products.allItems) map.set(String(p._id), p);
    return map;
  }, [products.allItems]);

  const toggleExpand = useCallback((id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleDelete = useCallback(
    (id) => {
      openConfirm({
        title: 'Xóa cây ngành thị trường',
        message: 'Bạn có chắc muốn xóa cây ngành này?',
        confirmText: 'Xóa',
        confirmStyle: 'danger',
        onConfirm: async () => {
          try {
            await marketTrees.remove(id);
            addNotification('Xóa thành công');
            setExpandedIds((prev) => {
              const next = new Set(prev);
              next.delete(id);
              return next;
            });
          } catch (err) {
            addNotification(
              err.response?.data?.message || 'Có lỗi xảy ra',
              'error'
            );
          }
        },
      });
    },
    [openConfirm, marketTrees, addNotification]
  );

  const executeBulkDelete = useCallback(async () => {
    const ids = selectedIds;
    if (ids.length === 0) return;
    try {
      await marketTrees.update(ids[0], { _bulkDelete: ids });
      addNotification(`Đã xóa ${ids.length} cây ngành`);
      clearSelection();
      marketTrees.invalidateList();
      marketTrees.fetchAll();
    } catch (err) {
      addNotification(
        err.response?.data?.message || 'Có lỗi xảy ra',
        'error'
      );
    }
  }, [selectedIds, marketTrees, addNotification, clearSelection]);

  const handleBulkDelete = useCallback(() => {
    openConfirm({
      title: 'Xóa hàng loạt',
      message: `Bạn có chắc muốn xóa ${selectedIds.length} cây ngành đã chọn? Hành động này không thể hoàn tác.`,
      confirmText: 'Xóa',
      confirmStyle: 'danger',
      onConfirm: executeBulkDelete,
    });
  }, [selectedIds, openConfirm, executeBulkDelete]);

  const filteredIds = filtered.map((n) => String(n._id));
  const allFilteredSelected =
    filteredIds.length > 0 &&
    filteredIds.every((id) => selectedIds.includes(id));
  const someFilteredSelected =
    filteredIds.some((id) => selectedIds.includes(id)) &&
    !allFilteredSelected;

  const toggleSelectAll = useCallback(() => {
    if (allFilteredSelected) {
      clearSelection();
    } else {
      useAdminStore
        .getState()
        .selection.setSelected(
          'marketTrees',
          filtered.map((n) => n._id)
        );
    }
  }, [allFilteredSelected, clearSelection, filtered]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <SEO
        title="Cây ngành thị trường"
        description="Quản lý cây ngành thị trường"
        url="/market-trees"
      />
      <Header title="Quản lý cây ngành thị trường" />

      <div className="p-4">
        <BulkActionBar
          selectedCount={selectedIds.length}
          onClear={clearSelection}
          onDelete={handleBulkDelete}
          entityName="cây ngành"
        />
        <div className="flex flex-wrap gap-2 items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-gray-700">
              Cây ngành ({filtered.length})
            </h2>
            {expandedIds.size > 0 && (
              <button
                onClick={() => setExpandedIds(new Set())}
                className="text-[10px] text-gray-500 hover:text-gray-700 underline"
              >
                Thu gọn tất cả
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <FiSearch
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Tìm kiếm tiêu đề, công nghệ, ứng dụng..."
                value={search}
                onChange={(e) => setFilter({ search: e.target.value })}
                className="input-field pl-8 pr-8 text-xs py-1.5 w-64"
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
              onClick={() => navigate('/market-trees/new')}
              className="btn-primary flex items-center gap-1 text-xs"
            >
              <FiPlus size={14} />
              Thêm cây ngành
            </button>
          </div>
        </div>

        <div className="card overflow-hidden p-0">
          {marketTrees.loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
              <span className="text-3xl">🌿</span>
              <p className="text-sm">Chưa có cây ngành nào.</p>
              <button
                onClick={() => navigate('/market-trees/new')}
                className="text-xs text-primary hover:underline"
              >
                Thêm cây ngành đầu tiên
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wide">
                    <th className="px-2 py-2 w-8">
                      <input
                        type="checkbox"
                        checked={allFilteredSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = someFilteredSelected;
                        }}
                        onChange={toggleSelectAll}
                        disabled={filtered.length === 0}
                        className="rounded w-3.5 h-3.5 cursor-pointer"
                        aria-label="Chọn tất cả"
                      />
                    </th>
                    <th className="px-2 py-2 w-8"></th>
                    <th className="px-2 py-2 w-10">#</th>
                    <th className="px-2 py-2 w-14">Ảnh</th>
                    <th className="px-2 py-2 min-w-[220px]">Tiêu đề</th>
                    <th className="px-2 py-2 text-center w-20">
                      <span className="inline-flex items-center gap-1 normal-case">
                        <FiCpu size={11} /> Công nghệ
                      </span>
                    </th>
                    <th className="px-2 py-2 text-center w-20">
                      <span className="inline-flex items-center gap-1 normal-case">
                        <FiPackage size={11} /> Ứng dụng
                      </span>
                    </th>
                    <th className="px-2 py-2 text-center w-14">SP</th>
                    <th className="px-2 py-2 text-center w-16">Nổi bật</th>
                    <th className="px-2 py-2 text-center w-20">Hiển thị</th>
                    <th className="px-2 py-2 text-right w-24">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((node) => {
                    const isOpen = expandedIds.has(node._id);
                    const techCount = (node.technologies || []).length;
                    const appCount = (node.applications || []).length;
                    const rootProductCount = Array.isArray(node.productEntries)
                      ? node.productEntries.length
                      : 0;
                    const appProductCount = (
                      node.applications || []
    ).reduce(
                      (sum, a) =>
                        sum +
                        (Array.isArray(a.productEntries) ? a.productEntries.length : 0),
                      0
                    );
                    const productCount = rootProductCount + appProductCount;
                    return (
                      <React.Fragment key={node._id}>
                        <tr
                          className={`border-b border-gray-100 hover:bg-blue-50/30 transition-colors ${
                            selectedIds.includes(node._id)
                              ? 'bg-blue-50/60'
                              : isOpen
                              ? 'bg-blue-50/40'
                              : ''
                          }`}
                        >
                          <td className="px-2 py-2 align-middle">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(node._id)}
                              onChange={() =>
                                useAdminStore.getState().selection.toggleOne(
                                  'marketTrees',
                                  node._id
                                )
                              }
                              className="rounded w-3.5 h-3.5 cursor-pointer"
                              aria-label={`Chọn ${node.title || node._id}`}
                            />
                          </td>
                          <td className="px-2 py-2 align-middle">
                            <button
                              onClick={() => toggleExpand(node._id)}
                              className="p-1 hover:bg-blue-100 text-blue-600 rounded transition-transform"
                              title={isOpen ? 'Thu gọn' : 'Mở rộng'}
                            >
                              {isOpen ? (
                                <FiChevronUp size={14} />
                              ) : (
                                <FiChevronDown size={14} />
                              )}
                            </button>
                          </td>
                          <td className="px-2 py-2 align-middle text-gray-400 font-mono text-[10px]">
                            {node.order ?? 0}
                          </td>
                          <td className="px-2 py-2 align-middle">
                            {node.imageUrl ? (
                              <img
                                src={node.imageUrl}
                                alt=""
                                className="w-9 h-9 rounded object-cover border"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-9 h-9 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
                                <FiFolder size={16} />
                              </div>
                            )}
                          </td>
                          <td className="px-2 py-2 align-middle">
                            <div className="font-medium text-gray-800 truncate max-w-[280px]">
                              {node.title || (
                                <span className="italic text-gray-400">(không tên)</span>
                              )}
                            </div>
                            {node.titleEn && (
                              <div className="text-[11px] text-gray-500 truncate max-w-[280px] mt-0.5">
                                {node.titleEn}
                              </div>
                            )}
                          </td>
                          <td className="px-2 py-2 align-middle text-center">
                            <CountBadge count={techCount} color="purple" />
                          </td>
                          <td className="px-2 py-2 align-middle text-center">
                            <CountBadge count={appCount} color="amber" />
                          </td>
                          <td className="px-2 py-2 align-middle text-center">
                            <CountBadge count={productCount} color="blue" />
                          </td>
                          <td className="px-2 py-2 align-middle text-center">
                            {node.isFeatured ? (
                              <span className="text-[10px] px-1.5 py-0.5 bg-yellow-50 text-yellow-700 rounded font-semibold">
                                ★
                              </span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          <td className="px-2 py-2 align-middle text-center">
                            {node.isActive !== false ? (
                              <span className="text-[10px] px-1.5 py-0.5 bg-green-50 text-green-700 rounded">
                                Hiện
                              </span>
                            ) : (
                              <span className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-500 rounded">
                                Ẩn
                              </span>
                            )}
                          </td>
                          <td className="px-2 py-2 align-middle text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() =>
                                  navigate(`/market-trees/${node._id}/edit`)
                                }
                                className="p-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                                title="Sửa"
                              >
                                <FiEdit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(node._id)}
                                className="p-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
                                title="Xóa"
                              >
                                <FiTrash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <tr>
                              <td colSpan={11} className="p-0 border-b border-gray-100">
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.18, ease: 'easeOut' }}
                                  style={{ overflow: 'hidden' }}
                                >
                                  <ExpandedDetail
                                    node={node}
                                    productMap={productMap}
                                  />
                                </motion.div>
                              </td>
                            </tr>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MarketTreeList;
