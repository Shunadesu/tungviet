import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiFile, FiEye } from 'react-icons/fi';
import Header from '../../components/Header';
import SEO from '../../components/SEO';
import DataTable from '../../components/DataTable';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../context/NotificationContext';

const MarketList = () => {
  const navigate = useNavigate();
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchMarkets();
  }, []);

  const fetchMarkets = async () => {
    try {
      const res = await adminApi.getMarkets({ page: 1, limit: 100 });
      setMarkets(res.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let list = markets;
    if (!showInactive) {
      list = list.filter((m) => m.isActive !== false);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.title?.toLowerCase().includes(q) ||
          m.titleEn?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [markets, search, showInactive]);

  const columns = useMemo(
    () => [
      {
        header: 'STT',
        accessor: '_id',
        render: (_, row, idx) => (
          <span className="text-gray-400 font-mono text-xs">{idx + 1}</span>
        ),
      },
      {
        header: 'Thị trường',
        accessor: 'title',
        render: (val, row) => (
          <div className="flex items-center gap-3">
            <div className="relative">
              {row.iconUrl ? (
                <img
                  src={row.iconUrl}
                  alt="icon"
                  className="w-12 h-12 rounded object-cover flex-shrink-0"
                  onError={(e) => {
                    e.target.src = '';
                    e.target.classList.add('hidden');
                  }}
                />
              ) : row.imageUrl ? (
                <img
                  src={row.imageUrl}
                  alt={val}
                  className="w-12 h-12 rounded object-cover flex-shrink-0"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-12 h-12 rounded bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-400">
                  🌍
                </div>
              )}
              {row.iconUrl && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white" title="Có icon" />
              )}
            </div>
            <div className="min-w-0">
              <span className="font-medium text-gray-800 block">{val}</span>
              {row.titleEn && (
                <span className="text-xs text-gray-400">{row.titleEn}</span>
              )}
              {row.isActive === false && (
                <span className="ml-1.5 text-[10px] px-1.5 py-0.5 bg-red-50 text-red-500 rounded">
                  Tạm ẩn
                </span>
              )}
            </div>
          </div>
        ),
      },
      {
        header: 'Mô tả',
        accessor: 'description',
        render: (val) => (
          <div className="text-xs text-gray-500 max-w-xs">
            {val ? (
              <span 
                dangerouslySetInnerHTML={{ __html: val }}
                className="line-clamp-2 [&_*]:!text-gray-500 [&_*]:!mb-0"
              />
            ) : (
              <span className="text-gray-400">—</span>
            )}
          </div>
        ),
      },
      {
        header: 'Công nghệ',
        accessor: 'technologies',
        render: (val) => (
          <div className="flex flex-wrap gap-1 max-w-xs">
            {val && val.length > 0 ? (
              val.slice(0, 3).map((tech, i) => (
                <span key={i} className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">
                  {tech.imageUrl && (
                    <img src={tech.imageUrl} alt="" className="w-3 h-3 rounded object-cover" onError={(e) => e.target.style.display = 'none'} />
                  )}
                  {tech.title}
                </span>
              ))
            ) : (
              <span className="text-gray-400 text-xs">—</span>
            )}
            {val && val.length > 3 && (
              <span className="text-[10px] text-gray-400 font-medium">+{val.length - 3}</span>
            )}
            {val && val.length > 0 && (
              <span className="text-[10px] text-gray-500">({val.length})</span>
            )}
          </div>
        ),
      },
      {
        header: 'Ứng dụng',
        accessor: 'applications',
        render: (val) => (
          <div className="flex flex-wrap gap-1 max-w-xs">
            {val && val.length > 0 ? (
              val.slice(0, 3).map((app, i) => (
                <span key={i} className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-green-50 text-green-600 rounded">
                  {app.imageUrl && (
                    <img src={app.imageUrl} alt="" className="w-3 h-3 rounded object-cover" onError={(e) => e.target.style.display = 'none'} />
                  )}
                  {app.title}
                </span>
              ))
            ) : (
              <span className="text-gray-400 text-xs">—</span>
            )}
            {val && val.length > 3 && (
              <span className="text-[10px] text-gray-400 font-medium">+{val.length - 3}</span>
            )}
            {val && val.length > 0 && (
              <span className="text-[10px] text-gray-500">({val.length})</span>
            )}
          </div>
        ),
      },
      {
        header: 'Sản phẩm',
        accessor: 'selectedProducts',
        render: (val) => (
          <span className="text-xs font-medium text-gray-600">
            {val && val.length > 0 ? `${val.length} sản phẩm` : 'Chưa chọn'}
          </span>
        ),
      },
      {
        header: 'TDS',
        accessor: 'tdsUrl',
        render: (val) => (
          val ? (
            <a
              href={val}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-red-600 hover:underline flex items-center gap-1"
            >
              <FiFile size={12} />
              PDF
            </a>
          ) : (
            <span className="text-gray-400 text-xs">—</span>
          )
        ),
      },
      {
        header: 'Ngày tạo',
        accessor: 'createdAt',
        render: (val) => (
          <span className="text-gray-500 text-xs">
            {val ? new Date(val).toLocaleDateString('vi-VN') : '—'}
          </span>
        ),
      },
    ],
    []
  );

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa thị trường này?')) return;
    try {
      await adminApi.deleteMarket(id);
      addNotification('Xóa thị trường thành công');
      fetchMarkets();
    } catch (error) {
      addNotification('Có lỗi xảy ra', 'error');
    }
  };

  const renderActions = (row) => (
    <>
      <button
        onClick={() => navigate(`/markets/${row._id}/edit`)}
        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
        title="Sửa"
      >
        <FiEdit2 size={14} />
      </button>
      <button
        onClick={() => handleDelete(row._id)}
        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
        title="Xóa"
      >
        <FiTrash2 size={14} />
      </button>
    </>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <SEO title="Thị trường" description="Quản lý thị trường ứng dụng" url="/markets" />
      <Header title="Quản lý thị trường" />

      <div className="p-4">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-2 items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">
            Danh sách thị trường
            <span className="ml-1.5 text-gray-400 font-normal">
              ({filtered.length}{' '}
              {showInactive ? '' : 'đang hoạt động'})
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
              Hiện tạm ẩn
            </label>
            <div className="relative">
              <FiSearch
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Tìm tên..."
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
              onClick={() => navigate('/markets/new')}
              className="btn-primary flex items-center gap-2 text-sm px-4 py-2"
            >
              <FiPlus size={16} />
              Thêm thị trường
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="card">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
              <span className="text-5xl">🌍</span>
              <p className="text-base">
                {search
                  ? 'Không tìm thấy thị trường phù hợp'
                  : 'Chưa có thị trường nào'}
              </p>
              {!search && (
                <button
                  onClick={() => navigate('/markets/new')}
                  className="btn-primary text-sm px-4 py-2"
                >
                  Thêm thị trường đầu tiên
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

export default MarketList;
