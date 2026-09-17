import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft,
  FiSave,
  FiCpu,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiChevronDown,
  FiChevronUp,
  FiImage,
  FiPackage,
  FiList,
  FiCheck,
  FiX,
} from 'react-icons/fi';
import HeaderWithBreadcrumb from '../settings/HeaderWithBreadcrumb';
import SEO from '../../components/SEO';
import Skeleton from '../../components/Skeleton';
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
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [items, setItems] = useState([]);
  const [expandedIds, setExpandedIds] = useState(() => new Set());

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [treeRes, mtRes, categoriesRes, productsRes] = await Promise.all([
          adminApi.getMainTree(id),
          adminApi.getMainTrees({ isActive: true }),
          adminApi.getCategories({ isActive: true }),
          adminApi.getProducts({ isActive: true }),
        ]);
        const tree = treeRes.data?.data;
        if (!tree) {
          addNotification('Không tìm thấy ngành hàng', 'error');
          navigate('/main-trees');
          return;
        }
        setParentName(tree.name || '');
        const techs = Array.isArray(tree.technologies) ? tree.technologies : [];
        setItems(
          techs.map((t) => ({
            ...emptySubDoc,
            ...t,
            linkToMainTree: t.linkToMainTree?._id || t.linkToMainTree || null,
            productLines: Array.isArray(t.productLines)
              ? t.productLines.map((pl) => pl._id || pl)
              : [],
            applications: Array.isArray(t.applications) ? t.applications : [],
          }))
        );
        // Auto-expand newly-added items
        setExpandedIds(new Set(techs.map((t) => t._id).filter(Boolean)));
        const list = Array.isArray(mtRes.data) ? mtRes.data : mtRes.data?.data || [];
        setAvailableMainTrees(list.filter((mt) => mt._id !== id));

        const catList = Array.isArray(categoriesRes.data)
          ? categoriesRes.data
          : categoriesRes.data?.data || [];
        setCategories(catList);

        const prodList = Array.isArray(productsRes.data)
          ? productsRes.data
          : productsRes.data?.data || [];
        setAllProducts(prodList);
      } catch (err) {
        addNotification(err.response?.data?.message || 'Không thể tải dữ liệu', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, [id, navigate, addNotification]);

  const addItem = () =>
    setItems((prev) => {
      const next = [
        ...prev,
        {
          ...emptySubDoc,
          order: prev.length,
          _new: true,
          productLines: [],
          applications: [],
        },
      ];
      const lastIdx = next.length - 1;
      // Expand newly added item
      setExpandedIds((prevIds) => {
        const set = new Set(prevIds);
        set.add(`new-${lastIdx}`);
        return set;
      });
      return next;
    });

  const updateItem = (index, item) =>
    setItems((prev) => prev.map((it, i) => (i === index ? item : it)));
  const removeItem = (index) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  const toggleExpand = (rowId) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) next.delete(rowId);
      else next.add(rowId);
      return next;
    });
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
          productLines: t.productLines || [],
          applications: t.applications || [],
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

  const rowKey = (item, idx) => item._id || `new-${idx}`;

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
        <div className="card mx-auto space-y-3">
          {/* Toolbar */}
          <div className="flex flex-wrap gap-2 items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <FiCpu className="text-primary" size={18} />
              <h2 className="text-sm font-semibold text-gray-700">
                Công nghệ · {stats.valid}/{stats.total} hợp lệ
              </h2>
              {expandedIds.size > 0 && items.length > 0 && (
                <button
                  type="button"
                  onClick={() => setExpandedIds(new Set())}
                  className="text-[10px] text-gray-500 hover:text-gray-700 underline"
                >
                  Thu gọn tất cả
                </button>
              )}
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

          {/* Body: Table or Skeleton */}
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
                    <th className="px-2 py-2 w-8"></th>
                    <th className="px-2 py-2 w-10">#</th>
                    <th className="px-2 py-2 w-14">Ảnh</th>
                    <th className="px-2 py-2 min-w-[220px]">Tiêu đề</th>
                    <th className="px-2 py-2 text-center w-16">Thứ tự</th>
                    <th className="px-2 py-2 text-center w-20">Hiển thị</th>
                    <th className="px-2 py-2 text-center w-20">
                      <span className="inline-flex items-center gap-1 normal-case">
                        <FiList size={11} /> Specs
                      </span>
                    </th>
                    <th className="px-2 py-2 text-center w-20">
                      <span className="inline-flex items-center gap-1 normal-case">
                        <FiPackage size={11} /> App
                      </span>
                    </th>
                    <th className="px-2 py-2 text-center w-16">Link</th>
                    <th className="px-2 py-2 text-right w-32">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => {
                    const key = rowKey(item, idx);
                    const isOpen = expandedIds.has(key);
                    const specCount = (item.specifications || []).length;
                    const appCount = (item.applications || []).length;
                    const productLineCount = (item.productLines || []).length;
                    const hasLink = !!(item.linkToMainTree || item.linkCustomUrl);
                    return (
                      <>
                        <tr
                          key={key}
                          className={`border-b border-gray-100 hover:bg-blue-50/30 transition-colors ${
                            isOpen ? 'bg-blue-50/40' : ''
                          }`}
                        >
                          <td className="px-2 py-2 align-middle">
                            <button
                              type="button"
                              onClick={() => toggleExpand(key)}
                              className="p-1 hover:bg-blue-100 text-blue-600 rounded transition-transform"
                              title={isOpen ? 'Thu gọn' : 'Mở rộng'}
                            >
                              {isOpen ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                            </button>
                          </td>
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
                            {productLineCount > 0 && (
                              <div className="text-[10px] text-gray-400 mt-0.5">
                                {productLineCount} product line{productLineCount > 1 ? 's' : ''}
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
                            <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-semibold">
                              {specCount}
                            </span>
                          </td>
                          <td className="px-2 py-2 align-middle text-center">
                            <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold">
                              {appCount}
                            </span>
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
                                onClick={() => toggleExpand(key)}
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
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <tr key={`${key}-detail`}>
                              <td colSpan={10} className="p-0 border-b border-gray-100 bg-gray-50/40">
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.2, ease: 'easeOut' }}
                                  style={{ overflow: 'hidden' }}
                                >
                                  <div className="p-3">
                                    <SubDocEditorCard
                                      item={item}
                                      index={idx}
                                      kind="technologies"
                                      defaultExpanded={true}
                                      onUpdate={(next) => updateItem(idx, next)}
                                      onRemove={() => removeItem(idx)}
                                      onUploadImage={(file) => handleSubDocImageUpload(idx, file)}
                                      uploadingImage={uploadingSubDoc}
                                      availableMainTrees={availableMainTrees}
                                      availableCategories={categories}
                                      allProducts={allProducts}
                                    />
                                  </div>
                                </motion.div>
                              </td>
                            </tr>
                          )}
                        </AnimatePresence>
                      </>
                    );
                  })}
                </tbody>
              </table>
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
              disabled={saving || loading}
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
