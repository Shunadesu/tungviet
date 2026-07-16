import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX } from 'react-icons/fi';
import HeaderWithBreadcrumb from './HeaderWithBreadcrumb';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../context/NotificationContext';

const ICON_OPTIONS = [
  { value: 'FiPhone', label: 'Phone', color: 'text-green-500' },
  { value: 'FiMessageCircle', label: 'Messenger', color: 'text-blue-500' },
  { value: 'Zalo', label: 'Zalo', color: 'text-blue-500' },
  { value: 'FiMail', label: 'Email', color: 'text-red-500' },
  { value: 'FiGlobe', label: 'Website', color: 'text-purple-500' },
  { value: 'FiMapPin', label: 'Location', color: 'text-red-500' },
  { value: 'FiClock', label: 'Hours', color: 'text-orange-500' },
];

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
      addNotification('Khong tai duoc cau hinh', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.url.trim()) {
      addNotification('URL la bat buoc', 'error');
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
      
      addNotification(editingId ? 'Cap nhat thanh cong' : 'Them thanh cong');
      resetForm();
    } catch (err) {
      addNotification(err.response?.data?.message || 'Loi khi luu', 'error');
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
    if (!window.confirm('Ban co muon xoa lien he nay?')) return;

    setSaving(true);
    try {
      const updated = contacts.filter((c) => (c._id || c.tempId) !== id);
      await adminApi.updateFloatingContacts(updated);
      setContacts(updated);
      addNotification('Xoa thanh cong');
    } catch (err) {
      addNotification('Loi khi xoa', 'error');
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
      addNotification('Cap nhat trang thai thanh cong');
    } catch (err) {
      setContacts(contacts);
      addNotification('Loi khi cap nhat', 'error');
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
        addNotification('Da sap xep lai');
      } catch (err) {
        setContacts(contacts);
        addNotification('Loi khi sap xep', 'error');
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
        <HeaderWithBreadcrumb title="Thanh lien he" />
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <HeaderWithBreadcrumb title="Thanh lien he" />
      <div className="p-4 pt-3 max-w-3xl">
        <div className="card">
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-3">
              Thanh lien he se hien thi o goc duoi ben phai man hinh, gom cac icon lien lac nhu dien thoai, messenger, zalo...
            </p>

            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary flex items-center gap-2 text-xs"
              >
                <FiPlus size={14} />
                Them lien he
              </button>
            )}
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">
                  {editingId ? 'Chinh sua lien he' : 'Them lien he moi'}
                </h3>
                <button type="button" onClick={resetForm} className="p-1 hover:bg-gray-200 rounded">
                  <FiX size={16} />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Icon</label>
                  <select
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    className="input-field text-xs"
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
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
                <label className="block text-xs font-medium mb-1">Mo ta (hien thi khi hover)</label>
                <input
                  type="text"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  className="input-field text-xs"
                  placeholder="Vi du: Hotline 24/7"
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
                <label htmlFor="active" className="text-xs">Hien thi</label>
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={resetForm} className="btn-secondary text-xs">
                  Huy
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 text-xs">
                  <FiSave size={14} />
                  {saving ? 'Dang luu...' : 'Luu'}
                </button>
              </div>
            </form>
          )}

          {contacts.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">Chua co lien he nao</p>
          ) : (
            <div className="space-y-2">
              {contacts.map((contact, index) => {
                const iconOpt = ICON_OPTIONS.find((o) => o.value === contact.icon) || ICON_OPTIONS[0];
                return (
                  <div
                    key={getContactKey(contact, index)}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      contact.active === false ? 'bg-gray-50 opacity-60' : 'bg-white'
                    }`}
                  >
                    <span className={`${iconOpt.color} font-bold text-sm w-6 text-center`}>
                      {iconOpt.label.charAt(0)}
                    </span>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{contact.label || 'Khong co mo ta'}</p>
                      <p className="text-xs text-gray-400 truncate">{contact.url}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMove(index, 'up')}
                        disabled={index === 0}
                        className="p-1.5 hover:bg-gray-100 rounded text-gray-400 disabled:opacity-30"
                        title="Len"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => handleMove(index, 'down')}
                        disabled={index === contacts.length - 1}
                        className="p-1.5 hover:bg-gray-100 rounded text-gray-400 disabled:opacity-30"
                        title="Xuong"
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
                      {contact.active === false ? 'Hien' : 'An'}
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
