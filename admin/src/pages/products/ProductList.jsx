import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiFile, FiUpload, FiSearch, FiX } from 'react-icons/fi';
import Header from '../../components/Header';
import SEO from '../../components/SEO';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../context/NotificationContext';

const LEGACY_COLUMNS = [
  { key: 'softeningPoint', name: 'Điểm làm mềm', nameEn: 'Softening Point', order: 1 },
  { key: 'acidValue', name: 'Chỉ số axit', nameEn: 'Acid Value', order: 2 },
  { key: 'color', name: 'Màu sắc', nameEn: 'Color', order: 3 },
];

const WEB_STATUS_LABELS = {
  draft: { label: 'Nháp', className: 'bg-amber-50 text-amber-700' },
  published: { label: 'Đã xuất bản', className: 'bg-green-50 text-green-700' },
  archived: { label: 'Lưu trữ', className: 'bg-gray-100 text-gray-600' },
};

const formatPrice = (price) => {
  if (typeof price !== 'number' || price <= 0) return '—';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(price);
};

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [columns, setColumns] = useState([]);
  const [mainTrees, setMainTrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [filterMainTree, setFilterMainTree] = useState('');
  const [filterWebStatus, setFilterWebStatus] = useState('');
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchProducts();
    fetchColumns();
    fetchMainTrees();
  }, []);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMainTree, filterWebStatus]);

  const fetchColumns = async () => {
    try {
      const res = await adminApi.getProductColumns();
      const items = Array.isArray(res.data?.data) ? res.data.data : [];
      setColumns(
        items.length > 0
          ? items.filter((column) => column.isActive !== false).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          : []
      );
    } catch (error) {
      console.error('Error loading product columns:', error);
      setColumns(LEGACY_COLUMNS);
    }
  };

  const fetchMainTrees = async () => {
    try {
      const res = await adminApi.getMainTrees();
      setMainTrees(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (error) {
      console.error('Error loading main trees:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const params = {};
      if (filterMainTree) params.industries = filterMainTree;
      if (filterWebStatus) params.webStatus = filterWebStatus;
      const res = await adminApi.getProducts(params);
      const data = res.data?.data;
      setProducts(Array.isArray(data) ? data : data?.items || []);
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
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.nameEn?.toLowerCase().includes(q) ||
        p.productCode?.toLowerCase().includes(q)
    );
  }, [products, search]);

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    try {
      await adminApi.deleteProduct(id);
      addNotification('Xóa sản phẩm thành công');
      fetchProducts();
    } catch (error) {
      addNotification('Có lỗi xảy ra', 'error');
    }
  };

  const handleDeleteSelected = async () => {
    if (selected.length === 0) return;
    if (!confirm(`Xóa ${selected.length} sản phẩm đã chọn?`)) return;
    setDeleting(true);
    try {
      await adminApi.deleteProducts(selected);
      addNotification(`Đã xóa ${selected.length} sản phẩm`);
      setSelected([]);
      fetchProducts();
    } catch (error) {
      addNotification('Có lỗi xảy ra khi xóa nhiều', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const toggleAll = () => {
    if (selected.length === filtered.length) {
      setSelected([]);
    } else {
      setSelected(filtered.map((p) => p._id));
    }
  };

  const toggleOne = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleUploadTDS = (id) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        await adminApi.uploadTDS(id, file);
        addNotification('Upload TDS thành công');
        fetchProducts();
      } catch (error) {
        addNotification('Upload thất bại', 'error');
      }
    };
    input.click();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <SEO title="Sản phẩm" description="Quản lý sản phẩm" url="/products" />
      <Header title="Quản lý sản phẩm" />

      <div className="p-4">
        <div className="card">
          <div className="flex justify-between items-center mb-3 gap-2 flex-wrap">
            <h2 className="text-sm font-semibold">
              Danh sách sản phẩm ({filtered.length})
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
              <select
                value={filterWebStatus}
                onChange={(e) => setFilterWebStatus(e.target.value)}
                className="input-field text-xs py-1.5 w-36"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="draft">Nháp</option>
                <option value="published">Đã xuất bản</option>
                <option value="archived">Lưu trữ</option>
              </select>
              <div className="relative">
                <FiSearch size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm tên, mã SKU..."
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
              <button
                onClick={() => navigate('/products/new')}
                className="btn-primary flex items-center gap-1 text-xs"
              >
                <FiPlus size={14} />
                Thêm sản phẩm
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="table-header">
                    <th className="px-2 py-2 w-10">
                      <input
                        type="checkbox"
                        checked={filtered.length > 0 && selected.length === filtered.length}
                        onChange={toggleAll}
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      />
                    </th>
                    <th className="px-2 py-2 text-left text-xs">Ảnh</th>
                    <th className="px-2 py-2 text-left text-xs">Mã SKU</th>
                    <th className="px-2 py-2 text-left text-xs">Tên</th>
                    <th className="px-2 py-2 text-left text-xs">Ngành hàng</th>
                    <th className="px-2 py-2 text-left text-xs">Product line</th>
                    <th className="px-2 py-2 text-left text-xs">Ứng dụng</th>
                    <th className="px-2 py-2 text-left text-xs">Giá</th>
                    <th className="px-2 py-2 text-left text-xs">Web</th>
                    {columns.slice(0, 2).map((column) => (
                      <th key={column._id || column.key} className="px-2 py-2 text-left text-xs whitespace-nowrap">
                        {column.name}
                      </th>
                    ))}
                    <th className="px-2 py-2 text-right text-xs">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((product) => {
                    const industriesList = Array.isArray(product.industries) ? product.industries : [];
                    const plList = Array.isArray(product.productLines) ? product.productLines : [];
                    const firstIndustryId =
                      industriesList.length > 0
                        ? industriesList[0]?._id || industriesList[0]
                        : null;
                    const mtObj = firstIndustryId ? mainTreeById.get(String(firstIndustryId)) : null;
                    const productLineNames = plList
                      .map((p) => (typeof p === 'object' ? p?.name : null))
                      .filter(Boolean)
                      .join(', ');
                    return (
                      <tr
                        key={product._id}
                        className={`table-row ${selected.includes(product._id) ? 'bg-primary/5' : ''}`}
                      >
                        <td className="px-2 py-2">
                          <input
                            type="checkbox"
                            checked={selected.includes(product._id)}
                            onChange={() => toggleOne(product._id)}
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <img
                            src={product.imageUrl || 'https://via.placeholder.com/40'}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <span className="text-xs font-mono text-gray-600">
                            {product.productCode || '—'}
                          </span>
                        </td>
                        <td className="px-2 py-2">
                          <div className="text-xs font-medium">{product.name}</div>
                          {product.nameEn && (
                            <div className="text-[10px] text-gray-400">{product.nameEn}</div>
                          )}
                        </td>
                        <td className="px-2 py-2 text-xs text-gray-500 whitespace-nowrap">
                          {mtObj?.name || '—'}
                        </td>
                        <td className="px-2 py-2 text-xs text-gray-500 whitespace-nowrap">
                          {productLineNames || '—'}
                        </td>
                        <td className="px-2 py-2 text-xs text-gray-500 whitespace-nowrap">
                          {Array.isArray(product.applications)
                            ? product.applications.length
                            : 0}
                        </td>
                        <td className="px-2 py-2 text-xs whitespace-nowrap">
                          {product.priceVisible ? (
                            <span className="font-medium">{formatPrice(product.price)}</span>
                          ) : (
                            <span className="text-gray-400 italic">Liên hệ</span>
                          )}
                        </td>
                        <td className="px-2 py-2">
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded ${
                              WEB_STATUS_LABELS[product.webStatus]?.className || 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {WEB_STATUS_LABELS[product.webStatus]?.label || product.webStatus || '—'}
                          </span>
                        </td>
                        {columns.slice(0, 2).map((column) => {
                          const value = product.attributes?.[column.key] ?? product[column.key];
                          return (
                            <td key={column._id || column.key} className="px-2 py-2 text-xs whitespace-nowrap">
                              {value || '—'}
                            </td>
                          );
                        })}
                        <td className="px-2 py-2 text-right">
                          <div className="flex justify-end gap-1">
                            {product.tdsUrl ? (
                              <a
                                href={product.tdsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                title="Xem TDS"
                              >
                                <FiFile size={14} />
                              </a>
                            ) : (
                              <button
                                onClick={() => handleUploadTDS(product._id)}
                                className="p-1 text-gray-400 hover:bg-gray-50 rounded"
                                title="Upload TDS"
                              >
                                <FiUpload size={14} />
                              </button>
                            )}
                            <button
                              onClick={() => navigate(`/products/${product._id}/edit`)}
                              className="p-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                              title="Sửa"
                            >
                              <FiEdit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(product._id)}
                              className="p-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
                              title="Xóa"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
                  <span className="text-3xl">📦</span>
                  <p className="text-sm">Chưa có sản phẩm nào.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductList;