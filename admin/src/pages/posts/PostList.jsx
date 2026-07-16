import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiChevronUp, FiChevronDown, FiEye, FiEyeOff } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../../components/Header';
import SEO from '../../components/SEO';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../context/NotificationContext';

const PostList = () => {
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleting, setDeleting] = useState(null);
  const [toggling, setToggling] = useState(null);

  const fetchItems = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await adminApi.getPosts({ page: p, limit: 20 });
      const data = res.data?.data || {};
      setItems(data.items || []);
      setPage(data.page || 1);
      setTotalPages(data.pages || 1);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItems(page); }, [page]);

  const handleDelete = async (id) => {
    if (!window.confirm('Xac nhan xoa bai viet nay?')) return;
    setDeleting(id);
    try {
      await adminApi.deletePost(id);
      addNotification('Xoa thanh cong');
      fetchItems(page);
    } catch { addNotification('Xoa that bai', 'error'); }
    finally { setDeleting(null); }
  };

  const handleToggleActive = async (item) => {
    setToggling(item._id);
    try {
      await adminApi.updatePost(item._id, { isActive: !item.isActive });
      addNotification(item.isActive ? 'An thanh cong' : 'Hien thanh cong');
      fetchItems(page);
    } catch { addNotification('Loi', 'error'); }
    finally { setToggling(null); }
  };

  const moveItem = useCallback(async (idx, direction) => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const orderList = items.map((it, i) => ({
      _id: it._id,
      order: i === idx ? targetIdx : i === targetIdx ? idx : it.order,
    }));
    const reordered = orderList.map((it, i) => ({ ...it, order: i }));
    setItems(reordered.map((it, i) => ({ ...items.find((x) => x._id === it._id), order: i })));
    try { await adminApi.reorderPosts(reordered); } catch { fetchItems(page); }
  }, [items, page]);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '-';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <SEO title="Bai viet" />
      <Header title="Bai viet" />

      <div className="p-4">
        <div className="flex justify-end mb-4">
          <button onClick={() => navigate('/posts/new')} className="btn-primary flex items-center gap-2 text-sm">
            <FiPlus size={15} /> Them moi
          </button>
        </div>

        <div className="card overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">Chua co bai viet nao</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="px-3 py-2 w-16 text-left">Anh</th>
                  <th className="px-3 py-2 text-left">Tieu de</th>
                  <th className="px-3 py-2 w-28 text-left">Danh muc</th>
                  <th className="px-3 py-2 w-20 text-center">Hien thi</th>
                  <th className="px-3 py-2 w-24 text-center">Thu tu</th>
                  <th className="px-3 py-2 w-32 text-right">Thao tac</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={item._id} className="table-row">
                    <td className="px-3 py-2">
                      {item.thumbnail ? (
                        <img src={item.thumbnail} alt={item.title} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100" />
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-sm font-medium text-gray-800 line-clamp-1">{item.title}</div>
                      <div className="text-xs text-gray-400">{formatDate(item.publishedAt)}</div>
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-500">{item.category || '-'}</td>
                    <td className="px-3 py-2 text-center">
                      <button onClick={() => handleToggleActive(item)} disabled={toggling === item._id}
                        className={`p-1.5 rounded transition-colors ${item.isActive ? 'text-green-500 hover:bg-green-50' : 'text-gray-300 hover:bg-gray-100'}`}>
                        {item.isActive ? <FiEye size={15} /> : <FiEyeOff size={15} />}
                      </button>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => moveItem(idx, 'up')} disabled={idx === 0}
                          className="p-1 text-gray-400 hover:text-primary disabled:opacity-30"><FiChevronUp size={14} /></button>
                        <span className="text-xs text-gray-500">{idx + 1}</span>
                        <button onClick={() => moveItem(idx, 'down')} disabled={idx === items.length - 1}
                          className="p-1 text-gray-400 hover:text-primary disabled:opacity-30"><FiChevronDown size={14} /></button>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => navigate(`/posts/${item._id}/edit`)}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition-colors"><FiEdit2 size={14} /></button>
                        <button onClick={() => handleDelete(item._id)} disabled={deleting === item._id}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-40"><FiTrash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                className={`w-8 h-8 rounded text-sm ${page === i + 1 ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PostList;
