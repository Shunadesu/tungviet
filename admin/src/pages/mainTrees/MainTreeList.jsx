import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiX,
  FiArrowUp,
  FiArrowDown,
} from 'react-icons/fi';
import Header from '../../components/Header';
import SEO from '../../components/SEO';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../context/NotificationContext';

const MainTreeList = () => {
  const navigate = useNavigate();
  const [trees, setTrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchTrees();
  }, []);

  const fetchTrees = async () => {
    try {
      const res = await adminApi.getMainTrees();
      const data = res.data?.data;
      setTrees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let list = [...trees];
    if (!showInactive) {
      list = list.filter((t) => t.isActive !== false);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.name?.toLowerCase().includes(q) ||
          t.nameEn?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [trees, search, showInactive]);

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa ngành hàng này?')) return;
    try {
      await adminApi.deleteMainTree(id);
      addNotification('Xóa ngành hàng thành công');
      fetchTrees();
    } catch (error) {
      addNotification(error.response?.data?.message || 'Có lỗi xảy ra', 'error');
    }
  };

  const handleMove = async (tree, direction) => {
    const sorted = [...filtered];
    const idx = sorted.findIndex((t) => t._id === tree._id);
    if (idx < 0) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;
    const tmp = sorted[idx];
    sorted[idx] = sorted[targetIdx];
    sorted[targetIdx] = tmp;
    const order = sorted.map((t, i) => ({ _id: t._id, order: i }));
    try {
      await adminApi.reorderMainTrees(order);
      addNotification('Cập nhật thứ tự thành công');
      fetchTrees();
    } catch (err) {
      addNotification('Cập nhật thứ tự thất bại', 'error');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <SEO title="Cây ngành sản phẩm" description="Quản lý cây ngành sản phẩm" url="/main-trees" />
      <Header title="Quản lý cây ngành sản phẩm" />

      <div className="p-4">
        <div className="flex flex-wrap gap-2 items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">
            Danh sách ngành hàng
            <span className="ml-1.5 text-gray-400 font-normal">
              ({filtered.length} {showInactive ? '' : 'đang hoạt động'})
            </span>
          </h2>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded"
              />
              Hiện tạm ẩn
            </label>
            <div className="relative">
              <FiSearch size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-8 pr-8 text-xs py-1.5 w-52"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiX size={12} />
                </button>
              )}
            </div>
            <button
              onClick={() => navigate('/main-trees/new')}
              className="btn-primary flex items-center gap-1 text-xs"
            >
              <FiPlus size={14} />
              Thêm ngành hàng
            </button>
          </div>
        </div>

        <div className="card">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
              <span className="text-3xl">🌳</span>
              <p className="text-sm">
                {search ? 'Không tìm thấy ngành hàng phù hợp' : 'Chưa có ngành hàng nào'}
              </p>
              {!search && (
                <button
                  onClick={() => navigate('/main-trees/new')}
                  className="text-xs text-primary hover:underline"
                >
                  Thêm ngành hàng đầu tiên
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="table-header">
                    <th className="px-2 py-2 text-left text-xs w-12">#</th>
                    <th className="px-2 py-2 text-left text-xs">Tên</th>
                    <th className="px-2 py-2 text-left text-xs">Slug</th>
                    <th className="px-2 py-2 text-left text-xs">Mô tả</th>
                    <th className="px-2 py-2 text-center text-xs">Thứ tự</th>
                    <th className="px-2 py-2 text-right text-xs">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((tree, idx) => (
                    <tr key={tree._id} className="table-row">
                      <td className="px-2 py-2 text-xs text-gray-400 font-mono">{idx + 1}</td>
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-2">
                          {tree.iconUrl ? (
                            <img
                              src={tree.iconUrl}
                              alt=""
                              className="w-7 h-7 rounded object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-7 h-7 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                              🌳
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="text-xs font-medium">{tree.name}</div>
                            {tree.nameEn && (
                              <div className="text-[10px] text-gray-400">{tree.nameEn}</div>
                            )}
                            {tree.isActive === false && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-500 rounded">
                                Tạm ẩn
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-2 text-xs text-gray-500">{tree.slug}</td>
                      <td className="px-2 py-2 text-xs text-gray-500 max-w-xs truncate">
                        {tree.description || '—'}
                      </td>
                      <td className="px-2 py-2 text-center">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleMove(tree, 'up')}
                            className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                            title="Lên"
                          >
                            <FiArrowUp size={12} />
                          </button>
                          <span className="text-xs">{tree.order ?? 0}</span>
                          <button
                            onClick={() => handleMove(tree, 'down')}
                            className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                            title="Xuống"
                          >
                            <FiArrowDown size={12} />
                          </button>
                        </div>
                      </td>
                      <td className="px-2 py-2 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => navigate(`/main-trees/${tree._id}/edit`)}
                            className="p-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                            title="Sửa"
                          >
                            <FiEdit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(tree._id)}
                            className="p-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
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
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MainTreeList;