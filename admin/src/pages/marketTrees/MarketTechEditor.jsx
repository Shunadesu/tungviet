import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiArrowLeft,
  FiSave,
  FiCpu,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiImage,
  FiCheck,
  FiX,
} from 'react-icons/fi';
import HeaderWithBreadcrumb from '../settings/HeaderWithBreadcrumb';
import Modal from '../../components/Modal';
import SEO from '../../components/SEO';
import Skeleton from '../../components/Skeleton';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../context/NotificationContext';
import SubDocEditorCard, { emptySubDoc } from '../../components/SubDocEditorCard';

const MarketTechEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingSubDoc, setUploadingSubDoc] = useState(false);
  const [parentName, setParentName] = useState('');
  const [availableMainTrees, setAvailableMainTrees] = useState([]);
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState({ open: false, index: null });

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [treeRes, mtRes] = await Promise.all([
          adminApi.getMarketTree(id),
          adminApi.getMainTrees({ isActive: true }),
        ]);
        const tree = treeRes.data?.data;
        if (!tree) {
          addNotification('Không tìm thấy cây ngành', 'error');
          navigate('/market-trees');
          return;
        }
        setParentName(tree.title || '');
        const techs = Array.isArray(tree.technologies) ? tree.technologies : [];
        setItems(
          techs.map((t) => ({
            ...emptySubDoc,
            ...t,
            linkToMainTree: t.linkToMainTree?._id || t.linkToMainTree || null,
          }))
        );
        const list = Array.isArray(mtRes.data) ? mtRes.data : mtRes.data?.data || [];
        setAvailableMainTrees(list.filter((mt) => mt._id !== id));
      } catch (err) {
        addNotification(err.response?.data?.message || 'Không thể tải dữ liệu', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, [id, navigate, addNotification]);

  const openEdit = (index) => setModal({ open: true, index });
  const closeModal = () => setModal({ open: false, index: null });

  const addItem = () => {
    const newIndex = items.length;
    setItems((prev) => [
      ...prev,
      { ...emptySubDoc, order: prev.length, _new: true },
    ]);
    setModal({ open: true, index: newIndex });
  };

  const updateItem = (index, item) =>
    setItems((prev) => prev.map((it, i) => (i === index ? item : it)));

  const removeItem = (index) => {
    if (!window.confirm('Bạn có chắc muốn xoá công nghệ này?')) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubDocImageUpload = async (index, file) => {
    setUploadingSubDoc(true);
    try {
      const res = await adminApi.uploadImage(file);
      const url = res?.data?.data?.url;
      if (url) {
        updateItem(index, { ...items[index], imageUrl: url });
        addNotification('Upload ảnh thành công');
      }
    } catch (err) {
      addNotification('Upload ảnh thất bại', 'error');
    } finally {
      setUploadingSubDoc(false);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const payload = {
        technologies: items.map((t) => ({
          ...t,
          description: t.description || undefined,
          descriptionEn: t.descriptionEn || undefined,
        })),
      };
      await adminApi.updateMarketTree(id, payload);
      addNotification(`Đã lưu ${items.length} công nghệ`);
      navigate(`/market-trees/${id}/edit`);
    } catch (err) {
      addNotification(err.response?.data?.message || 'Có lỗi xảy ra', 'error');
    } finally {
      setSaving(false);
    }
  };

  const stats = useMemo(() => {
    const valid = items.filter((it) => it.title && it.title.trim()).length;
    return { total: items.length, valid };
  }, [items]);

  const modalItem =
    modal.open && modal.index !== null ? items[modal.index] : null;

  return (
    <>
      <SEO title="Quản lý công nghệ" description="Quản lý công nghệ cây ngành" url="/market-trees" />
      <HeaderWithBreadcrumb
        title="Công nghệ"
        breadcrumbs={[
          { label: 'Cây ngành thị trường', path: '/market-trees' },
          { label: parentName || '...', path: `/market-trees/${id}/edit` },
          { label: 'Công nghệ' },
        ]}
        actions={
          <button
            type="button"
            onClick={() => navigate(`/market-trees/${id}/edit`)}
            className="btn-secondary flex items-center gap-1.5 text-xs"
          >
            <FiArrowLeft size={14} />
            Quay lại
          </button>
        }
      />

      <div className="p-4">
        <div className="card mx-auto space-y-3">
          {/* Toolbar */}
          <div className="flex flex-wrap gap-2 items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <FiCpu className="text-primary" size={18} />
              <h2 className="text-sm font-semibold text-gray-700">
                Công nghệ · {stats.valid}/{stats.total} hợp lệ
              </h2>
            </div>
            <button
              type="button"
              onClick={addItem}
              disabled={loading}
              className="btn-primary flex items-center gap-1 text-xs disabled:opacity-50"
            >
              <FiPlus size={12} />
              Thêm công nghệ
            </button>
          </div>

          {loading ? (
            <Skeleton.Editor rows={3} />
          ) : items.length === 0 ? (
            <p className="text-xs text-gray-400 italic py-6 text-center">
              Chưa có công nghệ nào. Bấm "Thêm công nghệ" để bắt đầu.
            </p>
          ) : (
            <div className="overflow-x-auto -mx-3 px-3">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wide">
                    <th className="px-2 py-2 w-10">#</th>
                    <th className="px-2 py-2 w-14">Ảnh</th>
                    <th className="px-2 py-2 min-w-[220px]">Tiêu đề</th>
                    <th className="px-2 py-2 text-center w-16">Thứ tự</th>
                    <th className="px-2 py-2 text-center w-20">Hiển thị</th>
                    <th className="px-2 py-2 text-center w-16">Link</th>
                    <th className="px-2 py-2 text-right w-28">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => {
                    const hasLink = !!(item.linkToMainTree || item.linkCustomUrl);
                    return (
                      <tr
                        key={item._id || `new-${idx}`}
                        className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors"
                      >
                        <td className="px-2 py-2 align-middle text-gray-400 font-mono text-[10px]">
                          {idx + 1}
                        </td>
                        <td className="px-2 py-2 align-middle">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt=""
                              className="w-9 h-9 rounded object-cover border"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-9 h-9 rounded bg-gray-100 text-gray-400 flex items-center justify-center">
                              <FiImage size={14} />
                            </div>
                          )}
                        </td>
                        <td className="px-2 py-2 align-middle">
                          <div className="font-medium text-gray-800 truncate max-w-[260px]">
                            {item.title || (
                              <span className="italic text-gray-400">(Chưa đặt tên)</span>
                            )}
                          </div>
                          {item.titleEn && (
                            <div className="text-[11px] text-gray-500 truncate max-w-[260px] mt-0.5">
                              {item.titleEn}
                            </div>
                          )}
                        </td>
                        <td className="px-2 py-2 align-middle text-center">
                          <input
                            type="number"
                            value={item.order ?? 0}
                            onChange={(e) =>
                              updateItem(idx, {
                                ...item,
                                order: Number(e.target.value) || 0,
                              })
                            }
                            className="input-field text-xs w-14 text-center"
                          />
                        </td>
                        <td className="px-2 py-2 align-middle text-center">
                          <button
                            type="button"
                            onClick={() =>
                              updateItem(idx, {
                                ...item,
                                isActive: item.isActive === false,
                              })
                            }
                            className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-semibold transition-colors ${
                              item.isActive !== false
                                ? 'bg-green-50 text-green-700 hover:bg-green-100'
                                : 'bg-red-50 text-red-500 hover:bg-red-100'
                            }`}
                            title={item.isActive !== false ? 'Đang hiển thị' : 'Đang ẩn'}
                          >
                            {item.isActive !== false ? <FiCheck size={10} /> : <FiX size={10} />}
                            {item.isActive !== false ? 'Hiện' : 'Ẩn'}
                          </button>
                        </td>
                        <td className="px-2 py-2 align-middle text-center">
                          {hasLink ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">
                              ✓
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-2 py-2 align-middle text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => openEdit(idx)}
                              className="p-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                              title="Sửa"
                            >
                              <FiEdit2 size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeItem(idx)}
                              className="p-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
                              title="Xóa"
                            >
                              <FiTrash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => navigate(`/market-trees/${id}/edit`)}
              className="btn-secondary text-xs"
              disabled={saving}
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="btn-primary text-xs flex items-center gap-1.5 disabled:opacity-50"
              disabled={saving || loading}
            >
              <FiSave size={14} />
              {saving ? 'Đang lưu...' : 'Lưu tất cả'}
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={modal.open}
        onClose={closeModal}
        title={modalItem?.title ? `Sửa công nghệ: ${modalItem.title}` : 'Sửa công nghệ'}
        size="xl"
      >
        {modalItem && modal.index !== null && (
          <SubDocEditorCard
            item={modalItem}
            index={modal.index}
            kind="technologies"
            defaultExpanded={true}
            onUpdate={(next) => updateItem(modal.index, next)}
            onRemove={() => {
              removeItem(modal.index);
              closeModal();
            }}
            onUploadImage={(file) => handleSubDocImageUpload(modal.index, file)}
            uploadingImage={uploadingSubDoc}
            availableMainTrees={availableMainTrees}
          />
        )}
      </Modal>
    </>
  );
};

export default MarketTechEditor;
