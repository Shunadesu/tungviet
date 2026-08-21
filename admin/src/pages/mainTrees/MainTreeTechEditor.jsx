import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiArrowLeft,
  FiSave,
  FiCpu,
  FiPlus,
} from 'react-icons/fi';
import HeaderWithBreadcrumb from '../settings/HeaderWithBreadcrumb';
import SEO from '../../components/SEO';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../context/NotificationContext';
import SubDocEditorCard, { emptySubDoc } from '../../components/SubDocEditorCard';

const MainTreeTechEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingSubDoc, setUploadingSubDoc] = useState(false);
  const [parentName, setParentName] = useState('');
  const [availableMainTrees, setAvailableMainTrees] = useState([]);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [treeRes, mtRes] = await Promise.all([
          adminApi.getMainTree(id),
          adminApi.getMainTrees({ isActive: true }),
        ]);
        const tree = treeRes.data?.data;
        if (!tree) {
          addNotification('Không tìm thấy ngành hàng', 'error');
          navigate('/main-trees');
          return;
        }
        setParentName(tree.name || '');
        setItems(
          Array.isArray(tree.technologies)
            ? tree.technologies.map((t) => ({
                ...emptySubDoc,
                ...t,
                linkToMainTree: t.linkToMainTree?._id || t.linkToMainTree || null,
              }))
            : []
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

  const addItem = () =>
    setItems((prev) => [
      ...prev,
      { ...emptySubDoc, order: prev.length, _new: true },
    ]);
  const updateItem = (index, item) =>
    setItems((prev) => prev.map((it, i) => (i === index ? item : it)));
  const removeItem = (index) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

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
      await adminApi.updateMainTree(id, payload);
      addNotification(`Đã lưu ${items.length} công nghệ`);
      navigate(`/main-trees/${id}/edit`);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <>
      <SEO title="Quản lý công nghệ ngành hàng" description="Quản lý công nghệ" url="/main-trees" />
      <HeaderWithBreadcrumb
        title="Công nghệ"
        breadcrumbs={[
          { label: 'Cây ngành sản phẩm', path: '/main-trees' },
          { label: parentName || '...', path: `/main-trees/${id}/edit` },
          { label: 'Công nghệ' },
        ]}
        actions={
          <button
            type="button"
            onClick={() => navigate(`/main-trees/${id}/edit`)}
            className="btn-secondary flex items-center gap-1.5 text-xs"
          >
            <FiArrowLeft size={14} />
            Quay lại
          </button>
        }
      />

      <div className="p-4">
        <div className="card max-w-4xl mx-auto space-y-3">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <FiCpu className="text-primary" size={18} />
              <h2 className="text-sm font-semibold text-gray-700">
                Công nghệ (technologies) · {stats.valid}/{stats.total} hợp lệ
              </h2>
            </div>
            <button
              type="button"
              onClick={addItem}
              className="btn-primary flex items-center gap-1 text-xs"
            >
              <FiPlus size={12} />
              Thêm công nghệ
            </button>
          </div>

          {items.length === 0 ? (
            <p className="text-xs text-gray-400 italic py-6 text-center">
              Chưa có công nghệ nào. Bấm "Thêm công nghệ" để bắt đầu.
            </p>
          ) : (
            <div className="space-y-2">
              {items.map((item, idx) => (
                <SubDocEditorCard
                  key={`tech-${idx}-${item._id || 'new'}`}
                  item={item}
                  index={idx}
                  kind="technologies"
                  defaultExpanded={!!item._new}
                  onUpdate={(next) => updateItem(idx, next)}
                  onRemove={() => removeItem(idx)}
                  onUploadImage={(file) => handleSubDocImageUpload(idx, file)}
                  uploadingImage={uploadingSubDoc}
                  availableMainTrees={availableMainTrees}
                />
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => navigate(`/main-trees/${id}/edit`)}
              className="btn-secondary text-xs"
              disabled={saving}
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="btn-primary text-xs flex items-center gap-1.5 disabled:opacity-50"
              disabled={saving}
            >
              <FiSave size={14} />
              {saving ? 'Đang lưu...' : 'Lưu tất cả'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MainTreeTechEditor;