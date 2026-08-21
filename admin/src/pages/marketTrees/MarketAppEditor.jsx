import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiArrowLeft,
  FiSave,
  FiPackage,
  FiPlus,
  FiTrash2,
} from 'react-icons/fi';
import HeaderWithBreadcrumb from '../settings/HeaderWithBreadcrumb';
import SEO from '../../components/SEO';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../context/NotificationContext';
import SubDocEditorCard, { emptyApplication } from '../../components/SubDocEditorCard';

const ProductEntryRow = ({
  productId,
  applicationIndex,
  product,
  onChange,
  onRemove,
}) => {
  const applications = Array.isArray(product?.applications) ? product.applications : [];
  return (
    <div className="flex items-start gap-2 p-2 border border-gray-100 rounded bg-white">
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
      <div className="min-w-0 flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
        <div>
          <div className="text-[10px] text-gray-500 mb-0.5">Sản phẩm</div>
          <div className="text-xs font-medium truncate">
            {product?.name || `Sản phẩm #${productId}`}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-gray-500 mb-0.5">Ứng dụng (index)</div>
          <select
            value={applicationIndex}
            onChange={(e) => onChange(Number(e.target.value))}
            className="input-field text-xs w-full"
          >
            {applications.length === 0 && (
              <option value={applicationIndex}>
                # {applicationIndex + 1} (chưa có ứng dụng)
              </option>
            )}
            {applications.map((app, idx) => (
              <option key={app._id || idx} value={idx}>
                # {idx + 1} {app.title || app.titleEn || ''}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="p-1 bg-red-50 text-red-600 rounded hover:bg-red-100 flex-shrink-0"
        title="Bỏ sản phẩm"
      >
        <FiTrash2 size={12} />
      </button>
    </div>
  );
};

const MarketAppEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingSubDoc, setUploadingSubDoc] = useState(false);
  const [parentName, setParentName] = useState('');
  const [availableMainTrees, setAvailableMainTrees] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [items, setItems] = useState([]);

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
        setItems(
          Array.isArray(tree.applications)
            ? tree.applications.map((a) => ({
                ...emptyApplication,
                ...a,
                linkToMainTree: a.linkToMainTree?._id || a.linkToMainTree || null,
                productEntries: Array.isArray(a.productEntries)
                  ? a.productEntries.map((entry) => ({
                      productId: entry.productId?._id || entry.productId || null,
                      applicationIndex: Number.isFinite(entry.applicationIndex)
                        ? entry.applicationIndex
                        : -1,
                    }))
                  : [],
              }))
            : []
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
    setItems((prev) => [
      ...prev,
      { ...emptyApplication, order: prev.length, _new: true },
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

  const addProductToApp = (appIndex, productId) => {
    setItems((prev) => {
      const list = [...prev];
      const current = Array.isArray(list[appIndex].productEntries)
        ? [...list[appIndex].productEntries]
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
      list[appIndex] = { ...list[appIndex], productEntries: current };
      return list;
    });
  };

  const updateAppProductEntries = (appIndex, entries) => {
    setItems((prev) => {
      const list = [...prev];
      list[appIndex] = { ...list[appIndex], productEntries: entries };
      return list;
    });
  };

  const removeAppProduct = (appIndex, productId) => {
    setItems((prev) => {
      const list = [...prev];
      const current = (list[appIndex].productEntries || []).filter(
        (entry) => String(entry.productId) !== String(productId)
      );
      list[appIndex] = { ...list[appIndex], productEntries: current };
      return list;
    });
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const payload = {
        applications: items.map((a) => ({
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
      };
      await adminApi.updateMarketTree(id, payload);
      addNotification(`Đã lưu ${items.length} ứng dụng`);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <>
      <SEO title="Quản lý ứng dụng" description="Quản lý ứng dụng cây ngành" url="/market-trees" />
      <HeaderWithBreadcrumb
        title="Ứng dụng"
        breadcrumbs={[
          { label: 'Cây ngành thị trường', path: '/market-trees' },
          { label: parentName || '...', path: `/market-trees/${id}/edit` },
          { label: 'Ứng dụng' },
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
        <div className="card max-w-4xl mx-auto space-y-3">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <FiPackage className="text-primary" size={18} />
              <h2 className="text-sm font-semibold text-gray-700">
                Ứng dụng (applications) · {stats.valid}/{stats.total} hợp lệ
              </h2>
            </div>
            <button
              type="button"
              onClick={addItem}
              className="btn-primary flex items-center gap-1 text-xs"
            >
              <FiPlus size={12} />
              Thêm ứng dụng
            </button>
          </div>

          {items.length === 0 ? (
            <p className="text-xs text-gray-400 italic py-6 text-center">
              Chưa có ứng dụng nào. Bấm "Thêm ứng dụng" để bắt đầu.
            </p>
          ) : (
            <div className="space-y-3">
              {items.map((item, appIndex) => {
                const usedIds = new Set(
                  (item.productEntries || []).map((entry) =>
                    String(entry.productId)
                  )
                );
                const candidates = availableProducts.filter(
                  (p) => !usedIds.has(String(p._id))
                );
                return (
                  <div key={`app-${appIndex}`} className="space-y-2">
                    <SubDocEditorCard
                      item={item}
                      index={appIndex}
                      kind="applications"
                      defaultExpanded={!!item._new}
                      onUpdate={(next) => updateItem(appIndex, next)}
                      onRemove={() => removeItem(appIndex)}
                      onUploadImage={(file) =>
                        handleSubDocImageUpload(appIndex, file)
                      }
                      uploadingImage={uploadingSubDoc}
                      availableMainTrees={availableMainTrees}
                    />
                    <div className="ml-3 p-2 bg-white border border-gray-100 rounded">
                      <label className="block text-[10px] font-medium mb-1 text-gray-600">
                        Sản phẩm sử dụng ({(item.productEntries || []).length} đã chọn)
                      </label>
                      {candidates.length === 0 ? (
                        <p className="text-[10px] text-gray-400 italic">
                          {availableProducts.length === 0
                            ? 'Chưa có sản phẩm nào trong hệ thống.'
                            : 'Đã thêm tất cả sản phẩm.'}
                        </p>
                      ) : (
                        <select
                          value=""
                          onChange={(e) => {
                            const value = e.target.value;
                            e.target.value = '';
                            if (value) addProductToApp(appIndex, value);
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
                      )}
                      <div className="space-y-1 mt-2">
                        {(item.productEntries || []).map((entry, eIdx) => {
                          const product = productMap.get(String(entry.productId));
                          return (
                            <ProductEntryRow
                              key={`entry-${appIndex}-${eIdx}`}
                              productId={entry.productId}
                              applicationIndex={entry.applicationIndex}
                              product={product}
                              onChange={(newIdx) => {
                                const list = [...(item.productEntries || [])];
                                list[eIdx] = { ...list[eIdx], applicationIndex: newIdx };
                                updateAppProductEntries(appIndex, list);
                              }}
                              onRemove={() =>
                                removeAppProduct(appIndex, entry.productId)
                              }
                            />
                          );
                        })}
                        {(item.productEntries || []).length === 0 && (
                          <p className="text-[10px] text-gray-400 italic">
                            Chưa chọn sản phẩm nào cho ứng dụng này.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
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

export default MarketAppEditor;