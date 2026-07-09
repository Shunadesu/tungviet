import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import Header from '../components/Header';
import Modal from '../components/Modal';
import RichEditor from '../components/RichEditor';
import adminApi from '../api/adminApi';
import { useNotification } from '../context/NotificationContext';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const { addNotification } = useNotification();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    imageUrl: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        adminApi.getProducts(),
        adminApi.getCategories(),
      ]);
      setProducts(productsRes.data.data);
      setCategories(categoriesRes.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...formData, price: Number(formData.price), stock: Number(formData.stock) };
      
      if (editingProduct) {
        await adminApi.updateProduct(editingProduct._id, data);
        addNotification('Cập nhật sản phẩm thành công');
      } else {
        await adminApi.createProduct(data);
        addNotification('Thêm sản phẩm thành công');
      }
      
      setModalOpen(false);
      setEditingProduct(null);
      resetForm();
      fetchData();
    } catch (error) {
      addNotification(error.response?.data?.message || 'Có lỗi xảy ra', 'error');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId?._id || product.categoryId,
      imageUrl: product.imageUrl || '',
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    try {
      await adminApi.deleteProduct(id);
      addNotification('Xóa sản phẩm thành công');
      fetchData();
    } catch (error) {
      addNotification('Có lỗi xảy ra', 'error');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', stock: '', categoryId: '', imageUrl: '' });
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + 'đ';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Header title="Quản lý sản phẩm" />
      
      <div className="p-4">
        <div className="card">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-semibold">Danh sách sản phẩm ({products.length})</h2>
            <button
              onClick={() => { resetForm(); setEditingProduct(null); setModalOpen(true); }}
              className="btn-primary flex items-center gap-1 text-xs"
            >
              <FiPlus size={14} />
              Thêm sản phẩm
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="table-header">
                    <th className="px-2 py-2 text-left">Ảnh</th>
                    <th className="px-2 py-2 text-left">Tên</th>
                    <th className="px-2 py-2 text-left">Danh mục</th>
                    <th className="px-2 py-2 text-left">Giá</th>
                    <th className="px-2 py-2 text-left">Kho</th>
                    <th className="px-2 py-2 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id} className="table-row">
                      <td className="px-2 py-2">
                        <img
                          src={product.imageUrl || 'https://via.placeholder.com/40'}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      </td>
                      <td className="px-2 py-2 text-xs font-medium">{product.name}</td>
                      <td className="px-2 py-2 text-xs">{product.categoryId?.name}</td>
                      <td className="px-2 py-2 text-xs text-primary font-medium">{formatPrice(product.price)}</td>
                      <td className="px-2 py-2 text-xs">{product.stock}</td>
                      <td className="px-2 py-2 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                          >
                            <FiEdit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="p-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1">Tên sản phẩm *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Giá (VNĐ) *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Số lượng *</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Danh mục *</label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              required
              className="input-field"
            >
              <option value="">Chọn danh mục</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
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
            <RichEditor
              value={formData.description}
              onChange={(value) => setFormData({ ...formData, description: value })}
              placeholder="Nhập mô tả sản phẩm..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary text-xs">
              Hủy
            </button>
            <button type="submit" className="btn-primary text-xs">
              {editingProduct ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default ProductList;
