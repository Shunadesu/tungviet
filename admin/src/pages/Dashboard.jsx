import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FiPackage, FiShoppingBag, FiDollarSign, FiTrendingUp,
  FiEye, FiArrowRight,
} from 'react-icons/fi';
import { GiPlantRoots } from 'react-icons/gi';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import SEO from '../components/SEO';
import HealthBadge from '../components/HealthBadge';
import TrendChart from '../components/TrendChart';
import StatusPieChart from '../components/StatusPieChart';
import PublicStatsCard from '../components/PublicStatsCard';
import adminApi from '../api/adminApi';

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN').format(price || 0) + 'đ';

const STATUS_LABELS = {
  Pending: 'Chờ xử lý',
  Processing: 'Đang xử lý',
  Shipped: 'Đã gửi',
  Delivered: 'Đã giao',
  Cancelled: 'Đã hủy',
};

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const serverHealthUrl = `${window.location.origin}/api/health`;
  const publicHealthUrl = `${import.meta.env.VITE_API_URL || ''}/public/stats`;

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await adminApi.getDashboard();
      setDashboard(res.data.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchDashboard();
  }, [fetchDashboard]);

  const formatBucketLabel = (bucket, granularity) => {
    if (!bucket) return '';
    const d = new Date(bucket);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  const formatValue = (val) => formatPrice(val);

  const chartData = useMemo(() => {
    if (!dashboard?.chartSeries) return [];
    return dashboard.chartSeries.map((p) => {
      const label = formatBucketLabel(p.bucket, 'day');
      return { label, visits: p.visits || 0, revenue: p.revenue || 0 };
    });
  }, [dashboard]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const { orders, visits, topProducts, publicStats } = dashboard || {};

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <SEO title="Dashboard" description="Admin dashboard overview" url="/" />
      <Header title="Dashboard" />

      <div className="p-4 space-y-4">
        {/* Health badges */}
        <div className="flex flex-wrap gap-2">
          <HealthBadge url={serverHealthUrl} label="Server API" interval={30000} />
          <HealthBadge url={publicHealthUrl} label="Public API" interval={60000} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <StatCard
            icon={<FiPackage size={20} />}
            label="Tổng sản phẩm"
            value={orders?.totalProducts || 0}
            color="primary"
            delay={0}
          />
          <StatCard
            icon={<FiShoppingBag size={20} />}
            label="Tổng đơn hàng"
            value={orders?.totalOrders || 0}
            color="blue"
            delay={0.1}
          />
          <StatCard
            icon={<FiDollarSign size={20} />}
            label="Doanh thu"
            value={formatPrice(orders?.totalRevenue)}
            color="green"
            delay={0.2}
          />
          <StatCard
            icon={<FiTrendingUp size={20} />}
            label="Lượt truy cập hôm nay"
            value={visits?.today || 0}
            color="purple"
            delay={0.3}
          />
        </div>

        {/* Trend Chart */}
        <div className="card">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <h2 className="text-sm font-semibold">Doanh thu &amp; Lượt xem (30 ngày gần nhất)</h2>
              <p className="text-xs text-gray-500">Dữ liệu 30 ngày gần đây</p>
            </div>
          </div>
          <div className="h-64">
            <TrendChart data={chartData} formatValue={formatValue} />
          </div>
        </div>

        {/* Row: PieChart + PublicStats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status PieChart */}
          <div className="card">
            <h2 className="text-sm font-semibold mb-3">Phân bổ trạng thái đơn hàng</h2>
            <div className="h-64">
              <StatusPieChart data={orders?.statusStats || []} />
            </div>
          </div>

          {/* Public Stats */}
          <div className="card">
            <h2 className="text-sm font-semibold mb-3">Thống kê công khai</h2>
            <div className="h-64">
              <PublicStatsCard stats={publicStats} />
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <FiEye className="text-primary" size={16} />
            <h2 className="text-sm font-semibold">Top sản phẩm xem nhiều nhất</h2>
          </div>
          {topProducts && topProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="pb-2 font-medium">#</th>
                    <th className="pb-2 font-medium">Sản phẩm</th>
                    <th className="pb-2 font-medium">Mã</th>
                    <th className="pb-2 font-medium text-right">Lượt xem</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p, i) => (
                    <tr key={p._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                      <td className="py-2 text-gray-400">{i + 1}</td>
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          {p.imageUrl && (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-8 h-8 rounded object-cover bg-gray-100"
                            />
                          )}
                          <span className="font-medium text-gray-800">
                            {p.name || p.nameEn || '—'}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 text-gray-500">{p.productCode || '—'}</td>
                      <td className="py-2 text-right">
                        <span className="inline-flex items-center gap-1 text-blue-600 font-semibold">
                          <FiEye size={10} />
                          {p.viewCount?.toLocaleString('vi-VN') || 0}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center py-4">Chưa có dữ liệu</p>
          )}
        </div>

        {/* Recent Orders */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <GiPlantRoots className="text-primary" />
              <h2 className="text-sm font-semibold">Đơn hàng gần đây</h2>
            </div>
            <a href="/orders" className="text-xs text-primary hover:underline flex items-center gap-1">
              Xem tất cả <FiArrowRight size={10} />
            </a>
          </div>
          {orders?.recentOrders?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="pb-2 font-medium">Mã đơn</th>
                    <th className="pb-2 font-medium">Khách</th>
                    <th className="pb-2 font-medium">Số điện thoại</th>
                    <th className="pb-2 font-medium text-right">Tổng tiền</th>
                    <th className="pb-2 font-medium text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.recentOrders.map((order) => (
                    <tr key={order._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                      <td className="py-2 font-medium text-gray-700">
                        #{order._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="py-2 text-gray-600">{order.userName || 'Khách'}</td>
                      <td className="py-2 text-gray-500">{order.phone || '—'}</td>
                      <td className="py-2 text-right font-semibold text-primary">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="py-2 text-right">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                          order.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {STATUS_LABELS[order.status] || order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-gray-500 text-center py-4">Chưa có đơn hàng nào</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
