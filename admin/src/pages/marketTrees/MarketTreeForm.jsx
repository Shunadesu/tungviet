import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiArrowLeft,
  FiSave,
  FiUpload,
  FiImage,
  FiCpu,
  FiPackage,
  FiPlus,
  FiTrash2,
  FiInfo,
  FiLink,
  FiExternalLink,
  FiX,
} from 'react-icons/fi';
import HeaderWithBreadcrumb from '../settings/HeaderWithBreadcrumb';
import RichEditor from '../../components/RichEditor';
import SEO from '../../components/SEO';
import Skeleton from '../../components/Skeleton';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../context/NotificationContext';
import useFormDraft from '../../hooks/useFormDraft';

const emptyApplication = {
  title: '',
  titleEn: '',
  description: '',
  descriptionEn: '',
  imageUrl: '',
  order: 0,
  isActive: true,
  linkToMainTree: null,
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
};

const emptyForm = {
  title: '',
  titleEn: '',
  description: '',
  descriptionEn: '',
  introductions: { vi: '', en: '' },
  imageUrl: '',
  industry: [],
  order: 0,
  isActive: true,
  isFeatured: false,
  technologies: [],
  productLineEntries: [],
};

const MarketTreeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [availableProducts, setAvailableProducts] = useState([]);
  const [availableProductLines, setAvailableProductLines] = useState([]);
  const [availableMainTrees, setAvailableMainTrees] = useState([]);
  const [formData, setFormData] = useState({ ...emptyForm });

  const draftKey = `draft:marketTree:${isEditing ? `edit:${id}` : 'new'}`;
  const { loadedFromDraft, clearDraft } = useFormDraft(
    draftKey,
    formData,
    setFormData,
    { enabled: !loading }
  );

  useEffect(() => {
    const loadAll = async () => {
      try {
        const prodRes = await adminApi.getProducts({ limit: 200 });
        setAvailableProducts(
          Array.isArray(prodRes.data?.data) ? prodRes.data.data : []
        );
        
        const catRes = await adminApi.getCategories({ limit: 200 });
        setAvailableProductLines(
          Array.isArray(catRes.data?.data) ? catRes.data.data : []
        );
      } catch (err) {
        console.error(err);
      }
    };
    loadAll();
  }, []);

  useEffect(() => {
    const loadMainTrees = async () => {
      try {
        const res = await adminApi.getMainTrees({ isActive: true });
        const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setAvailableMainTrees(list.filter((mt) => mt._id !== id));
      } catch (err) {
        console.error('Failed to load main trees', err);
      }
    };
    loadMainTrees();
  }, [id]);

  useEffect(() => {
    if (!isEditing || !id) return;
    const fetchNode = async () => {
      try {
        const res = await adminApi.getMarketTree(id);
        const node = res.data?.data;
        if (!node) {
          addNotification('Không tìm thấy cây ngành', 'error');
          navigate('/market-trees');
          return;
        }
        setFormData({
          title: node.title || '',
          titleEn: node.titleEn || '',
          description: node.description || '',
          descriptionEn: node.descriptionEn || '',
          introductions: {
            vi: node.introductions?.vi || '',
            en: node.introductions?.en || '',
          },
          imageUrl: node.imageUrl || '',
          industry: Array.isArray(node.industry)
            ? node.industry.map((ind) =>
                typeof ind === 'object' ? (ind._id || ind) : ind
              )
            : node.industry
            ? [node.industry._id || node.industry]
            : [],
          order: node.order ?? 0,
          isActive: node.isActive !== false,
          isFeatured: node.isFeatured === true,
          technologies: Array.isArray(node.technologies)
            ? node.technologies.map((t) => ({
                ...emptySubDoc,
                ...t,
                linkToMainTree:
                  t.linkToMainTree?._id || t.linkToMainTree || null,
                applications: Array.isArray(t.applications)
                  ? t.applications.map((a) => ({
                      ...emptyApplication,
                      ...a,
                      linkToMainTree:
                        a.linkToMainTree?._id || a.linkToMainTree || null,
                      productEntries: Array.isArray(a.productEntries)
                        ? a.productEntries.map((entry) => ({
                            productId:
                              entry.productId?._id || entry.productId || null,
                          }))
                        : [],
                    }))
                  : [],
              }))
            : [],
          productLineEntries: Array.isArray(node.productLineEntries)
            ? node.productLineEntries.map((entry) => ({
                productLineId:
                  entry.productLineId?._id || entry.productLineId || null,
              }))
            : [],
        });
      } catch (error) {
        addNotification(
          error.response?.data?.message || 'Không thể tải cây ngành',
          'error'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchNode();
  }, [id, isEditing, navigate, addNotification]);

  const handleCancel = () => {
    clearDraft();
    navigate('/market-trees');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      addNotification('Vui lòng nhập tiêu đề', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = buildSavePayload();
      if (isEditing) {
        await adminApi.updateMarketTree(id, payload);
        addNotification('Cập nhật cây ngành thành công');
      } else {
        await adminApi.createMarketTree(payload);
        addNotification('Thêm cây ngành thành công');
      }
      clearDraft();
      navigate('/market-trees');
    } catch (error) {
      addNotification(
        error.response?.data?.message || 'Có lỗi xảy ra',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  const buildSavePayload = () => ({
    ...formData,
    industry: formData.industry || [],
    introductions: {
      vi: formData.introductions?.vi || '',
      en: formData.introductions?.en || '',
    },
    technologies: (formData.technologies || []).map((t) => ({
      ...t,
      // Preserve nested applications + productEntries inside each technology.
      applications: Array.isArray(t.applications)
        ? t.applications.map((a) => ({
            ...a,
            productEntries: (a.productEntries || []).filter(
              (entry) => entry.productId
            ),
          }))
        : [],
    })),
    productLineEntries: (formData.productLineEntries || []).filter(
      (entry) => entry.productLineId
    ),
  });

  const handleQuickCreateAndNavigate = async (subRoute) => {
    if (!formData.title.trim()) {
      addNotification('Vui lòng nhập tiêu đề trước khi thêm công nghệ', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = buildSavePayload();
      const res = await adminApi.createMarketTree(payload);
      const newId = res?.data?.data?._id;
      if (!newId) {
        addNotification('Không thể lấy ID cây ngành mới', 'error');
        return;
      }
      addNotification('Đã tạo cây ngành, chuyển đến trang quản lý...');
      // Intentionally keep the draft so user can resume editing on /market-trees/:id/edit after they come back.
      navigate(`/market-trees/${newId}/${subRoute}`);
    } catch (error) {
      addNotification(
        error.response?.data?.message || 'Có lỗi xảy ra',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file) => {
    setUploading(true);
    try {
      const res = await adminApi.uploadImage(file);
      const url = res?.data?.data?.url;
      if (url) {
        setFormData((prev) => ({ ...prev, imageUrl: url }));
        addNotification('Upload ảnh thành công');
      }
    } catch (err) {
      addNotification('Upload ảnh thất bại', 'error');
    } finally {
      setUploading(false);
    }
  };

  const addRootProductLine = (productLineId) => {
    setFormData((prev) => {
      const current = Array.isArray(prev.productLineEntries)
        ? [...prev.productLineEntries]
        : [];
      if (current.some((entry) => String(entry.productLineId) === String(productLineId))) {
        return prev;
      }
      current.push({ productLineId });
      return { ...prev, productLineEntries: current };
    });
  };

  const removeRootProductLine = (productLineId) => {
    setFormData((prev) => ({
      ...prev,
      productLineEntries: (prev.productLineEntries || []).filter(
        (entry) => String(entry.productLineId) !== String(productLineId)
      ),
    }));
  };

  if (loading) {
    return (
      <>
        <div className="h-11 bg-gray-100 border-b" />
        <div className="p-4">
          <div className="card max-w-5xl mx-auto p-4 space-y-4">
            {/* Thông tin cơ bản */}
            <div className="space-y-3">
              <Skeleton variant="rect" height={14} width={140} />
              <div className="grid md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Skeleton variant="rect" height={11} width="25%" />
                  <Skeleton variant="rect" height={36} width="100%" />
                </div>
                <div className="space-y-1.5">
                  <Skeleton variant="rect" height={11} width="30%" />
                  <Skeleton variant="rect" height={36} width="100%" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Skeleton variant="rect" height={11} width="15%" />
                <Skeleton variant="rect" height={140} width="100%" />
              </div>
              <div className="space-y-1.5">
                <Skeleton variant="rect" height={11} width="20%" />
                <Skeleton variant="rect" height={140} width="100%" />
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Skeleton variant="rect" height={11} width="40%" />
                  <Skeleton variant="rect" height={160} width="100%" />
                </div>
                <div className="space-y-1.5">
                  <Skeleton variant="rect" height={11} width="35%" />
                  <Skeleton variant="rect" height={160} width="100%" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Skeleton variant="rect" height={11} width="30%" />
                <div className="flex items-center gap-2">
                  <Skeleton variant="rect" height={48} width={48} />
                  <Skeleton variant="rect" height={32} width={80} />
                </div>
                <Skeleton variant="rect" height={32} width="60%" />
              </div>
              <div className="flex items-center gap-6">
                <div className="space-y-1.5">
                  <Skeleton variant="rect" height={11} width={50} />
                  <Skeleton variant="rect" height={32} width={80} />
                </div>
                <div className="space-y-1.5">
                  <Skeleton variant="rect" height={11} width={120} />
                  <div className="flex gap-2">
                    <Skeleton variant="rect" height={28} width={80} />
                    <Skeleton variant="rect" height={28} width={80} />
                    <Skeleton variant="rect" height={28} width={80} />
                  </div>
                </div>
                <Skeleton variant="rect" height={20} width={120} />
                <Skeleton variant="rect" height={20} width={150} />
              </div>
            </div>

            {/* Danh mục sản phẩm */}
            <div className="space-y-2 border-t pt-4">
              <div className="flex items-center justify-between">
                <Skeleton variant="rect" height={14} width={200} />
                <Skeleton variant="rect" height={11} width={60} />
              </div>
              <Skeleton variant="rect" height={11} width="60%" />
              <Skeleton variant="rect" height={32} width="40%" />
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {['w-12','flex-1','flex-1','w-10'].map((w, i) => (
                        <th key={i} className="px-2 py-1.5">
                          <Skeleton variant="rect" height={10} width="60%" />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[1,2,3].map(row => (
                      <tr key={row} className="border-b border-gray-100 last:border-0">
                        {['w-12','flex-1','flex-1','w-10'].map((w, i) => (
                          <td key={i} className="px-2 py-2">
                            {i === 0 ? (
                              <Skeleton variant="rect" height={28} width={28} />
                            ) : (
                              <Skeleton variant="rect" height={10} width={`${50 + (row+i)%3 * 20}%`} />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Technologies */}
            <div className="space-y-2 border-t pt-4">
              <div className="flex items-center justify-between">
                <Skeleton variant="rect" height={14} width={160} />
                <Skeleton variant="rect" height={30} width={130} />
              </div>
              {[1,2].map(row => (
                <div key={row} className="border border-gray-200 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton variant="rect" height={12} width={120} />
                    <Skeleton variant="rect" height={20} width={60} />
                  </div>
                  <div className="grid md:grid-cols-2 gap-2">
                    <Skeleton variant="rect" height={32} width="100%" />
                    <Skeleton variant="rect" height={32} width="100%" />
                  </div>
                  <div className="grid md:grid-cols-2 gap-2 border-t pt-2">
                    <Skeleton variant="rect" height={80} width="100%" />
                    <Skeleton variant="rect" height={80} width="100%" />
                  </div>
                  {/* Product entries */}
                  <div className="border-t pt-2">
                    <Skeleton variant="rect" height={11} width={100} />
                    <Skeleton variant="rect" height={32} width="40%" className="mt-1.5" />
                    <div className="border border-gray-200 rounded-lg overflow-hidden mt-1.5">
                      <table className="w-full text-[10px]">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100">
                            {[1,2,3,4,5].map(i => (
                              <th key={i} className="px-2 py-1.5">
                                <Skeleton variant="rect" height={10} width="60%" />
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-100">
                            <td className="px-2 py-1.5"><Skeleton variant="rect" height={28} width={28} /></td>
                            <td className="px-2 py-1.5"><Skeleton variant="rect" height={10} width="70%" /></td>
                            <td className="px-2 py-1.5"><Skeleton variant="rect" height={10} width="50%" /></td>
                            <td className="px-2 py-1.5"><Skeleton variant="rect" height={10} width="60%" /></td>
                            <td className="px-2 py-1.5"><Skeleton variant="rect" height={20} width={20} /></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="border-t pt-4 flex gap-2 justify-end">
              <Skeleton variant="rect" height={36} width={90} />
              <Skeleton variant="rect" height={36} width={110} />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title={isEditing ? 'Sửa cây ngành' : 'Thêm cây ngành'}
        description="Quản lý cây ngành thị trường"
        url="/market-trees"
      />
      <HeaderWithBreadcrumb
        title={isEditing ? 'Sửa cây ngành' : 'Thêm cây ngành'}
        breadcrumbs={[
          { label: 'Cây ngành thị trường', path: '/market-trees' },
          { label: isEditing ? 'Sửa' : 'Thêm mới' },
        ]}
        actions={
          <button
            type="button"
            onClick={() => navigate('/market-trees')}
            className="btn-secondary flex items-center gap-1.5 text-xs"
          >
            <FiArrowLeft size={14} />
            Quay lại
          </button>
        }
      />
      {loadedFromDraft && (
        <div className="px-4 pt-3 max-w-5xl mx-auto">
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

      <div className="p-4">
        <form
          onSubmit={handleSubmit}
          className="card max-w-5xl mx-auto space-y-4"
        >
          {/* Section: Thông tin cơ bản */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Thông tin cơ bản
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  className="input-field"
                  placeholder="VD: Sơn PU"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  Tiêu đề tiếng Anh
                </label>
                <input
                  type="text"
                  value={formData.titleEn}
                  onChange={(e) =>
                    setFormData({ ...formData, titleEn: e.target.value })
                  }
                  className="input-field"
                  placeholder="PU Coatings"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Mô tả</label>
              <RichEditor
                value={formData.description}
                onChange={(value) =>
                  setFormData({ ...formData, description: value })
                }
                placeholder="Mô tả..."
                minHeight={140}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">
                Mô tả tiếng Anh
              </label>
              <RichEditor
                value={formData.descriptionEn}
                onChange={(value) =>
                  setFormData({ ...formData, descriptionEn: value })
                }
                placeholder="English description"
                minHeight={140}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1 flex items-center gap-1">
                  <FiInfo size={12} />
                  Giới thiệu (Tiếng Việt)
                </label>
                <RichEditor
                  value={formData.introductions?.vi || ''}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      introductions: {
                        ...(prev.introductions || {}),
                        vi: value,
                      },
                    }))
                  }
                  placeholder="Mô tả chi tiết về cây ngành..."
                  minHeight={160}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 flex items-center gap-1">
                  <FiInfo size={12} />
                  Giới thiệu (Tiếng Anh)
                </label>
                <RichEditor
                  value={formData.introductions?.en || ''}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      introductions: {
                        ...(prev.introductions || {}),
                        en: value,
                      },
                    }))
                  }
                  placeholder="English introduction..."
                  minHeight={160}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">
                Hình minh họa cây ngành
              </label>
              <div className="flex items-center gap-2">
                {formData.imageUrl ? (
                  <img
                    src={formData.imageUrl}
                    alt=""
                    className="w-32 h-32 rounded object-cover border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-32 h-32 rounded bg-gray-100 flex items-center justify-center text-gray-400">
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
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                className="input-field mt-2 text-xs"
                placeholder="Hoặc nhập URL"
              />
            </div>

            <div className="flex items-center gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">
                  Thứ tự
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      order: Number(e.target.value) || 0,
                    })
                  }
                  className="input-field w-24"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  Thuộc ngành (MainTree)
                </label>
                <div className="flex items-center gap-2">
                  <select
                    className="input-field text-xs flex-1"
                    value=""
                    onChange={(e) => {
                      const mt = availableMainTrees.find(
                        (x) => String(x._id) === e.target.value
                      );
                      if (!mt) return;
                      const already = (formData.industry || []).some(
                        (id) => String(id) === String(mt._id)
                      );
                      if (!already) {
                        setFormData((prev) => ({
                          ...prev,
                          industry: [...(prev.industry || []), mt._id],
                        }));
                      }
                      e.target.value = '';
                    }}
                  >
                    <option value="">— Chọn ngành —</option>
                    {(formData.industry || []).length < availableMainTrees.length &&
                      availableMainTrees
                        .filter(
                          (mt) =>
                            !(formData.industry || []).some(
                              (id) => String(id) === String(mt._id)
                            )
                        )
                        .map((mt) => (
                          <option key={mt._id} value={mt._id}>
                            {mt.name}
                            {mt.nameEn ? ` / ${mt.nameEn}` : ''}
                          </option>
                        ))}
                  </select>
                </div>

                {(formData.industry || []).length > 0 ? (
                  <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-3 py-2 text-left font-semibold text-gray-600 w-8">STT</th>
                          <th className="px-3 py-2 text-left font-semibold text-gray-600">Ngành</th>
                          <th className="px-3 py-2 text-right font-medium w-20">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(formData.industry || [])
                          .map((id) => availableMainTrees.find((mt) => String(mt._id) === String(id)))
                          .filter(Boolean)
                          .map((mt, index) => (
                            <tr
                              key={mt._id}
                              className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50"
                            >
                              <td className="px-3 py-2 text-gray-400 text-[10px]">{index + 1}</td>
                              <td className="px-3 py-2">
                                <span className="font-medium text-gray-700">{mt.name}</span>
                                {mt.nameEn && (
                                  <span className="block text-[10px] text-gray-400">{mt.nameEn}</span>
                                )}
                              </td>
                              <td className="px-3 py-2 text-right">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      industry: (prev.industry || []).filter(
                                        (id) => String(id) !== String(mt._id)
                                      ),
                                    }))
                                  }
                                  className="text-red-500 hover:bg-red-50 p-1 rounded"
                                  title="Xóa khỏi danh sách"
                                >
                                  <FiTrash2 size={13} />
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="mt-1 text-[10px] text-gray-400 italic">Chưa chọn ngành nào.</p>
                )}
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none mt-5">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="rounded"
                />
                <span className="text-xs font-medium">Đang hoạt động</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none mt-5">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) =>
                    setFormData({ ...formData, isFeatured: e.target.checked })
                  }
                  className="rounded"
                />
                <span className="text-xs font-medium">
                  Đánh dấu nổi bật (featured)
                </span>
              </label>
            </div>
          </div>

          {/* Section: Danh mục sản phẩm sử dụng (cấp cây ngành) */}
          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-1">
                <FiPackage size={14} />
                DANH MỤC SẢN PHẨM SỬ DỤNG (CÂY NGÀNH)
              </h3>
              <span className="text-[10px] text-gray-500">
                {(formData.productLineEntries || []).length} đã chọn
              </span>
            </div>
            <p className="text-[10px] text-gray-500">
              Danh sách <strong>danh mục sản phẩm (Product Line)</strong> chính áp dụng cho toàn bộ cây ngành này
              (ngoài các sản phẩm đã gắn trong từng Ứng dụng).
            </p>

            {(() => {
              const usedIds = new Set(
                (formData.productLineEntries || []).map((entry) =>
                  String(entry.productLineId)
                )
              );
              const candidates = availableProductLines.filter(
                (pl) => !usedIds.has(String(pl._id))
              );
              return candidates.length === 0 ? (
                <p className="text-[10px] text-gray-400 italic">
                  {availableProductLines.length === 0
                    ? 'Chưa có danh mục sản phẩm nào trong hệ thống.'
                    : 'Đã thêm tất cả danh mục sản phẩm.'}
                </p>
              ) : (
                <select
                  value=""
                  onChange={(e) => {
                    const value = e.target.value;
                    e.target.value = '';
                    if (value) addRootProductLine(value);
                  }}
                  className="input-field text-xs w-full"
                >
                  <option value="">-- Chọn danh mục sản phẩm để thêm --</option>
                  {candidates.map((pl) => (
                    <option key={pl._id} value={pl._id}>
                      {pl.name}
                      {pl.nameEn ? ` / ${pl.nameEn}` : ''}
                    </option>
                  ))}
                </select>
              );
            })()}

            <div className="space-y-1">
              {(formData.productLineEntries || []).map((entry) => {
                const productLine = availableProductLines.find(
                  (pl) => String(pl._id) === String(entry.productLineId)
                );
                return (
                  <div
                    key={String(entry.productLineId)}
                    className="flex items-start gap-2 p-2 border border-gray-100 rounded bg-white"
                  >
                    {productLine?.imageUrl ? (
                      <img
                        src={productLine.imageUrl}
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
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium truncate">
                        {productLine?.name || `Danh mục #${entry.productLineId}`}
                      </div>
                      {productLine?.nameEn && (
                        <div className="text-[10px] text-gray-400">
                          {productLine.nameEn}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRootProductLine(entry.productLineId)}
                      className="p-1 bg-red-50 text-red-600 rounded hover:bg-red-100 flex-shrink-0"
                      title="Bỏ danh mục"
                    >
                      <FiTrash2 size={12} />
                    </button>
                  </div>
                );
              })}
              {(formData.productLineEntries || []).length === 0 && (
                <p className="text-[10px] text-gray-400 italic">
                  Chưa chọn danh mục sản phẩm nào cho cây ngành.
                </p>
              )}
            </div>
          </div>

          {/* Section: Technologies */}
          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-1">
                <FiCpu size={14} />
                Công nghệ (technologies)
              </h3>
              <button
                type="button"
                onClick={() => {
                  if (isEditing) {
                    navigate(`/market-trees/${id}/technologies`);
                  } else {
                    handleQuickCreateAndNavigate('technologies');
                  }
                }}
                className="text-xs text-primary hover:underline flex items-center gap-1"
                disabled={saving}
              >
                {isEditing ? (
                  <>
                    <FiExternalLink size={12} />
                    Quản lý công nghệ
                  </>
                ) : (
                  <>
                    <FiPlus size={12} />
                    Thêm công nghệ
                  </>
                )}
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                if (isEditing) {
                  navigate(`/market-trees/${id}/technologies`);
                } else {
                  handleQuickCreateAndNavigate('technologies');
                }
              }}
              className="w-full text-left p-3 border border-gray-100 rounded bg-gray-50/40 hover:bg-gray-100 transition-colors"
              disabled={saving}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-gray-700">
                    {(formData.technologies || []).length} công nghệ đã cấu hình
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {isEditing 
                      ? 'Bấm để mở trang quản lý chi tiết'
                      : 'Bấm để lưu và chuyển sang trang quản lý công nghệ'
                    }
                  </div>
                </div>
                <span className="text-primary text-xs">→</span>
              </div>
            </button>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={handleCancel}
              className="btn-secondary text-xs"
              disabled={saving}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn-primary text-xs flex items-center gap-1.5 disabled:opacity-50"
              disabled={saving}
            >
              <FiSave size={14} />
              {saving
                ? 'Đang lưu...'
                : isEditing
                ? 'Cập nhật'
                : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default MarketTreeForm;
