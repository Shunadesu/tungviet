import { useState, useEffect, useMemo } from 'react';
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
  FiExternalLink,
} from 'react-icons/fi';
import Header from '../../components/Header';
import SEO from '../../components/SEO';
import BulkActionBar from '../../components/BulkActionBar';
import ConfirmModal from '../../components/ConfirmModal';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../context/NotificationContext';

const stripHtml = (html) =>
  (html || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

const truncate = (s, n = 280) => (s.length > n ? `${s.slice(0, n).trim()}…` : s);

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
      ? `Ứng dụng #${appIdx + 1}${product?.applications?.[appIdx]?.title ? ` — ${product.applications[appIdx].title}` : ''}`
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

const PillsList = ({ items, color, accent = '' }) => {
  if (!items || items.length === 0) {
    return <span className="text-gray-300 text-[10px]">—</span>;
  }
  const visible = items.slice(0, 3);
  const remaining = items.length - visible.length;
  return (
    <div className="flex flex-wrap gap-1 items-center">
      {visible.map((item, idx) => (
        <span
          key={idx}
          title={item.titleEn ? `${item.title} / ${item.titleEn}` : item.title || ''}
          className={`inline-block max-w-[160px] truncate text-[10px] px-1.5 py-0.5 rounded border ${color} ${accent}`}
        >
          {item.title || `Mục #${idx + 1}`}
        </span>
      ))}
      {remaining > 0 && (
        <span className="text-[10px] text-gray-500 font-medium" title={items.slice(3).map((i) => i.title).filter(Boolean).join('\n')}>
          +{remaining}
        </span>
      )}
    </div>
  );
};

const ExpandedDetail = ({ node, productMap }) => {
  const technologies = Array.isArray(node.technologies) ? node.technologies : [];
  const applications = Array.isArray(node.applications) ? node.applications : [];
  const rootProducts = Array.isArray(node.productEntries) ? node.productEntries : [];
  const descVi = truncate(stripHtml(node.description), 280);
  const descEn = truncate(stripHtml(node.descriptionEn), 280);
  const introVi = truncate(stripHtml(node.introductions?.vi), 280);
  const introEn = truncate(stripHtml(node.introductions?.en), 280);

  return (
    <div className="bg-gray-50/50 border-t border-gray-200 px-4 py-4">
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Basic info */}
        <div className="space-y-3">
          <div>
            <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Thông tin cơ bản
            </h4>
            <dl className="space-y-1.5 text-[11px]">
              <div>
                <dt className="text-gray-500">Mô tả (VI)</dt>
                <dd className="text-gray-700">{descVi || <span className="italic text-gray-400">—</span>}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Mô tả (EN)</dt>
                <dd className="text-gray-700">{descEn || <span className="italic text-gray-400">—</span>}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Giới thiệu (VI)</dt>
                <dd className="text-gray-700">{introVi || <span className="italic text-gray-400">—</span>}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Giới thiệu (EN)</dt>
                <dd className="text-gray-700">{introEn || <span className="italic text-gray-400">—</span>}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Technologies & Applications */}
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
                  <SubDocRow key={`tech-${idx}`} index={idx} item={item} kind="technologies" />
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
                  const productId = entry.productId?._id || entry.productId;
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
                  const entries = Array.isArray(item.productEntries) ? item.productEntries : [];
                  return (
                    <div key={`app-${idx}`} className="space-y-1.5">
                      <SubDocRow index={idx} item={item} kind="applications" />
                      {entries.length > 0 && (
                        <div className="ml-3 space-y-1">
                          {entries.map((entry, eIdx) => {
                            const productId = entry.productId?._id || entry.productId;
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
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedIds, setExpandedIds] = useState(() => new Set());
  const [productMap, setProductMap] = useState(() => new Map());
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkAction, setBulkAction] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchNodes();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await adminApi.getProducts({ limit: 200 });
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        setProductMap(new Map(list.map((p) => [String(p._id), p])));
      } catch (err) {
        console.error('Failed to load products', err);
      }
    };
    loadProducts();
  }, []);

  const fetchNodes = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getMarketTrees();
      setNodes(Array.isArray(res.data?.data) ? res.data.data : []);
      setSelectedIds(new Set());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return nodes;
    return nodes.filter((n) => {
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
  }, [nodes, search]);

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa cây ngành thị trường này?')) return;
    try {
      await adminApi.deleteMarketTree(id);
      addNotification('Xóa thành công');
      setExpandedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      fetchNodes();
    } catch (err) {
      addNotification(err.response?.data?.message || 'Có lỗi xảy ra', 'error');
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const filteredIds = filtered.map((n) => String(n._id));
    const allSelected =
      filteredIds.length > 0 && filteredIds.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        filteredIds.forEach((id) => next.delete(id));
      } else {
        filteredIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const executeBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setBulkLoading(true);
    try {
      const res = await adminApi.bulkMarketTrees({ action: 'delete', ids });
      addNotification(`Đã xóa ${res.data?.deleted ?? ids.length} cây ngành`);
      setBulkAction(null);
      fetchNodes();
    } catch (err) {
      addNotification(err.response?.data?.message || 'Có lỗi xảy ra', 'error');
    } finally {
      setBulkLoading(false);
    }
  };

  const filteredIds = filtered.map((n) => String(n._id));
  const allFilteredSelected =
    filteredIds.length > 0 && filteredIds.every((id) => selectedIds.has(id));
  const someFilteredSelected =
    filteredIds.some((id) => selectedIds.has(id)) && !allFilteredSelected;

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
          selectedCount={selectedIds.size}
          onClear={clearSelection}
          onDelete={() => setBulkAction({ type: 'delete' })}
          entityName="cây ngành"
          loading={bulkLoading}
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
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-8 pr-8 text-xs py-1.5 w-64"
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
              onClick={() => navigate('/market-trees/new')}
              className="btn-primary flex items-center gap-1 text-xs"
            >
              <FiPlus size={14} />
              Thêm cây ngành
            </button>
          </div>
        </div>

        <div className="card overflow-hidden p-0">
          {loading ? (
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
                    <th className="px-2 py-2 hidden lg:table-cell min-w-[180px]">Mô tả</th>
                    <th className="px-2 py-2 text-center w-16">Nổi bật</th>
                    <th className="px-2 py-2 text-center w-14">TT</th>
                    <th className="px-2 py-2 text-center w-20">Hiển thị</th>
                    <th className="px-2 py-2 min-w-[200px]">
                      <span className="inline-flex items-center gap-1 normal-case">
                        <FiCpu size={11} /> Công nghệ
                      </span>
                    </th>
                    <th className="px-2 py-2 min-w-[200px]">
                      <span className="inline-flex items-center gap-1 normal-case">
                        <FiPackage size={11} /> Ứng dụng
                      </span>
                    </th>
                    <th className="px-2 py-2 text-center w-14 hidden md:table-cell" title="Sản phẩm">
                      SP
                    </th>
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
                    const appProductCount = (node.applications || []).reduce(
                      (sum, a) => sum + (Array.isArray(a.productEntries) ? a.productEntries.length : 0),
                      0
                    );
                    const productCount = rootProductCount + appProductCount;
                    const descText = truncate(stripHtml(node.description), 120);
                    return (
                      <>
                        <tr
                          key={node._id}
                          className={`border-b border-gray-100 hover:bg-blue-50/30 transition-colors ${
                            selectedIds.has(node._id) ? 'bg-blue-50/60' : isOpen ? 'bg-blue-50/40' : ''
                          }`}
                        >
                          <td className="px-2 py-2 align-middle">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(node._id)}
                              onChange={() => toggleSelect(node._id)}
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
                              {isOpen ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
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
                          <td className="px-2 py-2 align-middle hidden lg:table-cell">
                            <span className="text-gray-500 line-clamp-2 block max-w-[260px]">
                              {descText || '—'}
                            </span>
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
                          <td className="px-2 py-2 align-middle text-center text-gray-500">
                            {node.order ?? 0}
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
                          <td className="px-2 py-2 align-middle">
                            <PillsList
                              items={node.technologies}
                              color="bg-purple-50 text-purple-700 border-purple-100"
                            />
                          </td>
                          <td className="px-2 py-2 align-middle">
                            <PillsList
                              items={node.applications}
                              color="bg-amber-50 text-amber-700 border-amber-100"
                            />
                          </td>
                          <td className="px-2 py-2 align-middle text-center hidden md:table-cell">
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded ${
                                productCount > 0
                                  ? 'bg-blue-50 text-blue-700 font-semibold'
                                  : 'bg-gray-50 text-gray-400'
                              }`}
                            >
                              {productCount}
                            </span>
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
                            <tr key={`${node._id}-detail`}>
                              <td colSpan={13} className="p-0 border-b border-gray-100">
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.18, ease: 'easeOut' }}
                                  style={{ overflow: 'hidden' }}
                                >
                                  <ExpandedDetail node={node} productMap={productMap} />
                                </motion.div>
                              </td>
                            </tr>
                          )}
                        </AnimatePresence>
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={bulkAction?.type === 'delete'}
        onClose={() => !bulkLoading && setBulkAction(null)}
        onConfirm={executeBulkDelete}
        title="Xóa hàng loạt"
        message={
          <>
            Bạn có chắc muốn xóa <b>{selectedIds.size}</b> cây ngành đã chọn? Hành động này không thể hoàn tác.
          </>
        }
        confirmText="Xóa"
        confirmStyle="danger"
        loading={bulkLoading}
      />
    </motion.div>
  );
};

export default MarketTreeList;
