import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiFile, FiUpload } from 'react-icons/fi';
import Header from '../../components/Header';
import SEO from '../../components/SEO';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../context/NotificationContext';

const LEGACY_COLUMNS = [
  { key: 'softeningPoint', name: 'Điểm làm mềm', nameEn: 'Softening Point', order: 1 },
  { key: 'acidValue', name: 'Chỉ số axit', nameEn: 'Acid Value', order: 2 },
  { key: 'color', name: 'Màu sắc', nameEn: 'Color', order: 3 },
];

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchProducts();
    fetchColumns();
  }, []);

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

  const fetchProducts = async () => {
    try {
      const res = await adminApi.getProducts();
      const data = res.data?.data;
      setProducts(Array.isArray(data) ? data : data?.items || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

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
    if (selected.length === products.length) {
      setSelected([]);
    } else {
      setSelected(products.map((p) => p._id));
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
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-semibold">Danh sách sản phẩm ({products.length})</h2>
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
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="table-header">
                    <th className="px-2 py-2 w-10">
                      <input
                        type="checkbox"
                        checked={products.length > 0 && selected.length === products.length}
                        onChange={toggleAll}
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      />
                    </th>
                    <th className="px-2 py-2 text-left text-xs">Ảnh</th>
                    <th className="px-2 py-2 text-left text-xs">Tên</th>
                    {columns.map((column) => (
                      <th key={column._id || column.key} className="px-2 py-2 text-left text-xs whitespace-nowrap">{column.name}</th>
                    ))}
                    <th className="px-2 py-2 text-left text-xs">Lợi ích</th>
                    <th className="px-2 py-2 text-left text-xs">TDS</th>
                    <th className="px-2 py-2 text-right text-xs">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
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
                        <div className="text-xs font-medium">{product.name}</div>
                        {product.nameEn && (
                          <div className="text-[10px] text-gray-400">{product.nameEn}</div>
                        )}
                      </td>
                      {columns.map((column) => {
                        const value = product.attributes?.[column.key] ?? product[column.key];
                        return (
                          <td key={column._id || column.key} className="px-2 py-2 text-xs whitespace-nowrap">
                            {value || '—'}
                          </td>
                        );
                      })}
                      <td className="px-2 py-2">
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {product.benefits && product.benefits.length > 0 ? (
                            product.benefits.slice(0, 2).map((b, i) => (
                              <span key={i} className="text-[10px] px-1 py-0.5 bg-green-50 text-green-600 rounded">
                                {b}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                          {product.benefits && product.benefits.length > 2 && (
                            <span className="text-[10px] text-gray-400">+{product.benefits.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-2">
                        {product.tdsUrl ? (
                          <a
                            href={product.tdsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <FiFile size={16} />
                          </a>
                        ) : (
                          <button
                            onClick={() => handleUploadTDS(product._id)}
                            className="text-gray-400 hover:text-gray-600"
                            title="Upload TDS"
                          >
                            <FiUpload size={16} />
                          </button>
                        )}
                      </td>
                      <td className="px-2 py-2 text-right">
                        <div className="flex justify-end gap-1">
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductList;