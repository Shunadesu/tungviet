import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPackage, FiShoppingBag, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import { GiPlantRoots } from 'react-icons/gi';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import SEO from '../components/SEO';
import adminApi from '../api/adminApi';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await adminApi.getStats();
      setStats(res.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <SEO title="Dashboard" description="Admin dashboard overview" url="/" />
      <Header title="Dashboard" />

      <div className="p-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
          <StatCard
            icon={<FiPackage size={20} />}
            label="Tổng sản phẩm"
            value={stats?.totalProducts || 0}
            color="primary"
            delay={0}
          />
          <StatCard
            icon={<FiShoppingBag size={20} />}
            label="Tổng đơn hàng"
            value={stats?.totalOrders || 0}
            color="blue"
            delay={0.1}
          />
          <StatCard
            icon={<FiDollarSign size={20} />}
            label="Doanh thu"
            value={formatPrice(stats?.totalRevenue || 0)}
            color="green"
            delay={0.2}
          />
          <StatCard
            icon={<FiTrendingUp size={20} />}
            label="Đơn hàng mới"
            value={stats?.recentOrders?.length || 0}
            color="yellow"
            delay={0.3}
          />
        </div>

        {/* Recent Orders */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <GiPlantRoots className="text-primary" />
            <h2 className="text-sm font-semibold">Đơn hàng gần đây</h2>
          </div>
          
          {stats?.recentOrders?.length > 0 ? (
            <div className="space-y-2">
              {stats.recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs font-medium">#{order._id.slice(-8)}</p>
                    <p className="text-xs text-gray-500">{order.userName || 'Khách'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-primary">{formatPrice(order.totalAmount)}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                      order.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 text-center py-4">Chưa có đơn hàng nào</p>
          )}
        </div>

        {/* Status Stats */}
        <div className="card mt-4">
          <h2 className="text-sm font-semibold mb-3">Thống kê trạng thái đơn hàng</h2>
          <div className="grid grid-cols-5 gap-2">
            {stats?.statusStats?.map((stat) => (
              <div key={stat._id} className="text-center p-2 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold">{stat.count}</p>
                <p className="text-xs text-gray-500">{stat._id}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
