import { orderService } from '../../services/order.service.js';
import { analyticsService } from '../../services/analytics.service.js';
import Product from '../../models/Product.js';
import Partner from '../../models/Partner.js';
import MainTree from '../../models/MainTree.js';
import MarketTree from '../../models/MarketTree.js';
import Post from '../../models/Post.js';
import VisitLog from '../../models/VisitLog.js';
import Order from '../../models/Order.js';
import { apiResponse } from '../../utils/apiResponse.js';

export const getDashboard = async (req, res, next) => {
  try {
    const [orderStats, visitSummary, topProducts, publicCounts] = await Promise.all([
      orderService.getStats(),
      analyticsService.getDashboardSummary(),
      Product.find({ isActive: true })
        .sort({ viewCount: -1 })
        .limit(5)
        .select('_id name nameEn imageUrl viewCount productCode')
        .lean(),
      Promise.all([
        Product.countDocuments({ isActive: true, webStatus: 'published' }),
        MarketTree.countDocuments({ isActive: true }),
        Partner.countDocuments({ isActive: true, type: 'partner' }),
        Partner.countDocuments({ isActive: true, type: 'customer' }),
        MainTree.countDocuments({ isActive: true }),
        Post.countDocuments({ isActive: true }),
      ]),
    ]);

    const [products, markets, partners, customers, industries, posts] = publicCounts;

    // Chart data: visits + orders + revenue by day for last 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const [visitAgg, orderAgg] = await Promise.all([
      VisitLog.aggregate([
        { $match: { visitedAt: { $gte: thirtyDaysAgo, $lte: now } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$visitedAt' } },
            visits: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo, $lte: now }, status: { $ne: 'Cancelled' } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            orders: { $sum: 1 },
            revenue: { $sum: '$totalAmount' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Merge visit + order data by date
    const visitMap = Object.fromEntries(visitAgg.map((v) => [v._id, v.visits]));
    const orderMap = Object.fromEntries(orderAgg.map((o) => [o._id, { orders: o.orders, revenue: o.revenue }]));
    const allDates = [...new Set([...Object.keys(visitMap), ...Object.keys(orderMap)])].sort();
    const chartSeries = allDates.map((date) => ({
      bucket: date,
      visits: visitMap[date] || 0,
      orders: orderMap[date]?.orders || 0,
      revenue: orderMap[date]?.revenue || 0,
    }));

    return apiResponse.ok(res, {
      orders: {
        totalOrders: orderStats.totalOrders,
        totalProducts: orderStats.totalProducts,
        totalRevenue: orderStats.totalRevenue,
        recentOrders: orderStats.recentOrders,
        statusStats: orderStats.statusStats,
      },
      visits: {
        today: visitSummary.todayVisits,
        week: visitSummary.weekVisits,
        month: visitSummary.monthVisits,
        total: visitSummary.totalVisits,
      },
      topProducts: topProducts.map((p) => ({
        _id: p._id,
        name: p.name || '',
        nameEn: p.nameEn || '',
        imageUrl: p.imageUrl || '',
        viewCount: p.viewCount || 0,
        productCode: p.productCode || '',
      })),
      publicStats: {
        products,
        markets,
        partners,
        customers,
        industries,
        posts,
      },
      chartSeries,
    });
  } catch (err) {
    next(err);
  }
};
