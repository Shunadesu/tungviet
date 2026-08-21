import { useState } from 'react';
import {
  FiImage,
  FiCpu,
  FiPackage,
  FiTrash2,
  FiChevronDown,
  FiChevronUp,
  FiUpload,
  FiLink,
  FiExternalLink,
} from 'react-icons/fi';
import RichEditor from '../components/RichEditor';

/**
 * Editable card for a sub-document (technology / application).
 * Shared between MarketTree and MainTree editors.
 */
export const emptySubDoc = {
  title: '',
  titleEn: '',
  description: '',
  descriptionEn: '',
  imageUrl: '',
  order: 0,
  isActive: true,
  linkToMainTree: null,
  linkCustomUrl: '',
};

export const emptyApplication = {
  ...emptySubDoc,
  productEntries: [],
};

const SubDocEditorCard = ({
  item,
  index,
  kind,
  onUpdate,
  onRemove,
  onUploadImage,
  uploadingImage,
  availableMainTrees,
  defaultExpanded = false,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const Icon = kind === 'technologies' ? FiCpu : FiPackage;

  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50/40">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
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
              <Icon size={14} />
            </div>
          )}
          <div className="min-w-0">
            <div className="text-xs font-semibold text-gray-700 truncate">
              #{index + 1} {item.title || '(Chưa đặt tên)'}
            </div>
            {item.titleEn && (
              <div className="text-[10px] text-gray-400 truncate">
                {item.titleEn}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="p-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
            title={expanded ? 'Thu gọn' : 'Mở rộng'}
          >
            {expanded ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="p-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
            title="Xóa"
          >
            <FiTrash2 size={12} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 space-y-2 border-t border-gray-200 pt-3">
          <div className="grid md:grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-medium mb-0.5 text-gray-700">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={item.title}
                onChange={(e) => onUpdate({ ...item, title: e.target.value })}
                className="input-field text-xs"
                placeholder={kind === 'technologies' ? 'VD: Công nghệ chống thấm' : 'VD: Sơn lót nội thất'}
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium mb-0.5 text-gray-700">
                Tiêu đề tiếng Anh
              </label>
              <input
                type="text"
                value={item.titleEn}
                onChange={(e) => onUpdate({ ...item, titleEn: e.target.value })}
                className="input-field text-xs"
                placeholder="English title"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-medium mb-0.5 text-gray-700">
              Mô tả
            </label>
            <RichEditor
              value={item.description}
              onChange={(value) => onUpdate({ ...item, description: value })}
              placeholder="Mô tả..."
              minHeight={100}
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium mb-0.5 text-gray-700">
              Mô tả tiếng Anh
            </label>
            <RichEditor
              value={item.descriptionEn}
              onChange={(value) => onUpdate({ ...item, descriptionEn: value })}
              placeholder="English description"
              minHeight={100}
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium mb-0.5 text-gray-700">
              Hình ảnh
            </label>
            <div className="flex items-center gap-2">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt=""
                  className="w-10 h-10 rounded object-cover border"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                  <FiImage size={14} />
                </div>
              )}
              <label className="btn-secondary text-[10px] flex items-center gap-1 cursor-pointer">
                <FiUpload size={10} />
                {uploadingImage ? 'Đang upload...' : 'Upload'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onUploadImage(file);
                    e.target.value = '';
                  }}
                />
              </label>
              <input
                type="url"
                value={item.imageUrl}
                onChange={(e) => onUpdate({ ...item, imageUrl: e.target.value })}
                className="input-field text-[10px] flex-1"
                placeholder="Hoặc URL"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div>
              <label className="block text-[10px] font-medium mb-0.5 text-gray-700">
                Thứ tự
              </label>
              <input
                type="number"
                value={item.order ?? 0}
                onChange={(e) =>
                  onUpdate({ ...item, order: Number(e.target.value) || 0 })
                }
                className="input-field w-20 text-xs"
              />
            </div>
            <label className="flex items-center gap-1 cursor-pointer select-none mt-3.5">
              <input
                type="checkbox"
                checked={item.isActive !== false}
                onChange={(e) => onUpdate({ ...item, isActive: e.target.checked })}
                className="rounded w-3 h-3"
              />
              <span className="text-[10px] font-medium">Hiển thị</span>
            </label>
          </div>

          <div className="border-t border-gray-100 pt-2 mt-2">
            <div className="flex items-center gap-1 mb-1.5">
              <FiLink size={11} className="text-gray-500" />
              <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide">
                Link tiếp tục đến cây ngành sản phẩm
              </span>
            </div>
            <div className="grid md:grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-medium mb-0.5 text-gray-600">
                  Chọn cây ngành sản phẩm
                </label>
                <select
                  value={item.linkToMainTree || ''}
                  onChange={(e) =>
                    onUpdate({ ...item, linkToMainTree: e.target.value || null })
                  }
                  className="input-field text-[10px]"
                >
                  <option value="">-- Không chọn --</option>
                  {(availableMainTrees || []).map((mt) => (
                    <option key={mt._id} value={mt._id}>
                      {mt.name}
                      {mt.nameEn ? ` / ${mt.nameEn}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-medium mb-0.5 text-gray-600 flex items-center gap-1">
                  <FiExternalLink size={10} />
                  URL tuỳ chỉnh
                </label>
                <input
                  type="text"
                  value={item.linkCustomUrl || ''}
                  onChange={(e) =>
                    onUpdate({ ...item, linkCustomUrl: e.target.value })
                  }
                  className="input-field text-[10px]"
                  placeholder="https://... hoặc /duong-dan"
                />
              </div>
            </div>
            {(item.linkToMainTree || item.linkCustomUrl) && (
              <p className="text-[9px] text-gray-400 mt-1">
                {item.linkCustomUrl
                  ? 'URL tuỳ chỉnh sẽ được ưu tiên khi hiển thị.'
                  : 'Click vào cây ngành sản phẩm sẽ chuyển đến trang chi tiết.'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubDocEditorCard;