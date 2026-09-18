import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiUpload, FiX, FiFile, FiImage, FiList, FiChevronDown, FiChevronUp, FiPlus, FiTrash2, FiPackage, FiCheck, FiCpu } from 'react-icons/fi';
import HeaderWithBreadcrumb from '../settings/HeaderWithBreadcrumb';
import RichEditor from '../../components/RichEditor';
import Modal from '../../components/Modal';
import SEO from '../../components/SEO';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../context/NotificationContext';
import useFormDraft from '../../hooks/useFormDraft';

const MultiIndustrySelect = ({ items, selected, onChange }) => {
  const [open, setOpen] = useState(false);
  const selectedIds = Array.isArray(selected) ? selected : [];
  const selectedSet = new Set(selectedIds);
  const selectedNodes = items.filter((m) => selectedSet.has(m._id));

  const toggle = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(Array.from(next));
  };

  const remove = (id, e) => {
    e.stopPropagation();
    onChange(selectedIds.filter((x) => x !== id));
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="input-field text-xs flex items-center justify-between w-full"
      >
        <span className="truncate text-left flex-1">
          {selectedNodes.length === 0
            ? '— Chọn ngành hàng (có thể chọn nhiều) —'
            : `Đã chọn ${selectedNodes.length} ngành`}
        </span>
        {open ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
      </button>
      {selectedNodes.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {selectedNodes.map((m) => (
            <span
              key={m._id}
              className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-lg"
            >
              {m.name}
              <button type="button" onClick={(e) => remove(m._id, e)} className="hover:text-red-500">
                <FiX size={10} />
              </button>
            </span>
          ))}
        </div>
      )}
      {open && (
        <div className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
          {items.length === 0 ? (
            <p className="text-xs text-gray-400 px-3 py-3">Chưa có ngành hàng nào.</p>
          ) : (
            <ul className="py-1">
              {items.map((m) => (
                <li key={m._id}>
                  <label className="flex items-center gap-2 px-3 py-1.5 text-xs cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedSet.has(m._id)}
                      onChange={() => toggle(m._id)}
                      className="rounded w-3.5 h-3.5"
                    />
                    <span className="flex-1 truncate">{m.name}</span>
                    {m.nameEn && (
                      <span className="text-[10px] text-gray-400 truncate">{m.nameEn}</span>
                    )}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

const MultiProductLineSelect = ({ items, selected, onChange }) => {
  const [open, setOpen] = useState(false);
  const selectedIds = Array.isArray(selected) ? selected : [];
  const selectedSet = new Set(selectedIds);
  const selectedNodes = items.filter((c) => selectedSet.has(c._id));

  const toggle = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(Array.from(next));
  };

  const remove = (id, e) => {
    e.stopPropagation();
    onChange(selectedIds.filter((x) => x !== id));
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="input-field text-xs flex items-center justify-between w-full"
      >
        <span className="truncate text-left flex-1">
          {selectedNodes.length === 0
            ? '— Chọn danh mục (có thể chọn nhiều) —'
            : selectedNodes.map((c) => c.name).join(', ')}
        </span>
        {open ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
      </button>
      {selectedNodes.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {selectedNodes.map((c) => (
            <span
              key={c._id}
              className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded-lg"
            >
              {c.name}
              <button type="button" onClick={(e) => remove(c._id, e)} className="hover:text-red-500">
                <FiX size={10} />
              </button>
            </span>
          ))}
        </div>
      )}
      {open && (
        <div className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
          {items.length === 0 ? (
            <p className="text-xs text-gray-400 px-3 py-3">Chưa có danh mục nào.</p>
          ) : (
            <ul className="py-1">
              {items.map((c) => (
                <li key={c._id}>
                  <label className="flex items-center gap-2 px-3 py-1.5 text-xs cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedSet.has(c._id)}
                      onChange={() => toggle(c._id)}
                      className="rounded w-3.5 h-3.5"
                    />
                    <span className="flex-1 truncate">{c.name}</span>
                    {c.nameEn && (
                      <span className="text-[10px] text-gray-400 truncate">{c.nameEn}</span>
                    )}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

const emptyApplication = {
  title: '',
  titleEn: '',
  description: '',
  descriptionEn: '',
  imageUrl: '',
  order: 0,
  isActive: true,
};

const MultiMarketSelect = ({ items, selected, onChange, disabled }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const selectedIds = Array.isArray(selected) ? selected : [];
  const selectedSet = new Set(selectedIds);
  const selectedNodes = items.filter((m) => selectedSet.has(m._id));

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const toggle = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(Array.from(next));
    // Auto-close dropdown after selection for better UX
    setTimeout(() => setOpen(false), 150);
  };

  const remove = (id, e) => {
    e.stopPropagation();
    onChange(selectedIds.filter((x) => x !== id));
  };

  return (
    <div ref={dropdownRef} className={`relative ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="input-field text-xs flex items-center justify-between w-full"
        disabled={disabled}
      >
        <span className="truncate text-left flex-1">
          {selectedNodes.length === 0
            ? '— Chọn thị trường (có thể chọn nhiều) —'
            : `Đã chọn ${selectedNodes.length} thị trường`}
        </span>
        {open ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
      </button>
      {selectedNodes.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {selectedNodes.map((m) => (
            <span
              key={m._id}
              className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded-lg border border-amber-200"
            >
              {m.title}
              <button type="button" onClick={(e) => remove(m._id, e)} className="hover:text-red-500">
                <FiX size={10} />
              </button>
            </span>
          ))}
        </div>
      )}
      {open && !disabled && (
        <div className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
          {items.length === 0 ? (
            <p className="text-xs text-gray-400 px-3 py-3">
              Chưa có cây ngành nào trong ngành này. Tạo cây ngành trước.
            </p>
          ) : (
            <ul className="py-1">
              {items.map((m) => (
                <li key={m._id}>
                  <label className="flex items-center gap-2 px-3 py-1.5 text-xs cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedSet.has(m._id)}
                      onChange={() => toggle(m._id)}
                      className="rounded w-3.5 h-3.5"
                    />
                    <span className="flex-1 truncate">{m.title}</span>
                    {m.titleEn && (
                      <span className="text-[10px] text-gray-400 truncate">{m.titleEn}</span>
                    )}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

const emptyForm = {
  productCode: '',
  name: '',
  nameEn: '',
  description: '',
  descriptionEn: '',
  imageUrl: '',
  gallery: [],
  industries: [],
  productLines: [],
  marketIds: [],
  marketEntries: [],
  price: 0,
  priceVisible: true,
  webStatus: 'draft',
  targetAudience: '',
  softeningPoint: '',
  acidValue: '',
  color: '',
  attributes: {},
  applications: [],
  tdsUrl: '',
  isActive: true,
  isFeatured: false,
  isNew: false,
  displayOrder: 0,
};

const WEB_STATUS_OPTIONS = [
  { value: 'draft', label: 'Nháp' },
  { value: 'published', label: 'Đã xuất bản' },
  { value: 'archived', label: 'Lưu trữ' },
];

const ApplicationEditor = ({ items, onChange, onUpload, uploading }) => {
  const { addNotification } = useNotification();
  const [modal, setModal] = useState({ open: false, index: null, draft: emptyApplication });

  const stripHtml = (html) => {
    if (!html) return '';
    return String(html)
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const openCreate = () => {
    setModal({
      open: true,
      index: null,
      draft: { ...emptyApplication, order: items.length },
    });
  };

  const openEdit = (idx) => {
    setModal({
      open: true,
      index: idx,
      draft: { ...emptyApplication, ...items[idx] },
    });
  };

  const closeModal = () =>
    setModal({ open: false, index: null, draft: { ...emptyApplication } });

  const updateDraft = (patch) =>
    setModal((m) => ({ ...m, draft: { ...m.draft, ...patch } }));

  const handleSave = () => {
    if (!modal.draft.title?.trim()) {
      addNotification('Vui lòng nhập tiêu đề ứng dụng', 'error');
      return;
    }
    const cleanOrder = Number(modal.draft.order) || 0;
    if (modal.index === null) {
      onChange([...items, { ...modal.draft, order: cleanOrder }]);
    } else {
      const next = items.map((it, i) =>
        i === modal.index ? { ...it, ...modal.draft, order: cleanOrder } : it
      );
      onChange(next);
    }
    closeModal();
  };

  const handleRemove = (idx) => {
    if (!window.confirm('Bạn có chắc muốn xoá ứng dụng này?')) return;
    onChange(items.filter((_, i) => i !== idx));
  };

  const handleUploadImage = async (e, idxInList) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const url = await onUpload(file, idxInList);
    if (url) updateDraft({ imageUrl: url });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1 text-xs font-semibold text-gray-700">
          <FiPackage size={14} />
          Ứng dụng sản phẩm (có ảnh + mô tả)
        </label>
        <button
          type="button"
          onClick={openCreate}
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          <FiPlus size={12} />
          Thêm ứng dụng
        </button>
      </div>
      <p className="text-[10px] text-gray-500">
        Mỗi ứng dụng của sản phẩm. Khi sản phẩm được chọn trong "Ứng dụng" của cây ngành thị trường, bạn sẽ chọn được ứng dụng cụ thể này.
      </p>

      {items.length === 0 ? (
        <p className="text-[11px] text-gray-400 italic">Chưa có ứng dụng nào.</p>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-2 py-2 text-left font-medium w-10">#</th>
                <th className="px-2 py-2 text-left font-medium w-16">Ảnh</th>
                <th className="px-2 py-2 text-left font-medium">Tiêu đề</th>
                <th className="px-2 py-2 text-left font-medium">Mô tả</th>
                <th className="px-2 py-2 text-center font-medium w-16">Thứ tự</th>
                <th className="px-2 py-2 text-center font-medium w-20">Hiển thị</th>
                <th className="px-2 py-2 text-right font-medium w-32">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item, idx) => (
                <tr key={`app-${idx}`} className="hover:bg-gray-50/50">
                  <td className="px-2 py-2 text-gray-500 align-middle">{idx + 1}</td>
                  <td className="px-2 py-2 align-middle">
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
                      <div className="w-10 h-10 rounded bg-gray-100 text-gray-400 flex items-center justify-center">
                        <FiImage size={14} />
                      </div>
                    )}
                  </td>
                  <td className="px-2 py-2 align-middle">
                    <div className="font-medium text-gray-800">
                      {item.title || <span className="text-gray-400 italic">(Chưa đặt tên)</span>}
                    </div>
                    {item.titleEn && (
                      <div className="text-[10px] text-gray-500 truncate max-w-[260px]">
                        {item.titleEn}
                      </div>
                    )}
                  </td>
                  <td className="px-2 py-2 align-middle text-gray-600 max-w-[280px]">
                    {stripHtml(item.description) ? (
                      <div className="line-clamp-2">{stripHtml(item.description)}</div>
                    ) : (
                      <span className="text-gray-400 italic">—</span>
                    )}
                  </td>
                  <td className="px-2 py-2 align-middle text-center text-gray-700">
                    {item.order ?? 0}
                  </td>
                  <td className="px-2 py-2 align-middle text-center">
                    {item.isActive !== false ? (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-green-50 text-green-700">
                        Bật
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-500">
                        Tắt
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-2 align-middle">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(idx)}
                        className="px-2 py-1 text-[10px] font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(idx)}
                        className="p-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
                        title="Xóa"
                      >
                        <FiTrash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={modal.open}
        onClose={closeModal}
        title={modal.index === null ? 'Thêm ứng dụng' : 'Sửa ứng dụng'}
        size="lg"
      >
        <div className="space-y-3">
          <div className="grid md:grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={modal.draft.title || ''}
                onChange={(e) => updateDraft({ title: e.target.value })}
                className="input-field text-xs"
                placeholder="VD: Sơn lót"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">
                Tiêu đề tiếng Anh
              </label>
              <input
                type="text"
                value={modal.draft.titleEn || ''}
                onChange={(e) => updateDraft({ titleEn: e.target.value })}
                className="input-field text-xs"
                placeholder="English title"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-700">Mô tả</label>
            <RichEditor
              value={modal.draft.description || ''}
              onChange={(value) => updateDraft({ description: value })}
              placeholder="Mô tả ứng dụng..."
              minHeight={120}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-700">
              Mô tả tiếng Anh
            </label>
            <RichEditor
              value={modal.draft.descriptionEn || ''}
              onChange={(value) => updateDraft({ descriptionEn: value })}
              placeholder="English description"
              minHeight={120}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-700">
              Hình ảnh ứng dụng
            </label>
            <div className="flex items-center gap-2">
              {modal.draft.imageUrl ? (
                <img
                  src={modal.draft.imageUrl}
                  alt=""
                  className="w-12 h-12 rounded object-cover border"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-12 h-12 rounded bg-gray-100 text-gray-400 flex items-center justify-center">
                  <FiImage size={16} />
                </div>
              )}
              <label className="btn-secondary text-xs flex items-center gap-1 cursor-pointer">
                <FiUpload size={12} />
                {uploading ? 'Đang upload...' : 'Upload'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    handleUploadImage(e, modal.index ?? items.length)
                  }
                />
              </label>
              <input
                type="url"
                value={modal.draft.imageUrl || ''}
                onChange={(e) => updateDraft({ imageUrl: e.target.value })}
                className="input-field text-xs flex-1"
                placeholder="Hoặc URL"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">
                Thứ tự
              </label>
              <input
                type="number"
                value={modal.draft.order ?? 0}
                onChange={(e) =>
                  updateDraft({ order: Number(e.target.value) || 0 })
                }
                className="input-field w-24 text-xs"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none mt-5">
              <input
                type="checkbox"
                checked={modal.draft.isActive !== false}
                onChange={(e) => updateDraft({ isActive: e.target.checked })}
                className="rounded w-3.5 h-3.5"
              />
              <span className="text-xs font-medium">Hiển thị</span>
            </label>
          </div>
          <div className="flex items-center justify-end gap-2 pt-3 border-t">
            <button type="button" onClick={closeModal} className="btn-secondary text-xs">
              Hủy
            </button>
            <button type="button" onClick={handleSave} className="btn-primary text-xs">
              {modal.index === null ? 'Thêm' : 'Lưu'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ── Multi-select component for technologies/applications ────────────────────
const MultiSelectDropdown = ({ 
  items, 
  selected, 
  onChange, 
  placeholder, 
  disabled,
  emptyMessage = "Chưa có dữ liệu"
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const selectedIds = Array.isArray(selected) ? selected : [];
  const selectedSet = new Set(selectedIds.map(String));
  const selectedNodes = items.filter((item) => selectedSet.has(String(item._id)));

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const toggle = (id) => {
    const next = new Set(selectedIds.map(String));
    const sid = String(id);
    if (next.has(sid)) next.delete(sid);
    else next.add(sid);
    onChange(Array.from(next));
    // Auto-close dropdown after selection for better UX
    setTimeout(() => setOpen(false), 150);
  };

  const remove = (id, e) => {
    e.stopPropagation();
    onChange(selectedIds.filter((x) => String(x) !== String(id)));
  };

  return (
    <div ref={dropdownRef} className={`relative ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <button
        type="button"
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        className="input-field text-xs flex items-center justify-between w-full min-h-[36px]"
      >
        <span className="truncate text-left flex-1">
          {selectedNodes.length === 0
            ? placeholder
            : `Đã chọn ${selectedNodes.length}`}
        </span>
        {open ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
      </button>
      
      {selectedNodes.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {selectedNodes.map((node) => (
            <span
              key={String(node._id)}
              className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200"
            >
              {node.title || node.titleEn || node.name}
              <button 
                type="button" 
                onClick={(e) => remove(node._id, e)} 
                className="hover:text-red-600"
              >
                <FiX size={10} />
              </button>
            </span>
          ))}
        </div>
      )}

      {open && !disabled && (
        <div className="absolute z-50 mt-1 w-full max-h-64 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-xl">
          {items.length === 0 ? (
            <p className="text-xs text-gray-400 px-3 py-2">{emptyMessage}</p>
          ) : (
            <ul className="py-1">
              {items.map((item) => {
                const isChecked = selectedSet.has(String(item._id));
                return (
                  <li key={String(item._id)}>
                    <label className="flex items-center gap-2 px-3 py-1.5 text-xs cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggle(item._id)}
                        className="rounded w-3.5 h-3.5"
                      />
                      <span className="flex-1">{item.title || item.titleEn || item.name}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

// ── Per-Market Techs & Apps Table ───────────────────────────────────────────
const MarketAppsTechsPanel = ({ markets, entries, onChange }) => {
  const updateEntry = (marketId, patch) => {
    const next = (entries || []).map((e) =>
      String(e.marketId) === String(marketId) ? { ...e, ...patch } : e
    );
    onChange(next);
  };

  if (!entries || entries.length === 0) {
    return (
      <div className="mt-3 p-4 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
        <p className="text-xs text-gray-500 text-center italic">
          Chọn thị trường ở trên trước để cấu hình công nghệ &amp; ứng dụng tương ứng.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 border border-gray-300 rounded-lg overflow-visible">
      <table className="w-full text-xs">
        <thead className="bg-slate-700 text-white">
          <tr>
            <th className="px-3 py-2.5 text-left font-semibold w-1/3">Thị trường</th>
            <th className="px-3 py-2.5 text-left font-semibold w-1/3">
              <div className="flex items-center gap-1.5">
                <FiCpu size={13} />
                Công nghệ
              </div>
            </th>
            <th className="px-3 py-2.5 text-left font-semibold w-1/3">
              <div className="flex items-center gap-1.5">
                <FiPackage size={13} />
                Ứng dụng
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {entries.map((entry) => {
            const market = (markets || []).find((m) => String(m._id) === String(entry.marketId));
            if (!market) return null;
            
            const techs = Array.isArray(market.technologies) ? market.technologies : [];
            const apps = Array.isArray(market.applications) ? market.applications : [];

            return (
              <tr key={String(entry.marketId)} className="hover:bg-gray-50/50">
                <td className="px-3 py-3 align-top">
                  <div className="font-semibold text-gray-800">
                    {market.title || market.titleEn}
                  </div>
                  {market.titleEn && market.title && (
                    <div className="text-[10px] text-gray-500 mt-0.5">
                      {market.titleEn}
                    </div>
                  )}
                </td>
                <td className="px-3 py-3 align-top">
                  <MultiSelectDropdown
                    items={techs}
                    selected={entry.technologyIds || []}
                    onChange={(ids) => updateEntry(entry.marketId, { technologyIds: ids })}
                    placeholder="— Chọn công nghệ —"
                    disabled={techs.length === 0}
                    emptyMessage="Thị trường này chưa có công nghệ"
                  />
                </td>
                <td className="px-3 py-3 align-top">
                  <MultiSelectDropdown
                    items={apps}
                    selected={entry.applicationIds || []}
                    onChange={(ids) => updateEntry(entry.marketId, { applicationIds: ids })}
                    placeholder="— Chọn ứng dụng —"
                    disabled={apps.length === 0}
                    emptyMessage="Thị trường này chưa có ứng dụng"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingTDS, setUploadingTDS] = useState(false);

  const [formData, setFormData] = useState({ ...emptyForm });
  const [columns, setColumns] = useState([]);
  const [mainTrees, setMainTrees] = useState([]);
  const [categories, setCategories] = useState([]);
  const [marketTrees, setMarketTrees] = useState([]);
  const [applicationUploading, setApplicationUploading] = useState(false);

  const draftKey = `draft:product:${isEditing ? `edit:${id}` : 'new'}`;
  const { loadedFromDraft, clearDraft } = useFormDraft(
    draftKey,
    formData,
    setFormData,
    { enabled: !loading }
  );

  useEffect(() => {
    fetchColumns();
    fetchMainTrees();
    fetchCategories();
    fetchMarketTrees();
    if (isEditing) {
      fetchProduct();
    } else {
      // Check if productLine and industry query params exist
      const urlParams = new URLSearchParams(window.location.search);
      const productLineParam = urlParams.get('productLine');
      const industryParam = urlParams.get('industry');
      
      const updates = {};
      if (productLineParam) {
        updates.productLines = [productLineParam];
      }
      // Don't set industry from URL param, fetchCategoryName will handle it
      
      if (Object.keys(updates).length > 0) {
        setFormData(prev => ({ ...prev, ...updates }));
        
        // Auto-fill product name AND industry from category
        if (productLineParam) {
          fetchCategoryName(productLineParam);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchColumns = async () => {
    try {
      const res = await adminApi.getProductColumns();
      const items = Array.isArray(res.data?.data) ? res.data.data : [];
      setColumns(
        items.filter((column) => column.isActive !== false).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      );
    } catch (error) {
      console.error('Error loading product columns:', error);
    }
  };

  const fetchMainTrees = async () => {
    try {
      const res = await adminApi.getMainTrees();
      const items = Array.isArray(res.data?.data) ? res.data.data : [];
      setItemsInOrder(items, setMainTrees);
    } catch (error) {
      console.error('Error loading main trees:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await adminApi.getCategories();
      const items = Array.isArray(res.data?.data) ? res.data.data : [];
      setItemsInOrder(items, setCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const fetchCategoryName = async (categoryId) => {
    try {
      const res = await adminApi.getCategory(categoryId);
      const category = res.data?.data;
      if (category) {
        const updates = {
          name: category.name || '',
          nameEn: category.nameEn || ''
        };
        
        // Also auto-fill industry from category's mainTree
        if (category.mainTree) {
          const industryId = typeof category.mainTree === 'object' ? category.mainTree._id : category.mainTree;
          if (industryId) {
            updates.industries = [industryId];
          }
        }
        
        setFormData(prev => ({
          ...prev,
          ...updates
        }));
      }
    } catch (error) {
      console.error('Error loading category name:', error);
    }
  };

  const fetchMarketTrees = async () => {
    try {
      // Load all active markets so the picker isn't blocked when industries change.
      const res = await adminApi.getMarketTrees();
      const items = Array.isArray(res.data?.data) ? res.data.data : [];
      setItemsInOrder(items, setMarketTrees);
    } catch (error) {
      console.error('Error loading market trees:', error);
    }
  };

  const setItemsInOrder = (items, setter) => {
    setter([...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || (a.name || '').localeCompare(b.name || '')));
  };

  const fetchProduct = async () => {
    try {
      const res = await adminApi.getProduct(id);
      const product = res.data.data;
      const industriesRaw = Array.isArray(product.industries) ? product.industries : [];
      const industries = industriesRaw
        .map((m) => (m && typeof m === 'object' ? m._id : m))
        .filter(Boolean);
      const productLinesRaw = Array.isArray(product.productLines) ? product.productLines : [];
      const productLines = productLinesRaw
        .map((c) => (c && typeof c === 'object' ? c._id : c))
        .filter(Boolean);
      const marketIdsRaw = Array.isArray(product.marketIds) ? product.marketIds : [];
      const marketIds = marketIdsRaw
        .map((m) => (m && typeof m === 'object' ? m._id : m))
        .filter(Boolean);
      const marketEntriesRaw = Array.isArray(product.marketEntries)
        ? product.marketEntries
        : [];
      const marketEntries = marketEntriesRaw
        .map((e) => ({
          marketId: e && typeof e.marketId === 'object' ? e.marketId?._id : e?.marketId,
          technologyIds: Array.isArray(e?.technologyIds)
            ? e.technologyIds.map((id) => (id && typeof id === 'object' ? id?._id : id)).filter(Boolean)
            : [],
          applicationIds: Array.isArray(e?.applicationIds)
            ? e.applicationIds.map((id) => (id && typeof id === 'object' ? id?._id : id)).filter(Boolean)
            : [],
        }))
        .filter((e) => e.marketId);
      setFormData({
        productCode: product.productCode || '',
        name: product.name || '',
        nameEn: product.nameEn || '',
        description: product.description || '',
        descriptionEn: product.descriptionEn || '',
        imageUrl: product.imageUrl || '',
        gallery: Array.isArray(product.gallery) ? product.gallery : [],
        industries,
        productLines,
        marketIds,
        marketEntries,
        price: product.price ?? 0,
        priceVisible: product.priceVisible !== false,
        webStatus: product.webStatus || 'draft',
        targetAudience: product.targetAudience || '',
        softeningPoint: product.softeningPoint || '',
        acidValue: product.acidValue || '',
        color: product.color || '',
        attributes: product.attributes && typeof product.attributes === 'object' ? product.attributes : {},
        applications: Array.isArray(product.applications)
          ? product.applications.map((a) => ({
              ...emptyApplication,
              ...(typeof a === 'object' && a !== null ? a : { title: String(a || '') }),
            }))
          : [],
        tdsUrl: product.tdsUrl || '',
        isActive: product.isActive !== false,
        isFeatured: product.isFeatured === true,
        isNew: product.isNew === true,
        displayOrder: Number.isFinite(Number(product.displayOrder))
          ? Number(product.displayOrder)
          : 0,
      });
    } catch (error) {
      addNotification('Không tải được thông tin sản phẩm', 'error');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    clearDraft();
    navigate('/products');
  };

  // Keep `marketEntries` aligned with the list of chosen markets.
  // - Entries whose marketId is no longer in marketIds are dropped.
  // - Markets present in marketIds but missing from marketEntries get an empty entry.
  const handleMarketIdsChange = (nextIds) => {
    setFormData((prev) => {
      const nextSet = new Set((nextIds || []).map(String));
      const keptEntries = (prev.marketEntries || []).filter((e) =>
        nextSet.has(String(e.marketId))
      );
      const newEntries = (nextIds || [])
        .filter((id) => !keptEntries.some((e) => String(e.marketId) === String(id)))
        .map((id) => ({
          marketId: id,
          technologyIds: [],
          applicationIds: [],
        }));
      return {
        ...prev,
        marketIds: nextIds || [],
        marketEntries: [...keptEntries, ...newEntries],
      };
    });
  };

  const handleMarketEntriesChange = (nextEntries) => {
    setFormData((prev) => ({ ...prev, marketEntries: nextEntries }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        ...formData,
        attributes: { ...formData.attributes },
        applications: (formData.applications || []).filter(
          (a) => a && (a.title || a.titleEn)
        ),
        industries: (formData.industries || []).filter(Boolean),
        productLines: (formData.productLines || []).filter(Boolean),
        marketIds: (formData.marketIds || []).filter(Boolean),
        marketEntries: (formData.marketEntries || [])
          .filter((e) => e && e.marketId)
          .map((e) => ({
            marketId: String(e.marketId),
            technologyIds: (e.technologyIds || []).map(String).filter(Boolean),
            applicationIds: (e.applicationIds || []).map(String).filter(Boolean),
          })),
      };

      if (isEditing) {
        await adminApi.updateProduct(id, data);
        addNotification('Cập nhật sản phẩm thành công');
      } else {
        await adminApi.createProduct(data);
        addNotification('Thêm sản phẩm thành công');
      }
      clearDraft();
      navigate('/products');
    } catch (error) {
      addNotification(error.response?.data?.message || 'Có lỗi xảy ra', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file) => {
    setUploadingImage(true);
    try {
      const res = await adminApi.uploadImage(file);
      const url = res?.data?.data?.url;
      if (url) {
        setFormData((prev) => ({ ...prev, imageUrl: url }));
        addNotification('Upload ảnh thành công');
      } else {
        addNotification(res?.data?.message || 'Upload ảnh thất bại', 'error');
      }
    } catch (error) {
      addNotification(error?.response?.data?.message || error?.message || 'Upload ảnh thất bại', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleTDSUpload = async (file) => {
    setUploadingTDS(true);
    try {
      const res = await adminApi.uploadPDF(file);
      const url = res?.data?.data?.url;
      if (url) {
        setFormData((prev) => ({ ...prev, tdsUrl: url }));
        addNotification('Upload TDS thành công');
      }
    } catch (error) {
      addNotification(error?.response?.data?.message || 'Upload TDS thất bại', 'error');
    } finally {
      setUploadingTDS(false);
    }
  };

  const handleApplicationImageUpload = async (file, index) => {
    setApplicationUploading(true);
    try {
      const res = await adminApi.uploadImage(file);
      const url = res?.data?.data?.url;
      if (url) {
        setFormData((prev) => {
          const list = [...(prev.applications || [])];
          if (list[index]) {
            list[index] = { ...list[index], imageUrl: url };
            return { ...prev, applications: list };
          }
          return prev;
        });
        addNotification('Upload ảnh thành công');
        return url;
      }
      return null;
    } catch (error) {
      addNotification('Upload ảnh thất bại', 'error');
      return null;
    } finally {
      setApplicationUploading(false);
    }
  };

  if (loading) {
    return (
      <>
        <HeaderWithBreadcrumb
          title={isEditing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
          backTo="/products"
          backLabel="Danh sách sản phẩm"
        />
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </div>
      </>
    );
  }

  return (
    <>
      <SEO title={isEditing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'} description="Quản lý sản phẩm" url="/products" />
      <HeaderWithBreadcrumb
        title={isEditing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
        backTo="/products"
        backLabel="Danh sách sản phẩm"
      />
      {loadedFromDraft && (
        <div className="px-4 pt-3 max-w-4xl">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-3 py-2 flex items-center justify-between text-xs">
            <span>
              Đã khôi phục bản nháp chưa lưu.{' '}
              <button
                type="button"
                onClick={() => {
                  clearDraft();
                  setFormData({ ...emptyForm });
                }}
                className="underline font-medium hover:text-amber-900"
              >
                Bắt đầu lại
              </button>
            </span>
            <button
              type="button"
              onClick={() => clearDraft()}
              className="text-amber-700 hover:text-amber-900"
              aria-label="Đóng thông báo"
            >
              <FiX size={14} />
            </button>
          </div>
        </div>
      )}
      <div className="p-4 pt-3">
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Code */}
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">
                Mã sản phẩm (SKU)
              </label>
              <input
                type="text"
                value={formData.productCode}
                onChange={(e) => setFormData({ ...formData, productCode: e.target.value.toUpperCase() })}
                className="input-field"
                placeholder="VD: M130335"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Mã SKU duy nhất. Tự động uppercase.
              </p>
            </div>

            {/* Tên sản phẩm */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">
                  Tên sản phẩm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="input-field"
                  placeholder="Tên tiếng Việt"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">
                  Tên tiếng Anh
                </label>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  className="input-field"
                  placeholder="English name (tùy chọn)"
                />
              </div>
            </div>

            {/* Phân cấp: Industries (multi) + Product Line (dependent on first industry) */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">
                  Ngành hàng
                </label>
                <MultiIndustrySelect
                  items={mainTrees}
                  selected={formData.industries || []}
                  onChange={(ids) => setFormData({ ...formData, industries: ids })}
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Có thể chọn nhiều ngành nếu sản phẩm phục vụ nhiều lĩnh vực.
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">
                  Danh mục sản phẩm
                </label>
                <MultiProductLineSelect
                  items={categories}
                  selected={formData.productLines || []}
                  onChange={(ids) => setFormData({ ...formData, productLines: ids })}
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Danh mục sản phẩm. Sản phẩm có thể thuộc nhiều danh mục.
                </p>
              </div>
            </div>

            {/* Markets (multi-select, không phụ thuộc ngành) */}
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-800">
                Thị trường ứng dụng
              </label>
              <MultiMarketSelect
                items={marketTrees}
                selected={formData.marketIds || []}
                onChange={handleMarketIdsChange}
              />
              <p className="text-[10px] text-gray-500 mt-1.5 mb-2">
                Chọn các thị trường mà sản phẩm này được sử dụng, sau đó chọn công nghệ và ứng dụng tương ứng trong bảng bên dưới.
              </p>
              {/* Per-market techs & apps table */}
              <MarketAppsTechsPanel
                markets={marketTrees}
                entries={formData.marketEntries || []}
                onChange={handleMarketEntriesChange}
              />
            </div>

            {/* Giá & Trạng thái */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">
                  Hiển thị giá
                </label>
                <select
                  value={formData.priceVisible ? 'price' : 'contact'}
                  onChange={(e) => {
                    const showPrice = e.target.value === 'price';
                    setFormData({ ...formData, priceVisible: showPrice });
                  }}
                  className="input-field"
                >
                  <option value="price">Hiển thị giá</option>
                  <option value="contact">Liên hệ</option>
                </select>
              </div>
              {formData.priceVisible && (
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">
                    Giá (VND)
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) || 0 })}
                    className="input-field"
                    min={0}
                    placeholder="Nhập giá sản phẩm"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">
                  Hiển thị trên web
                </label>
                <select
                  value={formData.webStatus === 'published' ? 'show' : 'hide'}
                  onChange={(e) => {
                    const status = e.target.value === 'show' ? 'published' : 'draft';
                    setFormData({ ...formData, webStatus: status });
                  }}
                  className="input-field"
                >
                  <option value="show">Hiện</option>
                  <option value="hide">Ẩn</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">
                  Thứ tự hiển thị
                </label>
                <input
                  type="number"
                  value={formData.displayOrder ?? 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      displayOrder: Number(e.target.value) || 0,
                    })
                  }
                  className="input-field"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Giao diện trang chủ */}
            <div className="border border-slate-300 rounded-lg p-3 bg-slate-50/30">
              <h3 className="text-xs font-semibold text-slate-700 mb-3">Hiển thị trang chủ</h3>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured === true}
                    onChange={(e) =>
                      setFormData({ ...formData, isFeatured: e.target.checked })
                    }
                    className="rounded w-4 h-4"
                  />
                  <span className="text-xs text-slate-700">
                    Sản phẩm nổi bật
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isNew === true}
                    onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                    className="rounded w-4 h-4"
                  />
                  <span className="text-xs text-slate-700">
                    Sản phẩm mới
                  </span>
                </label>
              </div>
            </div>

            {/* Thông số kỹ thuật */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-gray-700">Thông số kỹ thuật</h3>
                <button
                  type="button"
                  onClick={() => navigate('/products/columns')}
                  className="text-[10px] text-primary hover:underline"
                >
                  Quản lý cột
                </button>
              </div>
              {columns.length > 0 ? (
                <div className="grid md:grid-cols-3 gap-4">
                  {columns.map((column) => (
                    <div key={column._id || column.key}>
                      <label className="block text-xs font-medium mb-1 text-gray-700">
                        {column.name}
                        {column.nameEn && <span className="text-[10px] text-gray-400 ml-1">({column.nameEn})</span>}
                      </label>
                      <input
                        type="text"
                        value={formData.attributes?.[column.key] ?? formData[column.key] ?? ''}
                        onChange={(event) =>
                          setFormData((previous) => ({
                            ...previous,
                            attributes: { ...previous.attributes, [column.key]: event.target.value },
                            ...(column.key in previous ? { [column.key]: event.target.value } : {}),
                          }))
                        }
                        className="input-field"
                        placeholder="Nhập thông số"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-300 px-4 py-5 text-xs text-gray-500">
                  Chưa có cột động. Các trường cũ vẫn có thể nhập bên dưới.
                </div>
              )}
              
            </div>

            {/* Ảnh sản phẩm */}
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">Ảnh sản phẩm</label>
              <div className="flex items-center gap-3">
                {formData.imageUrl ? (
                  <div className="relative group">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-20 h-20 rounded-lg object-cover border"
                      onError={(e) => {
                        e.target.src = '';
                        e.target.classList.add('hidden');
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: '' })}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiX size={10} />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                    <FiImage size={20} />
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <label className="btn-secondary flex items-center gap-1 text-xs cursor-pointer">
                    <FiUpload size={14} />
                    {uploadingImage ? 'Đang upload...' : 'Upload ảnh'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                        e.target.value = '';
                      }}
                    />
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="input-field text-xs"
                    placeholder="Hoặc nhập URL"
                  />
                </div>
              </div>
            </div>

            {/* Mô tả */}
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">Mô tả (tiếng Việt)</label>
              <RichEditor
                value={formData.description}
                onChange={(value) => setFormData({ ...formData, description: value })}
                placeholder="Nhập mô tả sản phẩm (tiếng Việt)..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">Mô tả (tiếng Anh)</label>
              <RichEditor
                value={formData.descriptionEn}
                onChange={(value) => setFormData({ ...formData, descriptionEn: value })}
                placeholder="English description (optional)"
              />
            </div>

            {/* Applications — list of structured entries */}
            <ApplicationEditor
              items={formData.applications || []}
              onChange={(next) => setFormData({ ...formData, applications: next })}
              onUpload={handleApplicationImageUpload}
              uploading={applicationUploading}
            />

            {/* TDS File */}
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">File TDS (PDF)</label>
              <div className="flex items-center gap-2">
                {formData.tdsUrl ? (
                  <a
                    href={formData.tdsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 px-3 py-2 bg-blue-50 rounded-lg"
                  >
                    <FiFile size={14} />
                    Xem file hiện tại
                  </a>
                ) : (
                  <span className="text-xs text-gray-400 px-3 py-2">Chưa có file</span>
                )}
                <label className="btn-secondary flex items-center gap-1 text-xs cursor-pointer">
                  <FiUpload size={14} />
                  {uploadingTDS ? 'Đang upload...' : 'Upload PDF'}
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleTDSUpload(file);
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Trạng thái */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700">Đang hoạt động</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t">
              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                <FiArrowLeft size={16} />
                Quay lại
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <FiSave size={16} />
                {saving ? 'Đang lưu...' : isEditing ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ProductForm;