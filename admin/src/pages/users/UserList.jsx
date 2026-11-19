import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiX, FiEye } from 'react-icons/fi';
import Header from '../../components/Header';
import SEO from '../../components/SEO';
import adminApi from '../../api/adminApi';

const PAGE_SIZE = 20;

const formatDate = (d) => (d ? new Date(d).toLocaleDateString('vi-VN') : '-');

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Debounce ô tìm kiếm, mỗi lần đổi từ khoá quay về trang 1
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.getUsers({ page, limit: PAGE_SIZE, search: debouncedSearch });
      const data = res.data?.data || {};
      setUsers(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Không tải được danh sách người dùng');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openDetail = async (id) => {
    setDetailLoading(true);
    try {
      const res = await adminApi.getUserDetail(id);
      setDetail(res.data?.data || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Không tải được chi tiết người dùng');
    } finally {
      setDetailLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <SEO title="Người dùng" />
      <Header title="Người dùng" />

      <div className="p-4">
        <div className="flex flex-wrap gap-2 items-center justify-between mb-4">
          <p className="text-sm text-gray-500">Tổng {total} người dùng</p>
          <div className="relative">
            <FiSearch size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm họ tên, email, SĐT, công ty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-8 pr-8 text-xs py-2 w-72"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FiX size={12} />
              </button>
            )}
          </div>
        </div>

        {error && <div className="bg-red-50 text-red-600 text-xs p-2 rounded-lg mb-3">{error}</div>}

        <div className="card overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">
              {debouncedSearch ? 'Không tìm thấy người dùng nào' : 'Chưa có người dùng nào'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="table-header">
                    {['Họ tên', 'Công ty', 'Số điện thoại', 'Email', 'Ngày đăng ký', 'Báo giá', 'Lượt tải TDS', ''].map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="table-row">
                      <td className="px-3 py-2 text-xs font-medium text-gray-800">{u.name}</td>
                      <td className="px-3 py-2 text-xs text-gray-600">{u.company || '-'}</td>
                      <td className="px-3 py-2 text-xs">
                        {u.phone ? <a href={`tel:${u.phone}`} className="text-primary hover:underline">{u.phone}</a> : '-'}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        <a href={`mailto:${u.email}`} className="text-blue-600 hover:underline">{u.email}</a>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-500">{formatDate(u.createdAt)}</td>
                      <td className="px-3 py-2 text-xs text-center font-medium">{u.quoteCount}</td>
                      <td className="px-3 py-2 text-xs text-center font-medium">{u.tdsCount}</td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => openDetail(u._id)}
                          className="text-primary hover:text-primary/80"
                          title="Xem chi tiết"
                        >
                          <FiEye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-end gap-2 mt-3 text-xs">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 rounded border disabled:opacity-40"
            >
              Trước
            </button>
            <span className="text-gray-500">Trang {page} / {totalPages}</span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded border disabled:opacity-40"
            >
              Sau
            </button>
          </div>
        )}
      </div>

      {(detail || detailLoading) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setDetail(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="text-base font-semibold">Chi tiết người dùng</h3>
              <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-600">
                <FiX size={20} />
              </button>
            </div>

            {detailLoading || !detail ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <div className="p-4 space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-xs text-gray-500">Họ tên</p><p className="font-medium">{detail.user.name}</p></div>
                  <div><p className="text-xs text-gray-500">Công ty</p><p className="font-medium">{detail.user.company || '-'}</p></div>
                  <div><p className="text-xs text-gray-500">Email</p><p>{detail.user.email}</p></div>
                  <div><p className="text-xs text-gray-500">Điện thoại</p><p>{detail.user.phone || '-'}</p></div>
                  <div><p className="text-xs text-gray-500">Số báo giá</p><p className="font-medium">{detail.quoteCount}</p></div>
                  <div><p className="text-xs text-gray-500">Số lượt tải TDS</p><p className="font-medium">{detail.tdsCount}</p></div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-2">Báo giá đã gửi ({detail.quotes.length})</p>
                  {detail.quotes.length === 0 ? (
                    <p className="text-xs text-gray-400">Chưa có báo giá</p>
                  ) : (
                    <ul className="space-y-1 text-xs">
                      {detail.quotes.map((q) => (
                        <li key={q._id} className="flex justify-between border rounded p-2">
                          <span>{q.items?.length ? `${q.items.length} sản phẩm` : q.productType || q.market || 'Báo giá'}</span>
                          <span className="text-gray-500">{formatDate(q.createdAt)} · {q.status}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-2">Lượt tải TDS ({detail.tdsDownloads.length})</p>
                  {detail.tdsDownloads.length === 0 ? (
                    <p className="text-xs text-gray-400">Chưa tải TDS</p>
                  ) : (
                    <ul className="space-y-1 text-xs">
                      {detail.tdsDownloads.map((d) => (
                        <li key={d._id} className="flex justify-between border rounded p-2">
                          <span>{d.product?.name || 'Sản phẩm đã xoá'}</span>
                          <span className="text-gray-500">{formatDate(d.createdAt)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default UserList;
