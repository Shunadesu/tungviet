import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiX, FiEye, FiPackage, FiMail, FiPhone } from 'react-icons/fi';
import Header from '../../components/Header';
import SEO from '../../components/SEO';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../context/NotificationContext';

const STATUS_COLORS = {
  new: 'bg-blue-50 text-blue-600',
  contacted: 'bg-yellow-50 text-yellow-600',
  closed: 'bg-gray-100 text-gray-500',
};

const QuoteSubmissionList = () => {
  const { addNotification } = useNotification();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [detail, setDetail] = useState(null);

  useEffect(() => { fetchSubmissions(); }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await adminApi.getQuoteSubmissions();
      setSubmissions(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await adminApi.updateQuoteSubmission(id, { status });
      addNotification('Cap nhat trang thai thanh cong');
      fetchSubmissions();
    } catch (err) {
      addNotification('Cap nhat that bai', 'error');
    }
  };

  const filtered = useMemo(() => {
    if (!filter) return submissions;
    const q = filter.toLowerCase();
    return submissions.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.phone?.includes(q) ||
        s.company?.toLowerCase().includes(q) ||
        (s.items || []).some((it) => it.name?.toLowerCase().includes(q))
    );
  }, [submissions, filter]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <SEO title="Yeu cau Bao gia" />
      <Header title="Yeu cau Bao gia" />

      <div className="p-4">
        <div className="flex flex-wrap gap-2 items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            Tong {filtered.length} yeu cau
          </p>
          <div className="relative">
            <FiSearch size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tim ho ten, email, cong ty, san pham..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-field pl-8 pr-8 text-xs py-2 w-72"
            />
            {filter && (
              <button onClick={() => setFilter('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <FiX size={12} />
              </button>
            )}
          </div>
        </div>

        <div className="card overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">
              {filter ? 'Khong tim thay yeu cau nao' : 'Chua co yeu cau nao'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="table-header">
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khach hang</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lien he</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cong ty</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SP</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uu tien</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trang thai</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngay gui</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <tr key={row._id} className="table-row">
                      <td className="px-3 py-2 text-xs font-medium text-gray-800">{row.name}</td>
                      <td className="px-3 py-2 text-xs">
                        <div className="flex flex-col gap-0.5">
                          <a href={`mailto:${row.email}`} className="text-blue-600 hover:underline">{row.email}</a>
                          <a href={`tel:${row.phone}`} className="text-primary hover:underline">{row.phone}</a>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-600">{row.company || '-'}</td>
                      <td className="px-3 py-2 text-xs text-gray-600">
                        {row.items?.length > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                            <FiPackage size={10} />
                            {row.items.length}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-600">
                        {row.preferredContact === 'phone' ? (
                          <span className="inline-flex items-center gap-1 text-primary">
                            <FiPhone size={12} /> Điện thoại
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-blue-600">
                            <FiMail size={12} /> Email
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={row.status}
                          onChange={(e) => handleStatusChange(row._id, e.target.value)}
                          className={`text-xs px-2 py-1 rounded border-0 cursor-pointer font-medium ${STATUS_COLORS[row.status] || ''}`}
                        >
                          <option value="new">Moi</option>
                          <option value="contacted">Da lien he</option>
                          <option value="closed">Da dong</option>
                        </select>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-500">
                        {row.createdAt ? new Date(row.createdAt).toLocaleDateString('vi-VN') : '-'}
                      </td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => setDetail(row)}
                          className="text-primary hover:text-primary/80"
                          title="Xem chi tiet"
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
      </div>

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => setDetail(null)}>
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="text-base font-semibold">Chi tiet yeu cau bao gia</h3>
              <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-600">
                <FiX size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Ho ten</p>
                  <p className="font-medium">{detail.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Cong ty</p>
                  <p className="font-medium">{detail.company || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Email</p>
                  <a href={`mailto:${detail.email}`} className="text-blue-600 hover:underline">{detail.email}</a>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Dien thoai</p>
                  <a href={`tel:${detail.phone}`} className="text-primary hover:underline">{detail.phone}</a>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Uu tien lien lac</p>
                  <p className="font-medium">{detail.preferredContact === 'phone' ? 'Điện thoại' : 'Email'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Ngay gui</p>
                  <p>{detail.createdAt ? new Date(detail.createdAt).toLocaleString('vi-VN') : '-'}</p>
                </div>
              </div>

              {detail.message && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Loi nhan</p>
                  <div className="bg-gray-50 rounded p-3 text-sm whitespace-pre-wrap">{detail.message}</div>
                </div>
              )}

              <div>
                <p className="text-xs text-gray-500 mb-2">San pham yeu cau ({detail.items?.length || 0})</p>
                {detail.items?.length > 0 ? (
                  <div className="space-y-2">
                    {detail.items.map((it, idx) => (
                      <div key={idx} className="flex items-center gap-3 border rounded-lg p-2">
                        {it.imageUrl ? (
                          <img src={it.imageUrl} alt={it.name} className="w-12 h-12 object-cover rounded bg-gray-100" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                            <FiPackage size={16} className="text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-2">{it.name}</p>
                          {it.softeningPoint && (
                            <p className="text-xs text-gray-500">{it.softeningPoint}</p>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">SL: {it.quantity}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">Khong co san pham</p>
                )}
              </div>

              {detail.productType && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Loai san pham (QuoteSection)</p>
                  <p className="text-sm">{detail.productType}</p>
                </div>
              )}
              {detail.market && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Thi truong (QuoteSection)</p>
                  <p className="text-sm">{detail.market}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default QuoteSubmissionList;
