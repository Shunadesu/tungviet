import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import Header from '../../components/Header';
import Modal from '../../components/Modal';
import SEO from '../../components/SEO';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../context/NotificationContext';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const { addNotification } = useNotification();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await adminApi.getCategories();
      setCategories(res.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await adminApi.updateCategory(editingCategory._id, formData);
        addNotification('Cập nhật danh mục thành công');
      } else {
        await adminApi.createCategory(formData);
        addNotification('Thêm danh mục thành công');
      }
      
      setModalOpen(false);
      setEditingCategory(null);
      resetForm();
      fetchCategories();
    } catch (error) {
      addNotification(error.response?.data?.message || 'Có lỗi xảy ra', 'error');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      imageUrl: category.imageUrl || '',
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return;
    try {
      await adminApi.deleteCategory(id);
      addNotification('Xóa danh mục thành công');
      fetchCategories();
    } catch (error) {
      addNotification('Có lỗi xảy ra', 'error');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', imageUrl: '' });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <SEO title="Categories" description="Manage product categories" url="/categories" />
      <Header title="Quản lý danh mục" />
      
      <div className="p-4">
        <div className="card">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-semibold">Danh sách danh mục ({categories.length})</h2>
            <button
              onClick={() => { resetForm(); setEditingCategory(null); setModalOpen(true); }}
              className="btn-primary flex items-center gap-1 text-xs"
            >
              <FiPlus size={14} />
              Thêm danh mục
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {categories.map((category) => (
                <div key={category._id} className="border rounded-lg p-2">
                  <img
                    src={category.imageUrl || 'https://via.placeholder.com/150'}
                    alt={category.name}
                    className="w-full h-24 object-cover rounded mb-2"
                  />
                  <h3 className="text-xs font-medium truncate">{category.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">{category.description}</p>
                  <div className="flex gap-1 mt-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="flex-1 p-1 bg-blue-50 text-blue-600 rounded text-xs hover:bg-blue-100"
                    >
                      <FiEdit2 size={12} className="mx-auto" />
                    </button>
                    <button
                      onClick={() => handleDelete(category._id)}
                      className="flex-1 p-1 bg-red-50 text-red-600 rounded text-xs hover:bg-red-100"
                    >
                      <FiTrash2 size={12} className="mx-auto" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Sửa danh mục' : 'Thêm danh mục'}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1">Tên danh mục *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Link ảnh</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="input-field"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Mô tả</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="input-field resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary text-xs">
              Hủy
            </button>
            <button type="submit" className="btn-primary text-xs">
              {editingCategory ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default CategoryList;
