import { useEffect, useRef, useState } from 'react';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSave,
  FiX,
  FiUpload,
  FiPhone,
  FiMessageCircle,
  FiMail,
  FiGlobe,
  FiMapPin,
  FiClock,
  FiFacebook,
  FiInstagram,
  FiYoutube,
  FiTwitter,
  FiLinkedin,
  FiMessageSquare,
  FiSend,
  FiHeadphones,
  FiHelpCircle,
} from 'react-icons/fi';
import {
  FaWhatsapp,
  FaTelegram,
  FaLine,
  FaViber,
  FaTiktok,
  FaWeixin,
} from 'react-icons/fa';
import { SiZalo } from 'react-icons/si';
import HeaderWithBreadcrumb from './HeaderWithBreadcrumb';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../context/NotificationContext';

const ICON_OPTIONS = [
  { key: 'FiPhone', label: 'Điện thoại', color: 'text-green-500', Icon: FiPhone },
  { key: 'FiMessageCircle', label: 'Messenger', color: 'text-blue-500', Icon: FiMessageCircle },
  { key: 'FiMail', label: 'Email', color: 'text-red-500', Icon: FiMail },
  { key: 'FiGlobe', label: 'Website', color: 'text-purple-500', Icon: FiGlobe },
  { key: 'FiMapPin', label: 'Địa chỉ', color: 'text-red-500', Icon: FiMapPin },
  { key: 'FiClock', label: 'Giờ mở cửa', color: 'text-orange-500', Icon: FiClock },
  { key: 'FiFacebook', label: 'Facebook', color: 'text-blue-600', Icon: FiFacebook },
  { key: 'FiInstagram', label: 'Instagram', color: 'text-pink-500', Icon: FiInstagram },
  { key: 'FiYoutube', label: 'YouTube', color: 'text-red-600', Icon: FiYoutube },
  { key: 'FiTwitter', label: 'X (Twitter)', color: 'text-sky-500', Icon: FiTwitter },
  { key: 'FiLinkedin', label: 'LinkedIn', color: 'text-blue-700', Icon: FiLinkedin },
  { key: 'FiMessageSquare', label: 'Tin nhắn', color: 'text-indigo-500', Icon: FiMessageSquare },
  { key: 'FiSend', label: 'Gửi', color: 'text-cyan-500', Icon: FiSend },
  { key: 'FiHeadphones', label: 'Hỗ trợ', color: 'text-emerald-500', Icon: FiHeadphones },
  { key: 'FiHelpCircle', label: 'Hỏi đáp', color: 'text-amber-500', Icon: FiHelpCircle },
  { key: 'FaWhatsapp', label: 'WhatsApp', color: 'text-green-500', Icon: FaWhatsapp },
  { key: 'FaTelegram', label: 'Telegram', color: 'text-sky-500', Icon: FaTelegram },
  { key: 'FaLine', label: 'LINE', color: 'text-green-600', Icon: FaLine },
  { key: 'FaViber', label: 'Viber', color: 'text-purple-600', Icon: FaViber },
  { key: 'FaTiktok', label: 'TikTok', color: 'text-gray-900', Icon: FaTiktok },
  { key: 'FaWeixin', label: 'WeChat', color: 'text-green-600', Icon: FaWeixin },
  { key: 'SiZalo', label: 'Zalo', color: 'text-blue-500', Icon: SiZalo },
];

const isIconImageUrl = (value) =>
  typeof value === 'string' && (value.startsWith('http') || value.startsWith('/'));

const generateTempId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const getContactKey = (contact, index) => {
  if (contact?._id != null) {
    if (typeof contact._id === 'string') return contact._id;
    if (typeof contact._id === 'object' && typeof contact._id.toHexString === 'function') {
      return contact._id.toHexString();
    }
    if (typeof contact._id === 'object' && contact._id._id) {
      return String(contact._id._id);
    }
    return String(contact._id);
  }
  return contact?.tempId || `floating-contact-${index}`;
};

