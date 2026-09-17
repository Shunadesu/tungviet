import { useState, useEffect, useCallback } from 'react';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiExternalLink,
  FiX,
  FiChevronUp,
  FiChevronDown,
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../../components/Header';
import SEO from '../../components/SEO';
import adminApi from '../../api/adminApi';
import { useAdminStore, useAdminStoreEntity, useNotification } from '../../hooks/useAdminStore';

const emptyForm = () => ({ name: '', logo: '', website: '', type: 'partner' });

const PartnerList = () => {
  const { addNotification } = useNotification();
  const partners = useAdminStoreEntity('partners');
  const openConfirm = useAdminStore((s) => s.ui.openConfirm);

  const [tab, setTab] = useState('partner');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    partners.fetchAll({ type: tab });
  }, [tab, partners]);

  const items = partners.allItems;

  const openAdd = () => {
    setEditItem(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      name: item.name,
      logo: item.logo || '',
      website: item.website || '',
      type: item.type,
    });
    setModalOpen(true);
  };

  const handleSave = useCallback(
    async (e) => {
      e.preventDefault();
      if (!form.name.trim()) {
        addNotification('Tên là bắt buộc', 'error');
        return;
      }
      setSaving(true);
      try {
        if (editItem) {
          await partners.update(editItem._id, form);
          addNotification('Cập nhật thành công');
        } else {
          await partners.create({ ...form, type: tab });
          addNotification('Tạo thành công');
        }
        setModalOpen(false);
        partners.fetchAll({ type: tab });
      } catch (err) {
        addNotification(
          err.response?.data?.message || 'Lỗi',
          'error'
        );
      } finally {
        setSaving(false);
      }
    },
    [form, editItem, tab, partners, addNotification]
  );

  const handleDelete = useCallback(
    (id) => {
      openConfirm({
        title: 'Xóa đối tác',
        message: 'Xác nhận xóa đối tác này?',
        confirmText: 'Xóa',
        confirmStyle: 'danger',
        onConfirm: async () => {
          setDeleting(id);
          try {
            await partners.remove(id);
            addNotification('Xóa thành công');
            partners.fetchAll({ type: tab });
          } catch (err) {
            addNotification('Xóa thất bại', 'error');
          } finally {
            setDeleting(null);
          }
        },
      });
    },
    [openConfirm, partners, addNotification, tab]
  );

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    setUploadingLogo(true);
    try {
      const res = await adminApi.uploadImage(fd);
      const url = res.data?.url || res.data?.data?.url || '';
      if (url) setForm((p) => ({ ...p, logo: url }));
      else addNotification('Upload ảnh thất bại', 'error');
    } catch {
      addNotification('Upload ảnh thất bại', 'error');
    } finally {
      setUploadingLogo(false);
    }
  };

  const moveItem = useCallback(
    async (idx, direction) => {
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= items.length) return;
      const reordered = items.map((it, i) => ({
        _id: it._id,
        order: i === targetIdx ? idx : i === idx ? targetIdx : it.order,
      }));
      const orderList = reordered.map((it, i) => ({ ...it, order: i }));
      try {
        await partners.reorder(orderList);
      } catch {
        partners.fetchAll({ type: tab });
      }
    },
    [items, partners, tab]
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <SEO
        title={tab === 'partner' ? 'Đối tác' : 'Khách hàng'}
      />
      <Header title={tab === 'partner' ? 'Đối tác' : 'Khách hàng'} />

      <div className="p-4">
        <div className="flex gap-2 mb-4">
          {[
            { key: 'partner', label: 'Đối tác' },
            { key: 'customer', label: 'Khách hàng' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.key
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {t.label}
            </button>
          ))}
          <div className="flex-1" />
          <button
            onClick={openAdd}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <FiPlus size={15} /> Thêm mới
          </button>
        </div>

        <div className="card overflow-hidden">
          {partners.loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">
              Chưa có dữ liệu nào
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="px-3 py-2 w-16 text-left">Logo</th>
                  <th className="px-3 py-2 text-left">Tên</th>
                  <th className="px-3 py-2 text-left">Website</th>
                  <th className="px-3 py-2 w-24 text-center">Thứ tự</th>
                  <th className="px-3 py-2 w-24 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={item._id} className="table-row">
                    <td className="px-3 py-2">
                      {item.logo ? (
                        <img
                          src={item.logo}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-contain bg-white border border-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                          No img
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-sm font-medium text-gray-800">
                      {item.name}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-500">
                      {item.website ? (
                        <a
                          href={item.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-500 hover:underline"
                        >
                          <FiExternalLink size={12} />{' '}
                          {item.website.replace(/^https?:\/\//, '')}
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => moveItem(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 text-gray-400 hover:text-primary disabled:opacity-30"
                        >
                          <FiChevronUp size={14} />
                        </button>
                        <span className="text-xs text-gray-500">{idx + 1}</span>
                        <button
                          onClick={() => moveItem(idx, 'down')}
                          disabled={idx === items.length - 1}
                          className="p-1 text-gray-400 hover:text-primary disabled:opacity-30"
                        >
                          <FiChevronDown size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(item)}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition-colors"
                          title="Sửa"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          disabled={deleting === item._id}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-40"
                          title="Xóa"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b">
                <h3 className="font-semibold text-gray-800">
                  {editItem ? 'Sửa đối tác' : 'Thêm đối tác mới'}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <FiX size={18} />
                </button>
              </div>
              <form onSubmit={handleSave} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Tên *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className="input-field"
                    placeholder="VD: Công ty ABC"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Logo
                  </label>
                  <div className="flex items-center gap-3">
                    {form.logo ? (
                      <img
                        src={form.logo}
                        alt="logo"
                        className="w-16 h-16 rounded-lg object-contain bg-white border border-gray-200"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">
                        Chưa có
                      </div>
                    )}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="logo-upload"
                        onChange={handleLogoUpload}
                      />
                      <label
                        htmlFor="logo-upload"
                        className="btn-secondary text-xs cursor-pointer"
                      >
                        {uploadingLogo ? 'Đang tải...' : 'Tải logo'}
                      </label>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    value={form.website}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, website: e.target.value }))
                    }
                    className="input-field"
                    placeholder="https://example.com"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="btn-secondary text-sm"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary text-sm disabled:opacity-60"
                  >
                    {saving ? 'Đang lưu...' : 'Lưu'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PartnerList;
