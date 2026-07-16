import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiAward } from 'react-icons/fi';
import Header from '../../components/Header';
import SEO from '../../components/SEO';
import DataTable from '../../components/DataTable';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../context/NotificationContext';

const LeadershipList = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => { fetchMembers(); /* eslint-disable-next-line */ }, []);

  const fetchMembers = async () => {
    try {
      const res = await adminApi.getLeadership();
      setMembers(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const filtered = useMemo(() => {
    let list = members;
    if (!showInactive) list = list.filter((m) => m.isActive !== false);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.name?.vi?.toLowerCase().includes(q) ||
          m.name?.en?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [members, search, showInactive]);

  const columns = useMemo(
    () => [
      {
        header: 'STT',
        accessor: '_id',
        render: (_, __, idx) => (
          <span className="text-gray-400 font-mono text-xs">{idx + 1}</span>
        ),
      },
      {
        header: 'Anh',
        accessor: 'imageUrl',
        render: (val) => (
          val ? (
            <img src={val} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <FiAward size={16} className="text-gray-400" />
            </div>
          )
        ),
      },
      {
        header: 'Ten & Chuc vu',
        accessor: 'name',
        render: (val, row) => (
          <div className="min-w-0">
            <span className="font-medium text-gray-800 block">{val?.vi || <em className="text-gray-400">(chua co ten VI)</em>}</span>
            {val?.en && <span className="text-xs text-gray-400">{val.en}</span>}
            {row.position?.vi && (
              <span className="block text-xs text-primary mt-0.5">{row.position.vi}</span>
            )}
            {row.isActive === false && (
              <span className="ml-1.5 text-[10px] px-1.5 py-0.5 bg-red-50 text-red-500 rounded">Tam an</span>
            )}
          </div>
        ),
      },
      {
        header: 'Mo ta',
        accessor: 'description',
        render: (val) => (
          <span className="text-xs text-gray-600 line-clamp-2 max-w-xs">
            {val?.vi ? (
              <span dangerouslySetInnerHTML={{ __html: val.vi }} />
            ) : (
              <em className="text-gray-400">Chua co mo ta</em>
            )}
          </span>
        ),
      },
      {
        header: 'Ngay tao',
        accessor: 'createdAt',
        render: (val) => (
          <span className="text-gray-500 text-xs">
            {val ? new Date(val).toLocaleDateString('vi-VN') : '-'}
          </span>
        ),
      },
    ],
    []
  );

  const handleDelete = async (row) => {
    if (!window.confirm(`Xoa thanh vien "${row.name?.vi || row.name?.en || ''}"?`)) return;
    try {
      await adminApi.deleteLeadership(row._id);
      addNotification('Xoa thanh vien thanh cong');
      fetchMembers();
    } catch (err) {
      addNotification(err.response?.data?.message || 'Xoa that bai', 'error');
    }
  };

  const renderActions = (row) => (
    <>
      <button
        onClick={() => navigate(`/leadership/${row._id}/edit`)}
        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
        title="Sua"
      >
        <FiEdit2 size={14} />
      </button>
      <button
        onClick={() => handleDelete(row)}
        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
        title="Xoa"
      >
        <FiTrash2 size={14} />
      </button>
    </>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <SEO title="Leadership" description="Quan ly leadership" url="/leadership" />
      <Header title="Quan ly Leadership" />

      <div className="p-4">
        <div className="flex flex-wrap gap-2 items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">
            Danh sach thanh vien leadership
            <span className="ml-1.5 text-gray-400 font-normal">
              ({filtered.length}{showInactive ? '' : ' dang hoat dong'})
            </span>
          </h2>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded"
              />
              Hien tam an
            </label>
            <div className="relative">
              <FiSearch size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tim ten..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-8 pr-8 text-xs py-2 w-56"
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
              onClick={() => navigate('/leadership/new')}
              className="btn-primary flex items-center gap-2 text-sm px-4 py-2"
            >
              <FiPlus size={16} />
              Them thanh vien
            </button>
          </div>
        </div>

        <div className="card">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
              <FiAward size={48} className="text-gray-300" />
              <p className="text-base">
                {search ? 'Khong tim thay thanh vien phu hop' : 'Chua co thanh vien nao'}
              </p>
              {!search && (
                <button
                  onClick={() => navigate('/leadership/new')}
                  className="btn-primary text-sm px-4 py-2"
                >
                  Them thanh vien dau tien
                </button>
              )}
            </div>
          ) : (
            <DataTable columns={columns} data={filtered} actions={renderActions} />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default LeadershipList;
