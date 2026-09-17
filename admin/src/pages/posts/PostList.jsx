import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiChevronUp, FiChevronDown, FiEye, FiEyeOff } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Header from '../../components/Header';
import SEO from '../../components/SEO';
import { useAdminStore, useAdminStoreEntity, useNotification } from '../../hooks/useAdminStore';

const PostList = () => {
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const posts = useAdminStoreEntity('posts');
  const openConfirm = useAdminStore((s) => s.ui.openConfirm);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleting, setDeleting] = useState(null);
  const [toggling, setToggling] = useState(null);

  const fetchItems = useCallback(
    async (p = 1) => {
      await posts.fetchAll({ page: p, limit: 20 });
      // Extract pagination info from store items (if server returns it)
    },
    [posts]
  );

  useEffect(() => {
    fetchItems(page);
  }, [page]);

  const handleDelete = useCallback(
    (id) => {
      openConfirm({
        title: 'Xóa bài viết',
        message: 'Xác nhận xóa bài viết này?',
        confirmText: 'Xóa',
        confirmStyle: 'danger',
        onConfirm: async () => {
          setDeleting(id);
          try {
            await posts.remove(id);
            addNotification('Xóa thành công');
            fetchItems(page);
          } catch {
            addNotification('Xóa thất bại', 'error');
          } finally {
            setDeleting(null);
          }
        },
      });
    },
    [openConfirm, posts, addNotification, page, fetchItems]
  );

  const handleToggleActive = useCallback(
    async (item) => {
      setToggling(item._id);
      try {
        await posts.update(item._id, { isActive: !item.isActive });
        addNotification(item.isActive ? 'Ẩn thành công' : 'Hiện thành công');
        fetchItems(page);
      } catch {
        addNotification('Lỗi', 'error');
      } finally {
        setToggling(null);
      }
    },
    [posts, addNotification, page, fetchItems]
  );

  const moveItem = useCallback(
    async (idx, direction) => {
      const items = posts.allItems;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= items.length) return;
      const reordered = items.map((it, i) => ({
        _id: it._id,
        order: i === targetIdx ? idx : i === idx ? targetIdx : it.order,
      }));
      const orderList = reordered.map((it, i) => ({ ...it, order: i }));
      try {
        await posts.reorder(orderList);
      } catch {
        fetchItems(page);
      }
    },
    [posts, page, fetchItems]
  );

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('vi-VN') : '-';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <SEO title="Bài viết" />
      <Header title="Bài viết" />

      <div className="p-4">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => navigate('/posts/new')}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <FiPlus size={15} /> Thêm mới
          </button>
        </div>

        <div className="card overflow-hidden">
          {posts.loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : posts.allItems.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">
              Chưa có bài viết nào
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="px-3 py-2 w-16 text-left">Ảnh</th>
                  <th className="px-3 py-2 text-left">Tiêu đề</th>
                  <th className="px-3 py-2 w-28 text-left">Danh mục</th>
                  <th className="px-3 py-2 w-20 text-center">Hiển thị</th>
                  <th className="px-3 py-2 w-24 text-center">Thứ tự</th>
                  <th className="px-3 py-2 w-32 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {posts.allItems.map((item, idx) => (
                  <tr key={item._id} className="table-row">
                    <td className="px-3 py-2">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100" />
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-sm font-medium text-gray-800 line-clamp-1">
                        {item.title}
                      </div>
                      <div className="text-xs text-gray-400">{formatDate(item.publishedAt)}</div>
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-500">
                      {item.category?.name ||
                        (typeof item.category === 'string' ? item.category : null) ||
                        '-'}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => handleToggleActive(item)}
                        disabled={toggling === item._id}
                        className={`p-1.5 rounded transition-colors ${
                          item.isActive
                            ? 'text-green-500 hover:bg-green-50'
                            : 'text-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {item.isActive ? <FiEye size={15} /> : <FiEyeOff size={15} />}
                      </button>
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
                          disabled={idx === posts.allItems.length - 1}
                          className="p-1 text-gray-400 hover:text-primary disabled:opacity-30"
                        >
                          <FiChevronDown size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => navigate(`/posts/${item._id}/edit`)}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition-colors"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          disabled={deleting === item._id}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-40"
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

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 rounded text-sm ${
                  page === i + 1
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
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
