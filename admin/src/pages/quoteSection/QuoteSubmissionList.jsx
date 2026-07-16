import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiX } from 'react-icons/fi';
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
    return submissions.filter(
      (s) =>
        s.name?.toLowerCase().includes(filter.toLowerCase()) ||
        s.email?.toLowerCase().includes(filter.toLowerCase()) ||
        s.phone?.includes(filter)
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
              placeholder="Tim ho ten, email, so dien thoai..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-field pl-8 pr-8 text-xs py-2 w-64"
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
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ho ten</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dien thoai</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">San pham</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dia diem</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trang thai</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngay gui</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <tr key={row._id} className="table-row">
                      <td className="px-3 py-2 text-xs font-medium text-gray-800">{row.name}</td>
                      <td className="px-3 py-2 text-xs">
                        <a href={`mailto:${row.email}`} className="text-blue-600 hover:underline">{row.email}</a>
                      </td>
                      <td className="px-3 py-2 text-xs">
                        <a href={`tel:${row.phone}`} className="text-primary hover:underline">{row.phone}</a>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-600">{row.productType || '-'}</td>
                      <td className="px-3 py-2 text-xs text-gray-600">{row.market || '-'}</td>
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

export default QuoteSubmissionList;
