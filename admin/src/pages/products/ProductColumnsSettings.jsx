import { useEffect, useMemo, useState } from 'react';
import {
  FiArrowDown,
  FiArrowUp,
  FiEdit2,
  FiEye,
  FiEyeOff,
  FiPlus,
  FiRefreshCw,
  FiTrash2,
  FiX,
} from 'react-icons/fi';
import HeaderWithBreadcrumb from '../settings/HeaderWithBreadcrumb';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../context/NotificationContext';

const emptyForm = {
  name: '',
  nameEn: '',
  key: '',
  order: 0,
  isActive: true,
};

const slugify = (value) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '_')
  .replace(/^_+|_+$/g, '')
  .slice(0, 30);

const LEGACY_KEYS = new Set(['softeningPoint', 'acidValue', 'color']);

const normalizeKey = (value) => {
  const key = value.trim();
  return LEGACY_KEYS.has(key) ? key : key.toLowerCase();
};

const isDeleted = (column) => Boolean(column.deleted || column.deletedAt);

const ProductColumnsSettings = () => {
  const { addNotification } = useNotification();
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
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

  const openCreate = () => {
    setForm({ ...emptyForm, order: columns.length + 1 });
    setEditing('new');
  };

  const openEdit = (column) => {
    setForm({
      name: column.name || '',
      nameEn: column.nameEn || '',
      key: column.key || '',
      order: column.order ?? 0,
      isActive: column.isActive !== false,
    });
    setEditing(column);
  };

  const closeForm = () => {
    setEditing(null);
    setForm(emptyForm);
  };

  const handleNameChange = (value) => {
    setForm((previous) => ({
      ...previous,
      name: value,
      ...(editing === 'new' && !previous.key ? { key: slugify(value) } : {}),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        key: normalizeKey(form.key),
        order: Number(form.order) || 0,
      };
      if (editing === 'new') {
        await adminApi.createProductColumn(payload);
        addNotification('Tạo cột thuộc tính thành công');
      } else {
        await adminApi.updateProductColumn(editing._id, payload);
        addNotification('Cập nhật cột thuộc tính thành công');
      }
      closeForm();
      await loadColumns();
    } catch (error) {
      addNotification(error.response?.data?.message || 'Lưu cột thuộc tính thất bại', 'error');
    } finally {
      setSaving(false);
    }
  };

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
      <div className="p-4 pt-3 max-w-6xl">
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
            <button type="button" onClick={openCreate} className="btn-primary flex items-center gap-1 text-xs">
              <FiPlus size={14} /> Thêm cột
            </button>
          </div>
        </div>

        <div className="card overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
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
                                <button type="button" onClick={() => openEdit(column)} className="p-1.5 text-gray-500 hover:text-primary" title="Sửa"><FiEdit2 size={14} /></button>
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

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center p-4 overflow-y-auto" onClick={(event) => { if (event.target === event.currentTarget) closeForm(); }}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg my-8">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h2 className="text-sm font-semibold">{editing === 'new' ? 'Thêm cột thuộc tính' : 'Sửa cột thuộc tính'}</h2>
              <button type="button" onClick={closeForm} className="p-1 text-gray-400 hover:text-gray-600"><FiX size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Tên cột (VI) <span className="text-red-500">*</span></label>
                  <input type="text" required value={form.name} onChange={(event) => handleNameChange(event.target.value)} className="input-field" placeholder="Ví dụ: Độ nhớt" maxLength={100} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Tên cột (EN)</label>
                  <input type="text" value={form.nameEn} onChange={(event) => setForm({ ...form, nameEn: event.target.value })} className="input-field" placeholder="Viscosity" maxLength={100} />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Key <span className="text-red-500">*</span></label>
                  <input type="text" required value={form.key} onChange={(event) => setForm({ ...form, key: event.target.value.toLowerCase().replace(/\s+/g, '_') })} className="input-field font-mono text-xs" placeholder="viscosity" pattern="^[a-zA-Z][a-zA-Z0-9_]{1,29}$" />
                  <p className="text-[10px] text-gray-400 mt-1">Chữ thường, số, gạch dưới; dài 2–30 ký tự.</p>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Thứ tự</label>
                  <input type="number" min="0" value={form.order} onChange={(event) => setForm({ ...form, order: event.target.value })} className="input-field" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer select-none">
                <input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} className="rounded border-gray-300 text-primary focus:ring-primary" />
                Hiển thị cột này trong sản phẩm
              </label>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={closeForm} className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded">Hủy</button>
                <button type="submit" disabled={saving} className="btn-primary text-xs disabled:opacity-60">{saving ? 'Đang lưu...' : editing === 'new' ? 'Tạo cột' : 'Lưu thay đổi'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductColumnsSettings;
