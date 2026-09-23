import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowDown,
  FiArrowUp,
  FiEdit2,
  FiEye,
  FiEyeOff,
  FiPlus,
  FiRefreshCw,
  FiTrash2,
} from 'react-icons/fi';
import HeaderWithBreadcrumb from '../settings/HeaderWithBreadcrumb';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../context/NotificationContext';
import Skeleton from '../../components/Skeleton';

const isDeleted = (column) => Boolean(column.deleted || column.deletedAt);

const ProductColumnsSettings = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(true);

  const visibleColumns = useMemo(
    () => showInactive ? columns : columns.filter((column) => column.isActive && !isDeleted(column)),
    [columns, showInactive]
  );
  const reorderableColumns = useMemo(
    () => visibleColumns.filter((column) => !isDeleted(column)),
    [visibleColumns]
  );

  const loadColumns = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getProductColumns();
      const items = Array.isArray(response.data?.data) ? response.data.data : [];
      setColumns(items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
    } catch (error) {
      addNotification(error.response?.data?.message || 'Không tải được danh sách cột', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadColumns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleActive = async (column) => {
    try {
      await adminApi.updateProductColumn(column._id, { isActive: !column.isActive });
      addNotification(column.isActive ? 'Đã ẩn cột thuộc tính' : 'Đã hiển thị cột thuộc tính');
      await loadColumns();
    } catch (error) {
      addNotification(error.response?.data?.message || 'Cập nhật trạng thái thất bại', 'error');
    }
  };

  const handleDelete = async (column) => {
    if (!window.confirm(`Xóa cột "${column.name}"? Các giá trị của cột này trong sản phẩm cũng sẽ bị xóa.`)) return;
    try {
      await adminApi.deleteProductColumn(column._id);
      addNotification('Đã xóa cột thuộc tính');
      await loadColumns();
    } catch (error) {
      addNotification(error.response?.data?.message || 'Xóa cột thuộc tính thất bại', 'error');
    }
  };

  const handleRestore = async (column) => {
    try {
      await adminApi.restoreProductColumn(column._id);
      addNotification('Đã khôi phục cột thuộc tính');
      await loadColumns();
    } catch (error) {
      addNotification(error.response?.data?.message || 'Khôi phục cột thuộc tính thất bại', 'error');
    }
  };

  const moveColumn = async (index, direction) => {
    const currentId = visibleColumns[index]?._id;
    const reorderIndex = reorderableColumns.findIndex((column) => column._id === currentId);
    const targetIndex = reorderIndex + direction;
    if (reorderIndex < 0 || targetIndex < 0 || targetIndex >= reorderableColumns.length) return;
    const next = [...reorderableColumns];
    [next[reorderIndex], next[targetIndex]] = [next[targetIndex], next[reorderIndex]];
    try {
      await adminApi.reorderProductColumns(next.map((column) => column._id));
      await loadColumns();
    } catch (error) {
      addNotification(error.response?.data?.message || 'Sắp xếp cột thất bại', 'error');
    }
  };

  return (
    <>
      <HeaderWithBreadcrumb title="Cột thuộc tính sản phẩm" backTo="/products" backLabel="Danh sách sản phẩm" />
      <div className="p-4 pt-3">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <p className="text-xs text-gray-500 max-w-2xl">
            Tạo các thông số riêng cho sản phẩm. Cột đang hoạt động sẽ tự xuất hiện trong danh sách, form quản trị và trang chi tiết sản phẩm.
          </p>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-gray-600 select-none cursor-pointer">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(event) => setShowInactive(event.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              Hiện cột đã ẩn
            </label>
            <button type="button" onClick={() => navigate('/products/columns/new')} className="btn-primary flex items-center gap-1 text-xs">
              <FiPlus size={14} /> Thêm cột
            </button>
          </div>
        </div>

        <div className="card overflow-hidden">
          {loading ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="table-header">
                    <th className="px-3 py-2 text-center text-xs w-14">STT</th>
                    <th className="px-3 py-2 text-left text-xs">Tên (VI)</th>
                    <th className="px-3 py-2 text-left text-xs">Tên (EN)</th>
                    <th className="px-3 py-2 text-left text-xs">Đơn vị</th>
                    <th className="px-3 py-2 text-left text-xs">Key</th>
                    <th className="px-3 py-2 text-center text-xs">Thứ tự</th>
                    <th className="px-3 py-2 text-center text-xs">Trạng thái</th>
                    <th className="px-3 py-2 text-right text-xs">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 5 }).map((_, rowIdx) => (
                    <tr key={rowIdx} className="table-row">
                      <td className="px-3 py-3 text-center"><Skeleton variant="rect" height={10} width={16} /></td>
                      <td className="px-3 py-3"><Skeleton variant="rect" height={12} width={`${60 + (rowIdx % 3) * 10}%`} /></td>
                      <td className="px-3 py-3"><Skeleton variant="rect" height={10} width={`${40 + (rowIdx % 4) * 12}%`} /></td>
                      <td className="px-3 py-3"><Skeleton variant="rect" height={10} width={40} /></td>
                      <td className="px-3 py-3"><Skeleton variant="rect" height={12} width={80} /></td>
                      <td className="px-3 py-3 text-center"><Skeleton variant="rect" height={10} width={24} /></td>
                      <td className="px-3 py-3 text-center"><Skeleton variant="rect" height={18} width={60} rounded /></td>
                      <td className="px-3 py-3">
                        <div className="flex justify-end items-center gap-1">
                          <Skeleton variant="rect" height={22} width={22} rounded />
                          <Skeleton variant="rect" height={22} width={22} rounded />
                          <Skeleton variant="rect" height={22} width={22} rounded />
                          <Skeleton variant="rect" height={22} width={22} rounded />
                          <Skeleton variant="rect" height={22} width={22} rounded />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : visibleColumns.length === 0 ? (
            <div className="text-center py-10 text-xs text-gray-500">Chưa có cột thuộc tính nào.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="table-header">
                    <th className="px-3 py-2 text-center text-xs w-14">STT</th>
                    <th className="px-3 py-2 text-left text-xs">Tên (VI)</th>
                    <th className="px-3 py-2 text-left text-xs">Tên (EN)</th>
                    <th className="px-3 py-2 text-left text-xs">Đơn vị</th>
                    <th className="px-3 py-2 text-left text-xs">Key</th>
                    <th className="px-3 py-2 text-center text-xs">Thứ tự</th>
                    <th className="px-3 py-2 text-center text-xs">Trạng thái</th>
                    <th className="px-3 py-2 text-right text-xs">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleColumns.map((column, index) => {
                    const deleted = isDeleted(column);
                    return (
                      <tr key={column._id} className={`table-row ${deleted ? 'opacity-60 bg-gray-50' : ''}`}>
                        <td className="px-3 py-2 text-center text-xs text-gray-500">{index + 1}</td>
                        <td className="px-3 py-2 text-xs font-medium">{column.name}</td>
                        <td className="px-3 py-2 text-xs text-gray-600">{column.nameEn || '—'}</td>
                        <td className="px-3 py-2 text-xs text-gray-600">
                          {column.unit ? (
                            <span dangerouslySetInnerHTML={{ __html: column.unit }} />
                          ) : '—'}
                        </td>
                        <td className="px-3 py-2"><code className="text-[11px] bg-gray-100 rounded px-1.5 py-0.5">{column.key}</code></td>
                        <td className="px-3 py-2 text-center text-xs text-gray-600">{column.order ?? 0}</td>
                        <td className="px-3 py-2 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${deleted || !column.isActive ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'}`}>
                            {deleted ? 'Đã xóa' : column.isActive ? 'Hiển thị' : 'Đã ẩn'}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex justify-end items-center gap-1">
                            {!deleted && (
                              <>
                                <button type="button" onClick={() => moveColumn(index, -1)} disabled={reorderableColumns.findIndex((item) => item._id === column._id) === 0} className="p-1.5 text-gray-400 hover:text-primary disabled:opacity-30" title="Đưa lên"><FiArrowUp size={14} /></button>
                                <button type="button" onClick={() => moveColumn(index, 1)} disabled={reorderableColumns.findIndex((item) => item._id === column._id) === reorderableColumns.length - 1} className="p-1.5 text-gray-400 hover:text-primary disabled:opacity-30" title="Đưa xuống"><FiArrowDown size={14} /></button>
                                <button type="button" onClick={() => toggleActive(column)} className="p-1.5 text-gray-500 hover:text-primary" title={column.isActive ? 'Ẩn cột' : 'Hiện cột'}>
                                  {column.isActive ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                                </button>
                                <button type="button" onClick={() => navigate(`/products/columns/${column._id || column.id}/edit`)} className="p-1.5 text-gray-500 hover:text-primary" title="Sửa"><FiEdit2 size={14} /></button>
                                <button type="button" onClick={() => handleDelete(column)} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Xóa"><FiTrash2 size={14} /></button>
                              </>
                            )}
                            {deleted && (
                              <button type="button" onClick={() => handleRestore(column)} className="p-1.5 text-primary hover:bg-primary-50 rounded" title="Khôi phục"><FiRefreshCw size={14} /></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    </>
  );
};

export default ProductColumnsSettings;
