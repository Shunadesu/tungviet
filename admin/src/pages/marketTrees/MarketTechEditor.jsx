import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft,
  FiSave,
  FiCpu,
  FiPackage,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiChevronDown,
  FiChevronUp,
  FiImage,
  FiUpload,
  FiLink,
  FiExternalLink,
  FiCheck,
  FiX,
} from 'react-icons/fi';
import HeaderWithBreadcrumb from '../settings/HeaderWithBreadcrumb';
import SEO from '../../components/SEO';
import Skeleton from '../../components/Skeleton';
import RichEditor from '../../components/RichEditor';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../context/NotificationContext';

const emptyApplication = {
  title: '',
  titleEn: '',
  description: '',
  descriptionEn: '',
  imageUrl: '',
  order: 0,
  isActive: true,
  linkToMainTree: null,
  linkCustomUrl: '',
  productEntries: [],
};

const emptySubDoc = {
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

const ApplicationRow = ({
  application,
  appIndex,
  availableMainTrees,
  availableProducts,
  productMap,
  currentApplications,
  onUpdate,
  onRemove,
  onUploadImage,
  uploadingImage,
  onAddProduct,
  onUpdateProductEntry,
  onRemoveProduct,
}) => {
  const [expanded, setExpanded] = useState(false);
  const productEntries = Array.isArray(application.productEntries) ? application.productEntries : [];

  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      <div className="flex items-center justify-between gap-2 p-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {application.imageUrl ? (
            <img
              src={application.imageUrl}
              alt=""
              className="w-7 h-7 rounded object-cover border flex-shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-7 h-7 rounded bg-gray-100 text-gray-400 flex items-center justify-center flex-shrink-0">
              <FiImage size={12} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold text-gray-700 truncate">
              #{appIndex + 1} {application.title || '(Chưa đặt tên)'}
            </div>
            {application.titleEn && (
              <div className="text-[10px] text-gray-400 truncate">{application.titleEn}</div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div>
            <input
              type="number"
              value={application.order ?? 0}
              onChange={(e) =>
                onUpdate({ ...application, order: Number(e.target.value) || 0 })
              }
              className="input-field text-[10px] w-14 text-center"
              title="Thứ tự"
            />
          </div>
          <button
            type="button"
            onClick={() =>
              onUpdate({ ...application, isActive: application.isActive === false })
            }
            className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-semibold transition-colors ${
              application.isActive !== false
                ? 'bg-green-50 text-green-700 hover:bg-green-100'
                : 'bg-red-50 text-red-500 hover:bg-red-100'
            }`}
            title={application.isActive !== false ? 'Đang hiển thị' : 'Đang ẩn'}
          >
            {application.isActive !== false ? <FiCheck size={10} /> : <FiX size={10} />}
            {application.isActive !== false ? 'Hiện' : 'Ẩn'}
          </button>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="p-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
            title={expanded ? 'Thu gọn' : 'Sửa'}
          >
            {expanded ? <FiChevronUp size={12} /> : <FiEdit2 size={12} />}
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
        <div className="px-2 pb-2 space-y-2 border-t border-gray-100 pt-2">
          <div className="grid md:grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-medium mb-0.5 text-gray-700">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={application.title}
                onChange={(e) => onUpdate({ ...application, title: e.target.value })}
                className="input-field text-xs"
                placeholder="VD: Sơn lót nội thất"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium mb-0.5 text-gray-700">
                Tiêu đề tiếng Anh
              </label>
              <input
                type="text"
                value={application.titleEn}
                onChange={(e) => onUpdate({ ...application, titleEn: e.target.value })}
                className="input-field text-xs"
                placeholder="English title"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-medium mb-0.5 text-gray-700">Mô tả</label>
            <RichEditor
              value={application.description}
              onChange={(value) => onUpdate({ ...application, description: value })}
              placeholder="Mô tả..."
              minHeight={80}
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium mb-0.5 text-gray-700">Hình ảnh</label>
            <div className="flex items-center gap-2">
              {application.imageUrl ? (
                <img
                  src={application.imageUrl}
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
                value={application.imageUrl}
                onChange={(e) => onUpdate({ ...application, imageUrl: e.target.value })}
                className="input-field text-[10px] flex-1"
                placeholder="Hoặc URL"
              />
            </div>
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
                  value={application.linkToMainTree || ''}
                  onChange={(e) =>
                    onUpdate({ ...application, linkToMainTree: e.target.value || null })
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
                  value={application.linkCustomUrl || ''}
                  onChange={(e) =>
                    onUpdate({ ...application, linkCustomUrl: e.target.value })
                  }
                  className="input-field text-[10px]"
                  placeholder="https://... hoặc /duong-dan"
                />
              </div>
            </div>
          </div>

          {/* Product entries inside this application */}
          <div className="border-t border-gray-100 pt-2 mt-2">
            <label className="block text-[10px] font-medium mb-1 text-gray-700 flex items-center gap-1">
              <FiPackage size={11} />
              Sản phẩm sử dụng ({productEntries.length} đã chọn)
            </label>
            {(() => {
              const usedIds = new Set(
                productEntries.map((entry) => String(entry.productId))
              );
              const candidates = (availableProducts || []).filter(
                (p) => !usedIds.has(String(p._id))
              );
              if (candidates.length === 0) {
                return (
                  <p className="text-[10px] text-gray-400 italic">
                    {(availableProducts || []).length === 0
                      ? 'Chưa có sản phẩm nào trong hệ thống.'
                      : 'Đã thêm tất cả sản phẩm.'}
                  </p>
                );
              }
              return (
                <select
                  value=""
                  onChange={(e) => {
                    const value = e.target.value;
                    e.target.value = '';
                    if (value) onAddProduct(value);
                  }}
                  className="input-field text-xs w-full"
                >
                  <option value="">-- Chọn sản phẩm để thêm --</option>
                  {candidates.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                      {p.productCode ? ` (${p.productCode})` : ''}
                    </option>
                  ))}
                </select>
              );
            })()}
            <div className="space-y-1 mt-2">
              {productEntries.map((entry, eIdx) => {
                const product = productMap.get(String(entry.productId));
                return (
                  <div
                    key={`entry-${appIndex}-${eIdx}`}
                    className="flex items-start gap-2 p-2 border border-gray-100 rounded bg-white"
                  >
                    {product?.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt=""
                        className="w-10 h-10 rounded object-cover border flex-shrink-0"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-gray-100 text-gray-400 flex items-center justify-center flex-shrink-0">
                        <FiPackage size={14} />
                      </div>
                    )}
                    <div className="min-w-0 flex-1 grid md:grid-cols-2 gap-2">
                      <div className="min-w-0">
                        <div className="text-[10px] text-gray-500 mb-0.5">Sản phẩm</div>
                        <div className="text-xs font-medium truncate">
                          {product?.name || `Sản phẩm #${entry.productId}`}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-500 mb-0.5">Ứng dụng (index)</div>
                        <select
                          value={entry.applicationIndex ?? -1}
                          onChange={(e) =>
                            onUpdateProductEntry(eIdx, {
                              productId: entry.productId,
                              applicationIndex: Number(e.target.value),
                            })
                          }
                          className="input-field text-[10px]"
                        >
                          <option value={-1}>-- Chưa chọn --</option>
                          {(currentApplications || []).map((app, idx) => (
                            <option key={app._id || idx} value={idx}>
                              #{idx + 1} {app.title || app.titleEn || '(không tên)'}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveProduct(entry.productId)}
                      className="p-1 bg-red-50 text-red-600 rounded hover:bg-red-100 flex-shrink-0"
                      title="Bỏ sản phẩm"
                    >
                      <FiTrash2 size={12} />
                    </button>
                  </div>
                );
              })}
              {productEntries.length === 0 && (
                <p className="text-[10px] text-gray-400 italic">
                  Chưa chọn sản phẩm nào cho ứng dụng này.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MarketTechEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingSubDoc, setUploadingSubDoc] = useState(false);
  const [uploadingApp, setUploadingApp] = useState(false);
  const [parentName, setParentName] = useState('');
  const [availableMainTrees, setAvailableMainTrees] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [items, setItems] = useState([]);
  const [expandedTechIds, setExpandedTechIds] = useState(() => new Set());

  const productMap = useMemo(() => {
    const map = new Map();
    for (const p of availableProducts) if (p && p._id) map.set(String(p._id), p);
    return map;
  }, [availableProducts]);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [treeRes, mtRes, prodRes] = await Promise.all([
          adminApi.getMarketTree(id),
          adminApi.getMainTrees({ isActive: true }),
          adminApi.getProducts({ limit: 200 }),
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
            applications: Array.isArray(t.applications)
              ? t.applications.map((a) => ({
                  ...emptyApplication,
                  ...a,
                  linkToMainTree: a.linkToMainTree?._id || a.linkToMainTree || null,
                  productEntries: Array.isArray(a.productEntries)
                    ? a.productEntries.map((entry) => ({
                        productId:
                          entry.productId?._id || entry.productId || null,
                        applicationIndex: Number.isFinite(entry.applicationIndex)
                          ? entry.applicationIndex
                          : -1,
                      }))
                    : [],
                }))
              : [],
          }))
        );
        const list = Array.isArray(mtRes.data) ? mtRes.data : mtRes.data?.data || [];
        setAvailableMainTrees(list.filter((mt) => mt._id !== id));
        setAvailableProducts(
          Array.isArray(prodRes.data?.data) ? prodRes.data.data : []
        );
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
        { ...emptySubDoc, order: prev.length, applications: [], _new: true },
      ];
      const lastIdx = next.length - 1;
      setExpandedTechIds((prevIds) => {
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

  const toggleExpandTech = (rowId) => {
    setExpandedTechIds((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) next.delete(rowId);
      else next.add(rowId);
      return next;
    });
  };

  const handleTechImageUpload = async (index, file) => {
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

  const addApplication = (techIndex) => {
    setItems((prev) => {
      const list = [...prev];
      const tech = list[techIndex];
      const apps = Array.isArray(tech.applications) ? [...tech.applications] : [];
      const newApp = {
        ...emptyApplication,
        order: apps.length,
        _new: true,
      };
      apps.push(newApp);
      list[techIndex] = { ...tech, applications: apps };
      return list;
    });
  };

  const updateApplication = (techIndex, appIndex, next) => {
    setItems((prev) => {
      const list = [...prev];
      const tech = list[techIndex];
      const apps = [...(tech.applications || [])];
      apps[appIndex] = next;
      list[techIndex] = { ...tech, applications: apps };
      return list;
    });
  };

  const removeApplication = (techIndex, appIndex) => {
    setItems((prev) => {
      const list = [...prev];
      const tech = list[techIndex];
      const apps = (tech.applications || []).filter((_, i) => i !== appIndex);
      list[techIndex] = { ...tech, applications: apps };
      return list;
    });
  };

  const handleAppImageUpload = async (techIndex, appIndex, file) => {
    setUploadingApp(true);
    try {
      const res = await adminApi.uploadImage(file);
      const url = res?.data?.data?.url;
      if (url) {
        const tech = items[techIndex];
        const apps = [...(tech.applications || [])];
        apps[appIndex] = { ...apps[appIndex], imageUrl: url };
        updateItem(techIndex, { ...tech, applications: apps });
        addNotification('Upload ảnh thành công');
      }
    } catch (err) {
      addNotification('Upload ảnh thất bại', 'error');
    } finally {
      setUploadingApp(false);
    }
  };

  const addProductToApp = (techIndex, appIndex, productId) => {
    setItems((prev) => {
      const list = [...prev];
      const tech = list[techIndex];
      const apps = [...(tech.applications || [])];
      const current = Array.isArray(apps[appIndex].productEntries)
        ? [...apps[appIndex].productEntries]
        : [];
      if (current.some((entry) => String(entry.productId) === String(productId))) {
        return prev;
      }
      const product = productMap.get(String(productId));
      const firstIdx =
        product && Array.isArray(product.applications) && product.applications.length > 0
          ? 0
          : -1;
      current.push({ productId, applicationIndex: firstIdx });
      apps[appIndex] = { ...apps[appIndex], productEntries: current };
      list[techIndex] = { ...tech, applications: apps };
      return list;
    });
  };

  const updateAppProductEntries = (techIndex, appIndex, entries) => {
    setItems((prev) => {
      const list = [...prev];
      const tech = list[techIndex];
      const apps = [...(tech.applications || [])];
      apps[appIndex] = { ...apps[appIndex], productEntries: entries };
      list[techIndex] = { ...tech, applications: apps };
      return list;
    });
  };

  const removeAppProduct = (techIndex, appIndex, productId) => {
    setItems((prev) => {
      const list = [...prev];
      const tech = list[techIndex];
      const apps = [...(tech.applications || [])];
      const current = (apps[appIndex].productEntries || []).filter(
        (entry) => String(entry.productId) !== String(productId)
      );
      apps[appIndex] = { ...apps[appIndex], productEntries: current };
      list[techIndex] = { ...tech, applications: apps };
      return list;
    });
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const payload = {
        technologies: items.map((t) => ({
          ...t,
          description: t.description || undefined,
          descriptionEn: t.descriptionEn || undefined,
          applications: (t.applications || []).map((a) => ({
            ...a,
            description: a.description || undefined,
            descriptionEn: a.descriptionEn || undefined,
            productEntries: (a.productEntries || []).filter(
              (entry) =>
                entry.productId &&
                Number.isFinite(entry.applicationIndex) &&
                entry.applicationIndex >= 0
            ),
          })),
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
    const totalApps = items.reduce(
      (sum, it) => sum + ((it.applications || []).length),
      0
    );
    return { total: items.length, valid, totalApps };
  }, [items]);

  const rowKey = (item, idx) => item._id || `new-${idx}`;

  return (
    <>
      <SEO
        title="Quản lý công nghệ"
        description="Quản lý công nghệ cây ngành"
        url="/market-trees"
      />
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
          <div className="flex flex-wrap gap-2 items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <FiCpu className="text-primary" size={18} />
              <h2 className="text-sm font-semibold text-gray-700">
                Công nghệ · {stats.valid}/{stats.total} hợp lệ · {stats.totalApps} ứng dụng lồng
              </h2>
              {expandedTechIds.size > 0 && items.length > 0 && (
                <button
                  type="button"
                  onClick={() => setExpandedTechIds(new Set())}
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
                    <th className="px-2 py-2 text-center w-16">App</th>
                    <th className="px-2 py-2 text-center w-16">Link</th>
                    <th className="px-2 py-2 text-right w-28">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, techIndex) => {
                    const key = rowKey(item, techIndex);
                    const isOpen = expandedTechIds.has(key);
                    const appCount = (item.applications || []).length;
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
                              onClick={() => toggleExpandTech(key)}
                              className="p-1 hover:bg-blue-100 text-blue-600 rounded transition-transform"
                              title={isOpen ? 'Thu gọn' : 'Mở rộng'}
                            >
                              {isOpen ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                            </button>
                          </td>
                          <td className="px-2 py-2 align-middle text-gray-400 font-mono text-[10px]">
                            {techIndex + 1}
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
                                updateItem(techIndex, {
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
                                updateItem(techIndex, {
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
                            <span
                              className={`inline-block text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                                appCount > 0
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-gray-50 text-gray-400'
                              }`}
                            >
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
                                onClick={() => toggleExpandTech(key)}
                                className="p-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                                title="Sửa"
                              >
                                <FiEdit2 size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeItem(techIndex)}
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
                              <td colSpan={9} className="p-0 border-b border-gray-100 bg-gray-50/40">
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.2, ease: 'easeOut' }}
                                  style={{ overflow: 'hidden' }}
                                >
                                  <div className="p-3 space-y-3">
                                    {/* Tech meta */}
                                    <div className="grid md:grid-cols-2 gap-3 bg-white border border-gray-100 rounded p-3">
                                      <div>
                                        <label className="block text-[10px] font-medium mb-0.5 text-gray-700">
                                          Tiêu đề công nghệ <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                          type="text"
                                          value={item.title}
                                          onChange={(e) =>
                                            updateItem(techIndex, { ...item, title: e.target.value })
                                          }
                                          className="input-field text-xs"
                                          placeholder="VD: Công nghệ chống thấm"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-medium mb-0.5 text-gray-700">
                                          Tiêu đề tiếng Anh
                                        </label>
                                        <input
                                          type="text"
                                          value={item.titleEn}
                                          onChange={(e) =>
                                            updateItem(techIndex, { ...item, titleEn: e.target.value })
                                          }
                                          className="input-field text-xs"
                                          placeholder="English title"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-medium mb-0.5 text-gray-700">
                                          Mô tả
                                        </label>
                                        <RichEditor
                                          value={item.description}
                                          onChange={(value) =>
                                            updateItem(techIndex, { ...item, description: value })
                                          }
                                          placeholder="Mô tả..."
                                          minHeight={80}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-medium mb-0.5 text-gray-700">
                                          Mô tả tiếng Anh
                                        </label>
                                        <RichEditor
                                          value={item.descriptionEn}
                                          onChange={(value) =>
                                            updateItem(techIndex, { ...item, descriptionEn: value })
                                          }
                                          placeholder="English description"
                                          minHeight={80}
                                        />
                                      </div>
                                      <div className="md:col-span-2">
                                        <label className="block text-[10px] font-medium mb-0.5 text-gray-700">
                                          Hình ảnh công nghệ
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
                                            {uploadingSubDoc ? 'Đang upload...' : 'Upload'}
                                            <input
                                              type="file"
                                              accept="image/*"
                                              className="hidden"
                                              onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleTechImageUpload(techIndex, file);
                                                e.target.value = '';
                                              }}
                                            />
                                          </label>
                                          <input
                                            type="url"
                                            value={item.imageUrl}
                                            onChange={(e) =>
                                              updateItem(techIndex, { ...item, imageUrl: e.target.value })
                                            }
                                            className="input-field text-[10px] flex-1"
                                            placeholder="Hoặc URL"
                                          />
                                        </div>
                                      </div>
                                      <div className="md:col-span-2">
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
                                                updateItem(techIndex, {
                                                  ...item,
                                                  linkToMainTree: e.target.value || null,
                                                })
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
                                                updateItem(techIndex, {
                                                  ...item,
                                                  linkCustomUrl: e.target.value,
                                                })
                                              }
                                              className="input-field text-[10px]"
                                              placeholder="https://... hoặc /duong-dan"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Nested applications inside this technology */}
                                    <div className="bg-white border border-gray-100 rounded p-3">
                                      <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                                          <FiPackage size={12} />
                                          Ứng dụng trong công nghệ này ({appCount})
                                        </h4>
                                        <button
                                          type="button"
                                          onClick={() => addApplication(techIndex)}
                                          className="text-[11px] text-primary hover:underline flex items-center gap-1"
                                        >
                                          <FiPlus size={11} /> Thêm ứng dụng
                                        </button>
                                      </div>
                                      {appCount === 0 ? (
                                        <p className="text-[10px] text-gray-400 italic py-2 text-center">
                                          Chưa có ứng dụng nào. Bấm "Thêm ứng dụng" để bắt đầu.
                                        </p>
                                      ) : (
                                        <div className="space-y-2">
                                          {(item.applications || []).map((application, appIndex) => {
                                            const appKey = application._id || `new-${techIndex}-${appIndex}`;
                                            return (
                                              <ApplicationRow
                                                key={appKey}
                                                application={application}
                                                appIndex={appIndex}
                                                availableMainTrees={availableMainTrees}
                                                availableProducts={availableProducts}
                                                productMap={productMap}
                                                currentApplications={item.applications || []}
                                                onUpdate={(next) =>
                                                  updateApplication(techIndex, appIndex, next)
                                                }
                                                onRemove={() => removeApplication(techIndex, appIndex)}
                                                onUploadImage={(file) =>
                                                  handleAppImageUpload(techIndex, appIndex, file)
                                                }
                                                uploadingImage={uploadingApp}
                                                onAddProduct={(productId) =>
                                                  addProductToApp(techIndex, appIndex, productId)
                                                }
                                                onUpdateProductEntry={(eIdx, next) => {
                                                  const list = [...(application.productEntries || [])];
                                                  list[eIdx] = next;
                                                  updateAppProductEntries(techIndex, appIndex, list);
                                                }}
                                                onRemoveProduct={(productId) =>
                                                  removeAppProduct(techIndex, appIndex, productId)
                                                }
                                              />
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
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
    </>
  );
};

export default MarketTechEditor;
