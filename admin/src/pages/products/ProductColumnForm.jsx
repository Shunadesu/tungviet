import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import HeaderWithBreadcrumb from '../settings/HeaderWithBreadcrumb';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../context/NotificationContext';
import RichEditor from '../../components/RichEditor';
import Skeleton from '../../components/Skeleton';

const emptyForm = {
  name: '',
  nameEn: '',
  unit: '',
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
  if (!value) return '';
  const key = String(value).trim();
  return LEGACY_KEYS.has(key) ? key : key.toLowerCase();
};

/**
 * Standalone form page for creating / editing a product column.
 * Mounted at /products/columns/new and /products/columns/:id/edit
 */
const ProductColumnForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // id = column _id for edit, absent for create
  const { addNotification } = useNotification();

  const isEditing = Boolean(id);

  const [form, setForm] = useState({ ...emptyForm });
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEditing || !id) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await adminApi.getProductColumn(id);
        if (cancelled) return;
        // Support: { data: item }, { data: [item] }, and { data: { data: item } }
        const raw = res.data?.data ?? res.data ?? null;
        const col = Array.isArray(raw) ? raw[0] : (raw?.data ?? raw);
        if (col && (col._id || col.id)) {
          setForm({
            name: col.name || '',
            nameEn: col.nameEn || '',
            unit: col.unit || '',
            key: col.key || '',
            order: col.order ?? 0,
            isActive: col.isActive !== false,
          });
        } else if (!cancelled) {
          addNotification('Không tìm thấy cột thuộc tính', 'error');
          navigate('/products/columns');
        }
      } catch (err) {
        if (!cancelled) {
          addNotification(err.response?.data?.message || 'Không tải được cột', 'error');
          navigate('/products/columns');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, isEditing, navigate, addNotification]);

  const handleNameChange = (value) => {
    setForm((prev) => {
      const shouldAutoKey = !id;
      const sourceForKey = prev.nameEn || value;
      return {
        ...prev,
        name: value,
        ...(shouldAutoKey ? { key: slugify(sourceForKey) } : {}),
      };
    });
  };

  const handleNameEnChange = (value) => {
    setForm((prev) => {
      const shouldAutoKey = !id;
      return {
        ...prev,
        nameEn: value,
        ...(shouldAutoKey && value ? { key: slugify(value) } : {}),
      };
    });
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
      if (isEditing) {
        await adminApi.updateProductColumn(id, payload);
        addNotification('Cập nhật cột thuộc tính thành công');
      } else {
        await adminApi.createProductColumn(payload);
        addNotification('Tạo cột thuộc tính thành công');
      }
      navigate('/products/columns');
    } catch (err) {
      addNotification(err.response?.data?.message || 'Lưu cột thuộc tính thất bại', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <HeaderWithBreadcrumb
          title="Sửa cột thuộc tính"
          backTo="/products/columns"
          backLabel="Quay lại danh sách"
        />
        <div className="p-4 pt-3">
          <div className="card p-5 space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Skeleton variant="rect" height={10} width="40%" className="mb-1.5" />
                <Skeleton variant="rect" height={36} width="100%" />
              </div>
              <div className="space-y-1.5">
                <Skeleton variant="rect" height={10} width="30%" className="mb-1.5" />
                <Skeleton variant="rect" height={36} width="100%" />
                <Skeleton variant="rect" height={9} width="70%" className="mt-1" />
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Skeleton variant="rect" height={10} width="30%" className="mb-1.5" />
                <Skeleton variant="rect" height={36} width="100%" />
              </div>
              <div className="space-y-1.5">
                <Skeleton variant="rect" height={10} width="25%" className="mb-1.5" />
                <Skeleton variant="rect" height={36} width="100%" />
              </div>
              <div className="space-y-1.5">
                <Skeleton variant="rect" height={10} width="20%" className="mb-1.5" />
                <Skeleton variant="rect" height={36} width="100%" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton variant="rect" height={14} width={14} rounded />
              <Skeleton variant="rect" height={10} width="15%" />
            </div>
            <div className="flex gap-3 pt-3 border-t">
              <Skeleton variant="rect" height={36} width={90} rounded />
              <Skeleton variant="rect" height={36} width={110} rounded />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <HeaderWithBreadcrumb
        title={isEditing ? 'Sửa cột thuộc tính' : 'Thêm cột thuộc tính'}
        backTo="/products/columns"
        backLabel="Quay lại danh sách"
      />

      <div className="p-4 pt-3">
        <div className="card overflow-hidden">
          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            {/* Row: name VI + name EN */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Tên cột (VI) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="input-field"
                  placeholder="Ví dụ: Độ nhớt"
                  maxLength={100}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Tên cột (EN)
                </label>
                <input
                  type="text"
                  value={form.nameEn}
                  onChange={(e) => handleNameEnChange(e.target.value)}
                  className="input-field"
                  placeholder="Viscosity"
                  maxLength={100}
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  {!id && 'Key sẽ tự động tạo từ tên EN khi tạo mới.'}
                </p>
              </div>
            </div>

            {/* Row: unit + key */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Đơn vị
                </label>
                <RichEditor
                  value={form.unit}
                  onChange={(val) => setForm({ ...form, unit: val })}
                  placeholder="Ví dụ: °C, mg KOH/g, Gardner"
                  minHeight={60}
                  maxLength={500}
                  toolbar={[['bold', 'italic']]}
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Đơn vị đo của thuộc tính. Hỗ trợ ký tự đặc biệt (°, ±, ²…). Bôi đậm/in nghiêng ký hiệu để dễ phân biệt.
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Key <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.key}
                  onChange={(e) => setForm({ ...form, key: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                  className="input-field font-mono text-xs"
                  placeholder="viscosity"
                  pattern="^[a-zA-Z][a-zA-Z0-9_]{1,29}$"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Chữ thường, số, gạch dưới; dài 2–30 ký tự.
                </p>
              </div>
            </div>

            {/* Row: order + active */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Thứ tự
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: e.target.value })}
                  className="input-field w-32"
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer select-none mt-6">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  Hiển thị cột này trong sản phẩm
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <button
                type="button"
                onClick={() => navigate('/products/columns')}
                className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary text-xs disabled:opacity-60"
              >
                {saving ? 'Đang lưu...' : isEditing ? 'Lưu thay đổi' : 'Tạo cột'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ProductColumnForm;
