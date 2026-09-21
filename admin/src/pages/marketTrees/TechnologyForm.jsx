import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiArrowLeft,
  FiSave,
  FiCpu,
  FiPackage,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiImage,
  FiUpload,
  FiLink,
  FiCheck,
  FiX,
  FiChevronRight,
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
  productLineEntries: [],
  productEntries: [],
};

// ─── Application editor (inline on the TechnologyForm page) ─────────────────

const ApplicationCard = ({
  application,
  appIndex,
  availableMainTrees,
  availableProducts,
  availableProductLines,
  productMap,
  productLineMap,
  onUpdate,
  onRemove,
  onUploadImage,
  uploadingImage,
  onAddProduct,
  onRemoveProduct,
  onAddProductLine,
  onRemoveProductLine,
}) => {
  const [expanded, setExpanded] = useState(true);
  const productEntries = Array.isArray(application.productEntries) ? application.productEntries : [];

  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-gray-50 border-b border-gray-100">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-2 text-left flex-1 min-w-0"
        >
          <span className="text-[10px] font-mono text-gray-400 flex-shrink-0">
            #{appIndex + 1}
          </span>
          <span className="text-xs font-medium text-gray-700 truncate">
            {application.title || '(Chưa đặt tên)'}
          </span>
          {application.titleEn && (
            <span className="text-[10px] text-gray-400 truncate hidden sm:inline">
              / {application.titleEn}
            </span>
          )}
        </button>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <input
            type="number"
            value={application.order ?? 0}
            onChange={(e) =>
              onUpdate({ ...application, order: Number(e.target.value) || 0 })
            }
            className="input-field text-[10px] w-14 text-center"
            title="Thứ tự"
          />
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
          </button>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="p-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
            title={expanded ? 'Thu gọn' : 'Mở rộng'}
          >
            <FiEdit2 size={11} />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="p-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
            title="Xóa ứng dụng"
          >
            <FiTrash2 size={11} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3 space-y-3 pt-3">
          {/* Title fields */}
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

          {/* Description */}
          <div>
            <label className="block text-[10px] font-medium mb-0.5 text-gray-700">Mô tả</label>
            <RichEditor
              value={application.description}
              onChange={(value) => onUpdate({ ...application, description: value })}
              placeholder="Mô tả..."
              minHeight={80}
            />
          </div>

          {/* Image */}
          <div>
            <label className="block text-[10px] font-medium mb-0.5 text-gray-700">Hình ảnh</label>
            <div className="flex items-center gap-2">
              {application.imageUrl ? (
                <img
                  src={application.imageUrl}
                  alt=""
                  className="w-10 h-10 rounded object-cover border"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
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

          {/* Product line entries - table view */}
          <div className="border-t border-gray-100 pt-2">
            <div className="flex items-center gap-1 mb-2">
              <FiPackage size={11} className="text-gray-500" />
              <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide">
                Danh mục sản phẩm ({application.productLineEntries?.length || 0})
              </span>
            </div>
            {(() => {
              const selected = Array.isArray(application.productLineEntries)
                ? application.productLineEntries
                : [];
              const usedIds = new Set(
                selected.map((entry) => String(entry.productLineId))
              );
              const candidates = (availableProductLines || []).filter(
                (pl) => !usedIds.has(String(pl._id))
              );
              if (candidates.length === 0 && usedIds.size === 0) {
                return (
                  <p className="text-[10px] text-gray-400 italic">
                    {(availableProductLines || []).length === 0
                      ? 'Chưa có danh mục nào trong hệ thống.'
                      : 'Đã thêm tất cả danh mục.'}
                  </p>
                );
              }
              return (
                <>
                  {candidates.length > 0 && (
                    <div className="mb-2">
                      <select
                        value=""
                        onChange={(e) => {
                          const val = e.target.value;
                          e.target.value = '';
                          if (val) onAddProductLine(val);
                        }}
                        className="input-field text-[10px] w-full"
                      >
                        <option value="">-- Chọn danh mục để thêm --</option>
                        {candidates.map((pl) => (
                          <option key={pl._id} value={pl._id}>
                            {pl.name}
                            {pl.nameEn ? ` / ${pl.nameEn}` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-[10px]">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="px-2 py-1.5 text-left font-semibold text-gray-600 w-12">Ảnh</th>
                          <th className="px-2 py-1.5 text-left font-semibold text-gray-600">Tên tiếng Việt</th>
                          <th className="px-2 py-1.5 text-left font-semibold text-gray-600">Tên tiếng Anh</th>
                          <th className="px-2 py-1.5 text-center font-semibold text-gray-600 w-10">Xóa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-3 py-3 text-center text-gray-400 italic">
                              Chưa chọn danh mục nào.
                            </td>
                          </tr>
                        ) : (
                          selected.map((entry, eIdx) => {
                            const pl = productLineMap.get(String(entry.productLineId));
                            return (
                              <tr key={`app-${appIndex}-pl-${eIdx}`} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60">
                                <td className="px-2 py-1.5">
                                  {pl?.imageUrl ? (
                                    <img
                                      src={pl.imageUrl}
                                      alt=""
                                      className="w-8 h-8 rounded object-cover border"
                                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                                      <FiPackage size={10} />
                                    </div>
                                  )}
                                </td>
                                <td className="px-2 py-1.5 font-medium text-gray-800">
                                  {pl?.name || <span className="text-gray-400 italic">#{entry.productLineId}</span>}
                                </td>
                                <td className="px-2 py-1.5 text-gray-500">
                                  {pl?.nameEn || '—'}
                                </td>
                                <td className="px-2 py-1.5 text-center">
                                  <button
                                    type="button"
                                    onClick={() => onRemoveProductLine(entry.productLineId)}
                                    className="p-1 bg-red-50 text-red-600 rounded hover:bg-red-100 mx-auto"
                                    title="Bỏ danh mục"
                                  >
                                    <FiTrash2 size={10} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Product entries - table view */}
          <div className="border-t border-gray-100 pt-2">
            <div className="flex items-center gap-1 mb-2">
              <FiPackage size={11} className="text-gray-500" />
              <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide">
                Sản phẩm sử dụng ({productEntries.length})
              </span>
            </div>
            {(() => {
              const usedIds = new Set(
                productEntries.map((entry) => String(entry.productId))
              );
              const candidates = (availableProducts || []).filter(
                (p) => !usedIds.has(String(p._id))
              );
              return (
                <>
                  {candidates.length > 0 && (
                    <div className="mb-2">
                      <select
                        value=""
                        onChange={(e) => {
                          const value = e.target.value;
                          e.target.value = '';
                          if (value) onAddProduct(value);
                        }}
                        className="input-field text-[10px] w-full"
                      >
                        <option value="">-- Chọn sản phẩm để thêm --</option>
                        {candidates.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name}
                            {p.productCode ? ` (${p.productCode})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-[10px]">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="px-2 py-1.5 text-left font-semibold text-gray-600 w-12">Ảnh</th>
                          <th className="px-2 py-1.5 text-left font-semibold text-gray-600">Tên sản phẩm</th>
                          <th className="px-2 py-1.5 text-left font-semibold text-gray-600">Mã SP</th>
                          <th className="px-2 py-1.5 text-left font-semibold text-gray-600">Tên EN</th>
                          <th className="px-2 py-1.5 text-center font-semibold text-gray-600 w-10">Xóa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productEntries.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-3 py-3 text-center text-gray-400 italic">
                              Chưa chọn sản phẩm nào.
                            </td>
                          </tr>
                        ) : (
                          productEntries.map((entry, eIdx) => {
                            const product = productMap.get(String(entry.productId));
                            return (
                              <tr key={`app-${appIndex}-entry-${eIdx}`} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60">
                                <td className="px-2 py-1.5">
                                  {product?.imageUrl ? (
                                    <img
                                      src={product.imageUrl}
                                      alt=""
                                      className="w-8 h-8 rounded object-cover border"
                                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                                      <FiPackage size={10} />
                                    </div>
                                  )}
                                </td>
                                <td className="px-2 py-1.5 font-medium text-gray-800">
                                  {product?.name || <span className="text-gray-400 italic">#{entry.productId}</span>}
                                </td>
                                <td className="px-2 py-1.5 text-gray-500">
                                  {product?.productCode || '—'}
                                </td>
                                <td className="px-2 py-1.5 text-gray-500">
                                  {product?.nameEn || '—'}
                                </td>
                                <td className="px-2 py-1.5 text-center">
                                  <button
                                    type="button"
                                    onClick={() => onRemoveProduct(entry.productId)}
                                    className="p-1 bg-red-50 text-red-600 rounded hover:bg-red-100 mx-auto"
                                    title="Bỏ sản phẩm"
                                  >
                                    <FiTrash2 size={10} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main TechnologyForm page ───────────────────────────────────────────────

const TechnologyForm = () => {
  const { id: marketTreeId, techId } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const isNew = techId === 'new';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [parentName, setParentName] = useState('');
  const [availableMainTrees, setAvailableMainTrees] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [availableProductLines, setAvailableProductLines] = useState([]);
  const [currentTechs, setCurrentTechs] = useState([]); // all technologies from parent

  // Technology being edited on THIS page
  const [tech, setTech] = useState(null);

  const productMap = useMemo(() => {
    const map = new Map();
    for (const p of availableProducts) if (p && p._id) map.set(String(p._id), p);
    return map;
  }, [availableProducts]);

  const productLineMap = useMemo(() => {
    const map = new Map();
    for (const pl of availableProductLines) if (pl && pl._id) map.set(String(pl._id), pl);
    return map;
  }, [availableProductLines]);

  // Load parent market tree + all dropdown data
  useEffect(() => {
    const loadAll = async () => {
      try {
        const [treeRes, mtRes, prodRes, catRes] = await Promise.all([
          adminApi.getMarketTree(marketTreeId),
          adminApi.getMainTrees({ isActive: true }),
          adminApi.getProducts({ limit: 200 }),
          adminApi.getCategories({ limit: 200 }),
        ]);
        const tree = treeRes.data?.data;
        if (!tree) {
          addNotification('Không tìm thấy cây ngành', 'error');
          navigate('/market-trees');
          return;
        }
        setParentName(tree.title || '');
        const techs = Array.isArray(tree.technologies) ? tree.technologies : [];
        setCurrentTechs(techs);

        if (isNew) {
          // Start with a new empty technology and one empty application
          setTech({
            ...emptyApplication,
            title: '',
            titleEn: '',
            description: '',
            descriptionEn: '',
            imageUrl: '',
            order: techs.length,
            isActive: true,
            linkToMainTree: [],
            productLineEntries: [],
            applications: [{ ...emptyApplication, order: 0, _new: true }],
            _new: true,
          });
        } else {
          // Find the technology to edit
          const found = techs.find(
            (t) => String(t._id) === String(techId)
          );
          if (!found) {
            addNotification('Không tìm thấy công nghệ', 'error');
            navigate(`/market-trees/${marketTreeId}/technologies`);
            return;
          }
          setTech({
            ...found,
            linkToMainTree: Array.isArray(found.linkToMainTree)
              ? found.linkToMainTree.map((v) => String(v?._id || v))
              : found.linkToMainTree
                ? [String(found.linkToMainTree?._id || found.linkToMainTree)]
                : [],
            applications: Array.isArray(found.applications)
              ? found.applications.map((a) => ({
                  ...emptyApplication,
                  ...a,
                  productLineEntries: Array.isArray(a.productLineEntries)
                    ? a.productLineEntries.map((entry) => ({
                        productLineId: entry.productLineId?._id || entry.productLineId || null,
                      }))
                    : [],
                  productEntries: Array.isArray(a.productEntries)
                    ? a.productEntries.map((entry) => ({
                        productId: entry.productId?._id || entry.productId || null,
                      }))
                    : [],
                }))
              : [],
          });
        }

        const list = Array.isArray(mtRes.data) ? mtRes.data : mtRes.data?.data || [];
        setAvailableMainTrees(list.filter((mt) => mt._id !== marketTreeId));
        setAvailableProducts(
          Array.isArray(prodRes.data?.data) ? prodRes.data.data : []
        );
        setAvailableProductLines(
          Array.isArray(catRes.data?.data) ? catRes.data.data : []
        );
      } catch (err) {
        addNotification(err.response?.data?.message || 'Không thể tải dữ liệu', 'error');
        navigate(`/market-trees/${marketTreeId}/technologies`);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, [marketTreeId, techId, isNew, navigate, addNotification]);

  // ── Tech image upload ────────────────────────────────────────────────────────
  const handleImageUpload = async (file) => {
    setUploadingImage(true);
    try {
      const res = await adminApi.uploadImage(file);
      const url = res?.data?.data?.url;
      if (url) {
        setTech((prev) => prev ? { ...prev, imageUrl: url } : prev);
        addNotification('Upload ảnh thành công');
      }
    } catch (err) {
      addNotification('Upload ảnh thất bại', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  // ── Application operations ─────────────────────────────────────────────────
  const addApplication = () => {
    setTech((prev) => {
      if (!prev) return prev;
      const apps = Array.isArray(prev.applications) ? [...prev.applications] : [];
      apps.push({ ...emptyApplication, order: apps.length, _new: true });
      return { ...prev, applications: apps };
    });
  };

  const updateApplication = (appIndex, next) => {
    setTech((prev) => {
      if (!prev) return prev;
      const apps = [...(prev.applications || [])];
      apps[appIndex] = next;
      return { ...prev, applications: apps };
    });
  };

  const removeApplication = (appIndex) => {
    setTech((prev) => {
      if (!prev) return prev;
      const apps = (prev.applications || []).filter((_, i) => i !== appIndex);
      return { ...prev, applications: apps };
    });
  };

  const handleAppImageUpload = async (appIndex, file) => {
    setUploadingImage(true);
    try {
      const res = await adminApi.uploadImage(file);
      const url = res?.data?.data?.url;
      if (url) {
        updateApplication(appIndex, { ...(tech?.applications?.[appIndex] || emptyApplication), imageUrl: url });
      }
    } catch (err) {
      addNotification('Upload ảnh thất bại', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const addProductToApp = (appIndex, productId) => {
    setTech((prev) => {
      if (!prev) return prev;
      const apps = [...(prev.applications || [])];
      const current = Array.isArray(apps[appIndex].productEntries)
        ? [...apps[appIndex].productEntries]
        : [];
      if (current.some((entry) => String(entry.productId) === String(productId))) return prev;
      current.push({ productId });
      apps[appIndex] = { ...apps[appIndex], productEntries: current };
      return { ...prev, applications: apps };
    });
  };

  const removeAppProduct = (appIndex, productId) => {
    setTech((prev) => {
      if (!prev) return prev;
      const apps = [...(prev.applications || [])];
      const current = (apps[appIndex].productEntries || []).filter(
        (entry) => String(entry.productId) !== String(productId)
      );
      apps[appIndex] = { ...apps[appIndex], productEntries: current };
      return { ...prev, applications: apps };
    });
  };

  const addProductLineToApp = (appIndex, productLineId) => {
    setTech((prev) => {
      if (!prev) return prev;
      const apps = [...(prev.applications || [])];
      const current = Array.isArray(apps[appIndex].productLineEntries)
        ? [...apps[appIndex].productLineEntries]
        : [];
      if (current.some((entry) => String(entry.productLineId) === String(productLineId))) return prev;
      current.push({ productLineId });
      apps[appIndex] = { ...apps[appIndex], productLineEntries: current };
      return { ...prev, applications: apps };
    });
  };

  const removeAppProductLine = (appIndex, productLineId) => {
    setTech((prev) => {
      if (!prev) return prev;
      const apps = [...(prev.applications || [])];
      const current = (apps[appIndex].productLineEntries || []).filter(
        (entry) => String(entry.productLineId) !== String(productLineId)
      );
      apps[appIndex] = { ...apps[appIndex], productLineEntries: current };
      return { ...prev, applications: apps };
    });
  };

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!tech?.title?.trim()) {
      addNotification('Vui lòng nhập tiêu đề công nghệ', 'error');
      return;
    }
    setSaving(true);
    try {
      // Fetch latest parent state to avoid overwriting concurrent changes
      const latestRes = await adminApi.getMarketTree(marketTreeId);
      const latestTree = latestRes.data?.data;
      if (!latestTree) throw new Error('Không thể tải lại cây ngành');

      const latestTechs = Array.isArray(latestTree.technologies)
        ? latestTree.technologies.map((t) => ({
            ...t,
            linkToMainTree: Array.isArray(t.linkToMainTree)
              ? t.linkToMainTree.map((v) => String(v?._id || v))
              : t.linkToMainTree
                ? [String(t.linkToMainTree?._id || t.linkToMainTree)]
                : [],
            applications: Array.isArray(t.applications)
              ? t.applications.map((a) => ({
                  ...a,
                  productLineEntries: Array.isArray(a.productLineEntries)
                    ? a.productLineEntries.map((entry) => ({
                        productLineId: entry.productLineId?._id || entry.productLineId || null,
                      }))
                    : [],
                  productEntries: Array.isArray(a.productEntries)
                    ? a.productEntries.map((entry) => ({
                        productId: entry.productId?._id || entry.productId || null,
                      }))
                    : [],
                }))
              : [],
          }))
        : [];

      // Sanitise the tech being saved
      const techPayload = {
        ...tech,
        description: tech.description || '',
        descriptionEn: tech.descriptionEn || '',
        linkToMainTree: Array.isArray(tech.linkToMainTree) ? tech.linkToMainTree : [],
        applications: (tech.applications || []).map((a) => ({
          ...a,
          description: a.description || '',
          descriptionEn: a.descriptionEn || '',
          productLineEntries: (a.productLineEntries || []).filter(
            (entry) => entry.productLineId
          ),
          productEntries: (a.productEntries || []).filter(
            (entry) => entry.productId
          ),
        })),
      };

      let nextTechs;
      if (isNew) {
        // Append new technology
        nextTechs = [...latestTechs, { ...techPayload, _id: undefined, _new: undefined }];
      } else {
        // Replace existing technology by _id
        nextTechs = latestTechs.map((t) =>
          String(t._id) === String(techId)
            ? { ...techPayload, _id: t._id, _new: undefined }
            : t
        );
      }

      await adminApi.updateMarketTree(marketTreeId, { technologies: nextTechs });
      addNotification(isNew ? 'Đã thêm công nghệ mới' : 'Đã lưu công nghệ');
      navigate(`/market-trees/${marketTreeId}/technologies`);
    } catch (err) {
      addNotification(err.response?.data?.message || 'Có lỗi xảy ra', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <Skeleton.Editor rows={6} />
      </div>
    );
  }

  if (!tech) return null;

  const appCount = (tech.applications || []).length;

  return (
    <>
      <SEO
        title={isNew ? 'Thêm công nghệ' : 'Sửa công nghệ'}
        description="Quản lý công nghệ cây ngành thị trường"
        url="/market-trees"
      />
      <HeaderWithBreadcrumb
        title={isNew ? 'Thêm công nghệ' : 'Sửa công nghệ'}
        breadcrumbs={[
          { label: 'Cây ngành thị trường', path: '/market-trees' },
          { label: parentName || '...', path: `/market-trees/${marketTreeId}/edit` },
          { label: 'Công nghệ', path: `/market-trees/${marketTreeId}/technologies` },
          { label: isNew ? 'Thêm mới' : (tech.title || '...') },
        ]}
        actions={
          <button
            type="button"
            onClick={() => navigate(`/market-trees/${marketTreeId}/technologies`)}
            className="btn-secondary flex items-center gap-1.5 text-xs"
          >
            <FiArrowLeft size={14} />
            Quay lại
          </button>
        }
      />

      <div className="p-4">
        <div className="card max-w-4xl mx-auto space-y-4">

          {/* Technology metadata */}
          <div className="space-y-3 bg-gray-50 border border-gray-100 rounded-lg p-4">
            <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
              <FiCpu size={13} className="text-primary" />
              Thông tin công nghệ
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={tech.title}
                  onChange={(e) => setTech((prev) => prev ? { ...prev, title: e.target.value } : prev)}
                  className="input-field"
                  placeholder="VD: Công nghệ chống thấm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  Tiêu đề tiếng Anh
                </label>
                <input
                  type="text"
                  value={tech.titleEn}
                  onChange={(e) => setTech((prev) => prev ? { ...prev, titleEn: e.target.value } : prev)}
                  className="input-field"
                  placeholder="English title"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Mô tả</label>
              <RichEditor
                value={tech.description}
                onChange={(value) => setTech((prev) => prev ? { ...prev, description: value } : prev)}
                placeholder="Mô tả..."
                minHeight={100}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Mô tả tiếng Anh</label>
              <RichEditor
                value={tech.descriptionEn}
                onChange={(value) => setTech((prev) => prev ? { ...prev, descriptionEn: value } : prev)}
                placeholder="English description..."
                minHeight={100}
              />
            </div>

            {/* Image */}
            <div>
              <label className="block text-xs font-medium mb-1">Hình ảnh công nghệ</label>
              <div className="flex items-center gap-2">
                {tech.imageUrl ? (
                  <img
                    src={tech.imageUrl}
                    alt=""
                    className="w-12 h-12 rounded object-cover border"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                    <FiImage size={16} />
                  </div>
                )}
                <label className="btn-secondary text-xs flex items-center gap-1 cursor-pointer">
                  <FiUpload size={12} />
                  {uploadingImage ? 'Đang upload...' : 'Upload'}
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
                  value={tech.imageUrl}
                  onChange={(e) => setTech((prev) => prev ? { ...prev, imageUrl: e.target.value } : prev)}
                  className="input-field text-xs flex-1"
                  placeholder="Hoặc URL"
                />
              </div>
            </div>

            {/* Order, Active, Link */}
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-xs font-medium mb-1">Thứ tự</label>
                <input
                  type="number"
                  value={tech.order ?? 0}
                  onChange={(e) => setTech((prev) => prev ? { ...prev, order: Number(e.target.value) || 0 } : prev)}
                  className="input-field w-20"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none pb-1">
                <input
                  type="checkbox"
                  checked={tech.isActive !== false}
                  onChange={(e) => setTech((prev) => prev ? { ...prev, isActive: e.target.checked } : prev)}
                  className="rounded"
                />
                <span className="text-xs font-medium">Đang hiển thị</span>
              </label>
            </div>

            {/* Link to main tree */}
            <div className="border-t border-gray-200 pt-3">
              <div className="flex items-center gap-1 mb-2">
                <FiLink size={12} className="text-gray-500" />
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Link đến cây ngành sản phẩm ({(tech.linkToMainTree || []).length})
                </span>
              </div>
              {(() => {
                const selected = Array.isArray(tech.linkToMainTree) ? tech.linkToMainTree : [];
                const candidates = (availableMainTrees || []).filter(
                  (mt) => !selected.includes(String(mt._id))
                );
                return (
                  <>
                    {candidates.length > 0 && (
                      <div className="mb-2">
                        <select
                          value=""
                          onChange={(e) => {
                            const val = e.target.value;
                            e.target.value = '';
                            if (val) {
                              setTech((prev) => prev ? { ...prev, linkToMainTree: [...selected, val] } : prev);
                            }
                          }}
                          className="input-field text-xs w-full"
                        >
                          <option value="">-- Thêm cây ngành --</option>
                          {candidates.map((mt) => (
                            <option key={mt._id} value={mt._id}>
                              {mt.name}
                              {mt.nameEn ? ` / ${mt.nameEn}` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-3 py-2 text-left font-semibold text-gray-600 w-12">Ảnh</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600">Tên tiếng Việt</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600">Tên tiếng Anh</th>
                            <th className="px-3 py-2 text-center font-semibold text-gray-600 w-10">Xóa</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selected.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="px-3 py-4 text-center text-gray-400 italic">
                                Chưa chọn cây ngành nào.
                              </td>
                            </tr>
                          ) : (
                            selected.map((mtId) => {
                              const mt = availableMainTrees.find((m) => String(m._id) === String(mtId));
                              return (
                                <tr key={mtId} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60">
                                  <td className="px-3 py-2">
                                    {mt?.imageUrl ? (
                                      <img src={mt.imageUrl} alt="" className="w-8 h-8 rounded object-cover border"
                                        onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                    ) : (
                                      <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                                        <FiImage size={10} />
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-3 py-2 font-medium text-gray-800">
                                    {mt?.name || <span className="text-gray-400 italic">#{mtId}</span>}
                                  </td>
                                  <td className="px-3 py-2 text-gray-500">{mt?.nameEn || '—'}</td>
                                  <td className="px-3 py-2 text-center">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setTech((prev) => prev ? { ...prev, linkToMainTree: selected.filter((id) => String(id) !== String(mtId)) } : prev)
                                      }
                                      className="p-1 bg-red-50 text-red-600 rounded hover:bg-red-100 mx-auto"
                                      title="Bỏ cây ngành"
                                    >
                                      <FiTrash2 size={11} />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Applications section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                <FiPackage size={13} className="text-primary" />
                Ứng dụng ({appCount})
              </h3>
              <button
                type="button"
                onClick={addApplication}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <FiPlus size={12} />
                Thêm ứng dụng
              </button>
            </div>

            {appCount === 0 ? (
              <div className="border border-dashed border-gray-300 rounded-lg py-6 text-center">
                <p className="text-xs text-gray-400 italic">
                  Chưa có ứng dụng nào. Bấm "Thêm ứng dụng" để bắt đầu.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {(tech.applications || []).map((application, appIndex) => (
                  <ApplicationCard
                    key={application._id || `new-app-${appIndex}`}
                    application={application}
                    appIndex={appIndex}
                    availableMainTrees={availableMainTrees}
                    availableProducts={availableProducts}
                    availableProductLines={availableProductLines}
                    productMap={productMap}
                    productLineMap={productLineMap}
                    onUpdate={(next) => updateApplication(appIndex, next)}
                    onRemove={() => removeApplication(appIndex)}
                    onUploadImage={(file) => handleAppImageUpload(appIndex, file)}
                    uploadingImage={uploadingImage}
                    onAddProduct={(productId) => addProductToApp(appIndex, productId)}
                    onRemoveProduct={(productId) => removeAppProduct(appIndex, productId)}
                    onAddProductLine={(productLineId) => addProductLineToApp(appIndex, productLineId)}
                    onRemoveProductLine={(productLineId) => removeAppProductLine(appIndex, productLineId)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => navigate(`/market-trees/${marketTreeId}/technologies`)}
              className="btn-secondary text-xs"
              disabled={saving}
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="btn-primary text-xs flex items-center gap-1.5 disabled:opacity-50"
              disabled={saving}
            >
              <FiSave size={14} />
              {saving ? 'Đang lưu...' : isNew ? 'Thêm công nghệ' : 'Lưu thay đổi'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TechnologyForm;
