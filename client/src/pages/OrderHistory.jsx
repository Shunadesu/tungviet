import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFileText } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import clientApi from '../api/clientApi';
import { formatDate } from '../utils/format';
import { SUPPORTED_LOCALES } from '../i18n';

const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Processing: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-purple-100 text-purple-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};

const OrderHistory = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const lang = SUPPORTED_LOCALES.includes(i18n.language) ? i18n.language : 'vi';
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await clientApi.getMyOrders();
      setOrders(res.data.data || []);
    } catch (err) {
      console.error('Error fetching quote history:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => t(`history.status.${status}`, { defaultValue: status });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SEO title={t('history.title')} description={t('history.loginRequired')} url={`/${lang}/orders`} noindex />
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">{t('history.loginRequired')}</p>
          <Link to={`/${lang}/login`} className="btn-primary inline-block">{t('auth.login')}</Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-8"
    >
      <SEO title={t('history.title')} description={t('history.title')} url={`/${lang}/orders`} noindex />
      <div className="bg-primary text-white py-4">
        <div className="max-w-7xl mx-auto px-2 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">{t('history.title')}</h1>
            <p className="text-xs text-white/70">{t('history.count', { n: orders.length })}</p>
          </div>
          <Link
            to={`/${lang}/quote`}
            className="text-xs bg-white text-primary px-3 py-1.5 rounded-full hover:bg-primary-50"
          >
            {t('history.createQuote')}
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 py-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <FiFileText size={56} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-600 mb-3">{t('history.comingSoon')}</p>
            <Link to={`/${lang}/quote`} className="btn-primary inline-block text-sm">
              {t('history.createQuote')}
            </Link>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <FiFileText size={56} className="mx-auto text-gray-300 mb-3" />
            <h2 className="text-base font-semibold text-gray-700 mb-1">{t('history.empty')}</h2>
            <p className="text-xs text-gray-500 mb-4">{t('history.emptyHint')}</p>
            <Link to={`/${lang}/quote`} className="btn-primary inline-block text-sm">
              {t('history.createQuote')}
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {orders.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-xs font-mono text-gray-500">#{order._id.slice(-8)}</p>
                    <p className="text-xs text-gray-400">{formatDate(order.createdAt, lang)}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                {order.details && order.details.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {order.details.slice(0, 4).map((item) => (
                      <img
                        key={item._id}
                        src={item.productImage}
                        alt={item.productName}
                        className="w-12 h-12 object-cover rounded flex-shrink-0 bg-gray-100"
                      />
                    ))}
                    {order.details.length > 4 && (
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                        <span className="text-xs text-gray-500">+{order.details.length - 4}</span>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default OrderHistory;