const FloatingContactSettings = () => {
  const { addNotification } = useNotification();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ icon: 'FiPhone', url: '', label: '', active: true });
  const [iconUploading, setIconUploading] = useState(false);
  const iconInputRef = useRef(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getSiteConfig();
      const data = res.data?.data?.floatingContacts || [];
      setContacts(data);
    } catch (err) {
      addNotification('Không tải được cấu hình', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleIconUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'].includes(file.type)) {
      addNotification('Chỉ chấp nhận file PNG, JPG, WEBP, SVG', 'error');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      addNotification('File quá lớn (tối đa 2MB)', 'error');
      return;
    }
    setIconUploading(true);
    try {
      const res = await adminApi.uploadImage(file);
      const url = res.data?.data?.url || res.data?.url;
      if (url) {
        setForm((prev) => ({ ...prev, icon: url }));
        addNotification('Upload icon thành công');
      }
    } catch (err) {
      addNotification(err.response?.data?.message || 'Upload thất bại', 'error');
    } finally {
      setIconUploading(false);
      if (iconInputRef.current) iconInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.url.trim()) {
      addNotification('URL là bắt buộc', 'error');
      return;
    }

    setSaving(true);
    try {
      let updated;
      const targetId = editingId;
      if (targetId) {
        updated = contacts.map((c) =>
          (c._id || c.tempId) === targetId ? { ...c, ...form } : c
        );
      } else {
        const newContact = {
          ...form,
          order: contacts.length,
          tempId: generateTempId(),
        };
        updated = [...contacts, newContact];
      }

      await adminApi.updateFloatingContacts(updated);

      if (!editingId) {
        await loadConfig();
      } else {
        setContacts(updated);
      }

      addNotification(editingId ? 'Cập nhật thành công' : 'Thêm thành công');
      resetForm();
    } catch (err) {
      addNotification(err.response?.data?.message || 'Lỗi khi lưu', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (contact) => {
    setEditingId(contact._id || contact.tempId);
    setForm({ icon: contact.icon, url: contact.url, label: contact.label || '', active: contact.active !== false });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có muốn xoá liên hệ này?')) return;

    setSaving(true);
    try {
      const updated = contacts.filter((c) => (c._id || c.tempId) !== id);
      await adminApi.updateFloatingContacts(updated);
      setContacts(updated);
      addNotification('Xoá thành công');
    } catch (err) {
      addNotification('Lỗi khi xoá', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id) => {
    const updated = contacts.map((c) =>
      (c._id || c.tempId) === id ? { ...c, active: c.active === false ? true : false } : c
    );
    setContacts(updated);
    try {
      await adminApi.updateFloatingContacts(updated);
      addNotification('Cập nhật trạng thái thành công');
    } catch (err) {
      setContacts(contacts);
      addNotification('Lỗi khi cập nhật', 'error');
    }
  };

  const handleMove = (index, direction) => {
    const newContacts = [...contacts];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newContacts.length) return;

    [newContacts[index], newContacts[targetIndex]] = [newContacts[targetIndex], newContacts[index]];
    const reordered = newContacts.map((c, i) => ({ ...c, order: i }));
    setContacts(reordered);

    (async () => {
      try {
        await adminApi.updateFloatingContacts(reordered);
        addNotification('Đã sắp xếp lại');
      } catch (err) {
        setContacts(contacts);
        addNotification('Lỗi khi sắp xếp', 'error');
      }
    })();
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ icon: 'FiPhone', url: '', label: '', active: true });
  };

  if (loading) {
    return (
      <>
        <HeaderWithBreadcrumb title="Thanh liên hệ" />
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <HeaderWithBreadcrumb title="Thanh liên hệ" />
      <div className="p-4 pt-3 max-w-3xl">
        <div className="card">
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-3">
              Thanh liên hệ sẽ hiển thị ở góc dưới bên phải màn hình, gồm các icon liên lạc như điện thoại, messenger, zalo...
            </p>

            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary flex items-center gap-2 text-xs"
              >
                <FiPlus size={14} />
                Thêm liên hệ
              </button>
            )}
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">
                  {editingId ? 'Chỉnh sửa liên hệ' : 'Thêm liên hệ mới'}
                </h3>
                <button type="button" onClick={resetForm} className="p-1 hover:bg-gray-200 rounded">
                  <FiX size={16} />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-3 mb-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium mb-2">Chọn icon</label>
                  <div className="grid grid-cols-6 gap-2 p-2 border rounded-lg bg-white max-h-48 overflow-y-auto">
                    {ICON_OPTIONS.map(({ key, label, color, Icon }) => {
                      const isSelected = form.icon === key;
                      return (
                        <button
                          type="button"
                          key={key}
                          onClick={() => setForm({ ...form, icon: key })}
                          className={`flex flex-col items-center justify-center p-2 rounded-md border transition-all ${
                            isSelected
                              ? 'border-primary bg-primary-50'
                              : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                          }`}
                          title={label}
                        >
                          <Icon size={20} className={color} />
                          <span className="text-[10px] text-gray-600 mt-1 truncate w-full text-center">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">Hoặc upload ảnh icon riêng bên dưới</p>
                </div>

                <div className="md:col-span-2">
                  <input
                    ref={iconInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleIconUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => iconInputRef.current?.click()}
                    disabled={iconUploading}
                    className="btn-secondary text-xs flex items-center gap-2"
                  >
                    <FiUpload size={14} />
                    {iconUploading ? 'Đang upload...' : 'Upload icon riêng (PNG/SVG)'}
                  </button>
                  {isIconImageUrl(form.icon) && (
                    <div className="mt-2 flex items-center gap-2 p-2 border rounded bg-white">
                      <img src={form.icon} alt="Icon preview" className="w-8 h-8 object-contain" />
                      <span className="text-xs text-gray-600 flex-1 truncate">{form.icon}</span>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, icon: 'FiPhone' })}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Xoá
                      </button>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium mb-1">URL</label>
                  <input
                    type="text"
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    className="input-field text-xs"
                    placeholder="https://..."
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-xs font-medium mb-1">Mô tả (hiển thị khi hover)</label>
                <input
                  type="text"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  className="input-field text-xs"
                  placeholder="Ví dụ: Hotline 24/7"
                />
              </div>

              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  id="active"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="active" className="text-xs">Hiển thị</label>
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={resetForm} className="btn-secondary text-xs">
                  Huỷ
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 text-xs">
                  <FiSave size={14} />
                  {saving ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          )}

          {contacts.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">Chưa có liên hệ nào</p>
          ) : (
            <div className="space-y-2">
              {contacts.map((contact, index) => {
                const isImage = isIconImageUrl(contact.icon);
                const iconOpt = !isImage
                  ? ICON_OPTIONS.find((o) => o.key === contact.icon) || ICON_OPTIONS[0]
                  : null;
                const ListIcon = iconOpt?.Icon;
                return (
                  <div
                    key={getContactKey(contact, index)}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      contact.active === false ? 'bg-gray-50 opacity-60' : 'bg-white'
                    }`}
                  >
                    <div className="w-8 h-8 flex items-center justify-center">
                      {isImage ? (
                        <img src={contact.icon} alt="" className="w-6 h-6 object-contain" />
                      ) : (
                        ListIcon && <ListIcon className={iconOpt.color} size={20} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{contact.label || 'Không có mô tả'}</p>
                      <p className="text-xs text-gray-400 truncate">{contact.url}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMove(index, 'up')}
                        disabled={index === 0}
                        className="p-1.5 hover:bg-gray-100 rounded text-gray-400 disabled:opacity-30"
                        title="Lên"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => handleMove(index, 'down')}
                        disabled={index === contacts.length - 1}
                        className="p-1.5 hover:bg-gray-100 rounded text-gray-400 disabled:opacity-30"
                        title="Xuống"
                      >
                        ▼
                      </button>
                    </div>

                    <button
                      onClick={() => handleToggleActive(contact._id)}
                      className={`px-2 py-1 text-xs rounded ${
                        contact.active === false
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {contact.active === false ? 'Hiện' : 'Ẩn'}
                    </button>

                    <button
                      onClick={() => handleEdit(contact)}
                      className="p-1.5 hover:bg-blue-50 rounded text-blue-500"
                    >
                      <FiEdit2 size={14} />
                    </button>

                    <button
                      onClick={() => handleDelete(contact._id)}
                      className="p-1.5 hover:bg-red-50 rounded text-red-500"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FloatingContactSettings;
