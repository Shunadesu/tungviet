import { FiTrash2, FiEye, FiEyeOff, FiX } from 'react-icons/fi';

const BulkActionBar = ({
  selectedCount,
  onClear,
  onDelete,
  onActivate,
  onDeactivate,
  loading = false,
  entityName = 'mục',
}) => {
  if (!selectedCount) return null;

  return (
    <div className="sticky top-0 z-20 mb-2 px-3 py-2 bg-primary text-white rounded-md shadow flex items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-3">
        <span className="font-medium">
          Đã chọn {selectedCount} {entityName}
        </span>
        <button
          type="button"
          onClick={onClear}
          disabled={loading}
          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/15 hover:bg-white/25 disabled:opacity-50"
        >
          <FiX size={12} />
          Bỏ chọn
        </button>
      </div>
      <div className="flex items-center gap-2">
        {typeof onActivate === 'function' && (
          <button
            type="button"
            onClick={onActivate}
            disabled={loading}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-green-500 hover:bg-green-600 disabled:opacity-50"
          >
            <FiEye size={12} />
            Bật hiển thị
          </button>
        )}
        {typeof onDeactivate === 'function' && (
          <button
            type="button"
            onClick={onDeactivate}
            disabled={loading}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-600 disabled:opacity-50"
          >
            <FiEyeOff size={12} />
            Tắt hiển thị
          </button>
        )}
        {typeof onDelete === 'function' && (
          <button
            type="button"
            onClick={onDelete}
            disabled={loading}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-red-600 hover:bg-red-700 disabled:opacity-50"
          >
            <FiTrash2 size={12} />
            Xóa
          </button>
        )}
      </div>
    </div>
  );
};

export default BulkActionBar;
