import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiUsers,
  FiClock,
  FiTrendingUp,
  FiActivity,
  FiSearch,
  FiRefreshCw,
  FiGlobe,
  FiMonitor,
  FiSmartphone,
} from 'react-icons/fi';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import adminApi from '../../api/adminApi';
import SEO from '../../components/SEO';
import Header from '../../components/Header';
import StatCard from '../../components/StatCard';

const RANGES = [
  { value: 'day', label: 'Hôm nay' },
  { value: 'week', label: '7 ngày' },
  { value: 'month', label: '30 ngày' },
  { value: 'year', label: '12 tháng' },
];

const PIE_COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

const formatNumber = (n) => new Intl.NumberFormat('vi-VN').format(n || 0);
const formatDateTime = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleString('vi-VN');
};

const formatBucketLabel = (bucket, granularity) => {
  if (!bucket) return '';
  if (granularity === 'hour') return bucket;
  if (granularity === 'month') {
    const [y, m] = bucket.split('-');
    return `${m}/${y.slice(2)}`;
  }
  const parts = bucket.split('-');
  return parts.length === 3 ? `${parts[2]}/${parts[1]}` : bucket;
};

const Analytics = () => {
  const [summary, setSummary] = useState(null);
  const [online, setOnline] = useState({ count: 0, items: [] });
  const [chartRange, setChartRange] = useState('week');
  const [chart, setChart] = useState({ series: [], granularity: 'day' });
  const [stats, setStats] = useState(null);
  const [visitorSearch, setVisitorSearch] = useState('');
  const [visitorPage, setVisitorPage] = useState(1);
  const [visitors, setVisitors] = useState({ items: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } });
  const [logSearch, setLogSearch] = useState('');
  const [logPage, setLogPage] = useState(1);
  const [logs, setLogs] = useState({ items: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = async (range = chartRange) => {
    try {
      setError(null);
      const [summaryRes, onlineRes, chartRes, statsRes] = await Promise.all([
        adminApi.getAnalyticsDashboard(),
        adminApi.getOnlineUsers(),
        adminApi.getAnalyticsChart(range),
        adminApi.getAnalyticsStats(range),
      ]);
      setSummary(summaryRes.data.data);
      setOnline(onlineRes.data.data || { count: 0, items: [] });
      setChart(chartRes.data.data || { series: [], granularity: 'day' });
      setStats(statsRes.data.data || null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const fetchVisitors = async () => {
    try {
      const res = await adminApi.getAnalyticsVisitors({
        page: visitorPage,
        limit: 10,
        search: visitorSearch,
      });
      const body = res.data || {};
      setVisitors({
        items: body.data || [],
        pagination: body.pagination || { page: 1, limit: 10, total: 0, pages: 0 },
      });
    } catch (_) {}
  };

  const fetchLogs = async () => {
    try {
      const res = await adminApi.getAnalyticsLogs({
        page: logPage,
        limit: 10,
        search: logSearch,
      });
      const body = res.data || {};
      setLogs({
        items: body.data || [],
        pagination: body.pagination || { page: 1, limit: 10, total: 0, pages: 0 },
      });
    } catch (_) {}
  };

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      setLoading(true);
      await fetchAll(chartRange);
      await fetchVisitors();
      await fetchLogs();
      if (!cancelled) setLoading(false);
    };
    init();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    fetchAll(chartRange);
    fetchVisitors();
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartRange]);

  useEffect(() => {
    fetchVisitors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visitorPage, visitorSearch]);

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logPage, logSearch]);

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const [onlineRes, summaryRes] = await Promise.all([
          adminApi.getOnlineUsers(),
          adminApi.getAnalyticsDashboard(),
        ]);
        setOnline(onlineRes.data.data || { count: 0, items: [] });
        setSummary(summaryRes.data.data || null);
      } catch (_) {}
    }, 30000);
    return () => clearInterval(id);
  }, []);

  const chartData = useMemo(
    () =>
      (chart.series || []).map((p) => ({
        ...p,
        label: formatBucketLabel(p.bucket, chart.granularity),
      })),
    [chart]
  );

  const topPagesData = useMemo(
    () => (stats?.topPaths || []).slice(0, 8).map((p) => ({
      name: p.path.length > 30 ? `${p.path.slice(0, 30)}…` : p.path,
      fullName: p.path,
      visits: p.count,
    })),
    [stats]
  );

  const topCountriesData = useMemo(
    () => (stats?.topCountries || []).slice(0, 8).map((c) => ({
      name: c.name || 'Unknown',
      value: c.count,
    })),
    [stats]
  );

  const topBrowsersData = useMemo(
    () => (stats?.topBrowsers || []).slice(0, 8).map((b) => ({
      name: b.name || 'Unknown',
      value: b.count,
    })),
    [stats]
  );

  const handleRangeChange = (val) => {
    setChartRange(val);
  };

  const handleRefresh = () => fetchAll(chartRange);

  if (loading && !summary) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <SEO title="Thống kê truy cập" />
      <Header title="Thống kê truy cập" />

      <div className="p-4 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
            {error}
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            icon={<FiUsers size={20} />}
            label="Đang online"
            value={formatNumber(online.count)}
            color="green"
          />
          <StatCard
            icon={<FiClock size={20} />}
            label="Hôm nay"
            value={formatNumber(summary?.todayVisits)}
            color="primary"
          />
          <StatCard
            icon={<FiTrendingUp size={20} />}
            label="Tuần này"
            value={formatNumber(summary?.weekVisits)}
            color="blue"
          />
          <StatCard
            icon={<FiActivity size={20} />}
            label="Tháng này"
            value={formatNumber(summary?.monthVisits)}
            color="purple"
          />
        </div>

        {/* Chart */}
        <div className="card">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <h2 className="text-sm font-semibold">Lượt truy cập theo thời gian</h2>
              <p className="text-xs text-gray-500">
                Tổng: {formatNumber(stats?.totalVisits)} lượt · {formatNumber(stats?.uniqueVisitors)} IP duy nhất
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-gray-100 rounded-lg p-1 text-xs">
                {RANGES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => handleRangeChange(r.value)}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      chartRange === r.value
                        ? 'bg-white text-primary shadow-sm font-medium'
                        : 'text-gray-600 hover:text-primary'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleRefresh}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                title="Làm mới"
              >
                <FiRefreshCw size={14} />
              </button>
            </div>
          </div>

          <div className="h-72">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-400">
                Chưa có dữ liệu trong khoảng thời gian này
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="visits"
                    name="Lượt truy cập"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="uniqueVisitors"
                    name="IP duy nhất"
                    stroke="#16a34a"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top stats row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <FiGlobe className="text-primary" />
              <h3 className="text-sm font-semibold">Top trang được xem</h3>
            </div>
            {topPagesData.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">Chưa có dữ liệu</p>
            ) : (
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topPagesData} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 10 }} stroke="#94a3b8" allowDecimals={false} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tick={{ fontSize: 10 }}
                      stroke="#94a3b8"
                      width={120}
                    />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8 }}
                      labelFormatter={(label) => {
                        const found = topPagesData.find((p) => p.name === label);
                        return found?.fullName || label;
                      }}
                    />
                    <Bar dataKey="visits" fill="#2563eb" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <FiGlobe className="text-primary" />
              <h3 className="text-sm font-semibold">Top quốc gia</h3>
            </div>
            {topCountriesData.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">Chưa có dữ liệu</p>
            ) : (
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topCountriesData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      innerRadius={40}
                      paddingAngle={2}
                      label={(d) => `${d.name}`}
                      labelLine={false}
                    >
                      {topCountriesData.map((_, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <FiMonitor className="text-primary" />
              <h3 className="text-sm font-semibold">Top trình duyệt</h3>
            </div>
            {topBrowsersData.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">Chưa có dữ liệu</p>
            ) : (
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topBrowsersData} margin={{ top: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" allowDecimals={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Bar dataKey="value" fill="#16a34a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Online users */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
              </span>
              <h2 className="text-sm font-semibold">
                Đang online ({formatNumber(online.count)})
              </h2>
            </div>
            <span className="text-xs text-gray-500">Cập nhật mỗi 30 giây</span>
          </div>

          {online.items.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">Hiện chưa có ai online</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="table-header">
                    <th className="px-3 py-2 text-left">IP</th>
                    <th className="px-3 py-2 text-left">Quốc gia</th>
                    <th className="px-3 py-2 text-left">Thành phố</th>
                    <th className="px-3 py-2 text-left">Thiết bị</th>
                    <th className="px-3 py-2 text-left">Lần cuối</th>
                  </tr>
                </thead>
                <tbody>
                  {online.items.map((u, idx) => (
                    <tr key={`${u.ip}-${idx}`} className="table-row">
                      <td className="px-3 py-2 text-xs font-mono">{u.ip}</td>
                      <td className="px-3 py-2 text-xs">{u.country || '-'}</td>
                      <td className="px-3 py-2 text-xs">{u.city || '-'}</td>
                      <td className="px-3 py-2 text-xs">
                        <DeviceBadge type={u.deviceType} />
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {u.lastSeen ? new Date(u.lastSeen).toLocaleTimeString('vi-VN') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Visitors (distinct IPs) */}
        <div className="card">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h2 className="text-sm font-semibold">Danh sách IP đã truy cập</h2>
            <div className="relative">
              <FiSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Tìm IP, quốc gia, thành phố…"
                value={visitorSearch}
                onChange={(e) => {
                  setVisitorPage(1);
                  setVisitorSearch(e.target.value);
                }}
                className="input-field pl-7 py-1.5 text-xs w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="px-3 py-2 text-left">IP</th>
                  <th className="px-3 py-2 text-left">Vị trí</th>
                  <th className="px-3 py-2 text-left">Trình duyệt</th>
                  <th className="px-3 py-2 text-left">Hệ điều hành</th>
                  <th className="px-3 py-2 text-left">Thiết bị</th>
                  <th className="px-3 py-2 text-left">Tổng lượt</th>
                  <th className="px-3 py-2 text-left">Lần cuối</th>
                </tr>
              </thead>
              <tbody>
                {visitors.items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-xs text-gray-400">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  visitors.items.map((v, idx) => (
                    <tr key={`${v.ip}-${idx}`} className="table-row">
                      <td className="px-3 py-2 text-xs font-mono">{v.ip}</td>
                      <td className="px-3 py-2 text-xs">
                        {v.country || '-'}{v.city ? `, ${v.city}` : ''}
                      </td>
                      <td className="px-3 py-2 text-xs">{v.browser || '-'}</td>
                      <td className="px-3 py-2 text-xs">{v.os || '-'}</td>
                      <td className="px-3 py-2 text-xs">
                        <DeviceBadge type={v.deviceType} />
                      </td>
                      <td className="px-3 py-2 text-xs">{formatNumber(v.totalHits)}</td>
                      <td className="px-3 py-2 text-xs">{formatDateTime(v.lastVisit)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {visitors.pagination.pages > 1 && (
            <Pagination
              page={visitors.pagination.page}
              pages={visitors.pagination.pages}
              onChange={setVisitorPage}
            />
          )}
        </div>

        {/* Visit logs */}
        <div className="card">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h2 className="text-sm font-semibold">Lịch sử truy cập chi tiết</h2>
            <div className="relative">
              <FiSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Tìm IP, đường dẫn…"
                value={logSearch}
                onChange={(e) => {
                  setLogPage(1);
                  setLogSearch(e.target.value);
                }}
                className="input-field pl-7 py-1.5 text-xs w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="px-3 py-2 text-left">Thời gian</th>
                  <th className="px-3 py-2 text-left">IP</th>
                  <th className="px-3 py-2 text-left">Vị trí</th>
                  <th className="px-3 py-2 text-left">Đường dẫn</th>
                  <th className="px-3 py-2 text-left">Trình duyệt / OS</th>
                  <th className="px-3 py-2 text-left">Thiết bị</th>
                </tr>
              </thead>
              <tbody>
                {logs.items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-xs text-gray-400">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  logs.items.map((l) => (
                    <tr key={l._id} className="table-row">
                      <td className="px-3 py-2 text-xs whitespace-nowrap">
                        {formatDateTime(l.visitedAt)}
                      </td>
                      <td className="px-3 py-2 text-xs font-mono">{l.ip}</td>
                      <td className="px-3 py-2 text-xs">
                        {l.country || '-'}{l.city ? `, ${l.city}` : ''}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        <span className="px-2 py-0.5 rounded bg-gray-100 font-mono">
                          {l.method} {l.path}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {l.browser || '-'} / {l.os || '-'}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        <DeviceBadge type={l.deviceType} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {logs.pagination.pages > 1 && (
            <Pagination
              page={logs.pagination.page}
              pages={logs.pagination.pages}
              onChange={setLogPage}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};

const DeviceBadge = ({ type }) => {
  const map = {
    desktop: { label: 'Desktop', className: 'bg-blue-100 text-blue-700', icon: <FiMonitor size={10} /> },
    mobile: { label: 'Mobile', className: 'bg-green-100 text-green-700', icon: <FiSmartphone size={10} /> },
    tablet: { label: 'Tablet', className: 'bg-purple-100 text-purple-700', icon: <FiSmartphone size={10} /> },
    bot: { label: 'Bot', className: 'bg-yellow-100 text-yellow-700', icon: null },
  };
  const cfg = map[type] || { label: 'Khác', className: 'bg-gray-100 text-gray-600', icon: null };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${cfg.className}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
};

const Pagination = ({ page, pages, onChange }) => (
  <div className="flex items-center justify-between mt-3 text-xs">
    <span className="text-gray-500">
      Trang {page} / {pages}
    </span>
    <div className="flex gap-1">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="px-3 py-1 rounded border disabled:opacity-50 hover:bg-gray-50"
      >
        Trước
      </button>
      <button
        type="button"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
        className="px-3 py-1 rounded border disabled:opacity-50 hover:bg-gray-50"
      >
        Sau
      </button>
    </div>
  </div>
);

export default Analytics;