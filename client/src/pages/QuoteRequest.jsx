import { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiTrash2, FiX, FiSend, FiAlertCircle, FiMail, FiPhone } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { useQuoteBag } from '../context/QuoteBagContext';
import publicApi from '../api/publicApi';
import { SUPPORTED_LOCALES } from '../i18n';
import placeholderProduct from '../assets/placeholder-product.svg';

const QuoteRequest = () => {
  const { t, i18n } = useTranslation();
  const lang = SUPPORTED_LOCALES.includes(i18n.language) ? i18n.language : 'vi';

  const { items, count, removeFromQuoteBag, clearQuoteBag } = useQuoteBag();

  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    preferredContact: 'email',
  });
  const [submittedContact, setSubmittedContact] = useState(null);

  useEffect(() => {
    document.title = t('quote.title');
  }, [t]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError(t('quoteSection.errorName') || 'Vui lòng nhập họ tên');
      return;
    }
    if (!formData.email.trim()) {
      setError('Vui lòng nhập email');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Vui lòng nhập số điện thoại');
      return;
    }
    if (count === 0) {
      setError(t('quote.bagEmpty') || 'Vui lòng chọn ít nhất một sản phẩm');
      return;
    }

    setSending(true);
    setError('');
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        company: formData.company.trim(),
        message: formData.message.trim(),
        preferredContact: formData.preferredContact,
        items: items.map((it) => ({
          productId: it._id || it.id || '',
          name: it.name || '',
          softeningPoint: it.softeningPoint || '',
          imageUrl: it.imageUrl || '',
          quantity: Number(it.quantity) || 1,
        })),
      };
      await publicApi.submitQuote(payload);
      setSubmittedContact({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        preferredContact: formData.preferredContact,
      });
      setSubmitted(true);
      clearQuoteBag();
      setFormData({ name: '', email: '', phone: '', company: '', message: '', preferredContact: 'email' });
    } catch (err) {
      setError(err.response?.data?.message || t('quoteSection.error') || 'Gửi yêu cầu thất bại. Vui lòng thử lại.');
    } finally {
      setSending(false);
    }
  };

  const handleSendAnother = () => {
    setSubmitted(false);
    setSubmittedContact(null);
    setFormData({ name: '', email: '', phone: '', company: '', message: '', preferredContact: 'email' });
  };

  const summaryItems = useMemo(() => items, [items]);

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen flex items-center justify-center px-4"
      >
        <div className="text-center max-w-md mx-auto">
          <FiCheckCircle size={72} className="mx-auto text-green-500 mb-3" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('quote.success') || 'Gửi yêu cầu thành công!'}</h2>
          {submittedContact && (
            <p className="text-sm text-gray-600 mb-4">
              {t('quote.successDetail', { channel: submittedContact.preferredContact === 'email' ? 'email' : 'số điện thoại' })}
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-2">
            <Link to={`/${lang}/products`} className="btn-secondary text-sm">
              {t('quote.browseProducts') || 'Xem thêm sản phẩm'}
            </Link>
            <button type="button" onClick={handleSendAnother} className="btn-primary text-sm">
              {t('quote.sendAnother') || 'Gửi yêu cầu khác'}
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-8"
    >
      <SEO title={t('quote.title')} description={t('quote.subtitle')} url={`/${lang}/quote`} noindex />

      <div className="bg-primary text-white py-4">
        <div className="max-w-7xl mx-auto px-2">
          <h1 className="text-lg font-semibold">{t('quote.title')}</h1>
          <p className="text-xs text-white/70">{t('quote.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 py-4 grid lg:grid-cols-3 gap-4">
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg p-4">
            <h2 className="text-sm font-semibold mb-3">{t('quote.info') || 'Thông tin liên hệ'}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">{t('quote.fullName') || 'Họ và tên'} *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder={t('auth.fullNamePlaceholder')}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">{t('quote.phone') || 'Số điện thoại'} *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder={t('auth.phonePlaceholder')}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">{t('quote.company') || 'Công ty'}</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="input-field"
                  placeholder={t('quote.companyPlaceholder') || 'Tên công ty (không bắt buộc)'}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">{t('quote.message') || 'Lời nhắn'}</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="input-field resize-none"
                  placeholder={t('quote.messagePlaceholder') || 'Mô tả chi tiết yêu cầu của bạn...'}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-2">{t('quote.preferredContact') || 'Phương thức liên hệ'}</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className={`flex items-center gap-2 text-xs cursor-pointer border rounded-lg p-2.5 transition-colors ${formData.preferredContact === 'email' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="radio"
                      name="preferredContact"
                      value="email"
                      checked={formData.preferredContact === 'email'}
                      onChange={handleChange}
                      className="accent-primary"
                    />
                    <FiMail size={14} className="text-blue-600" />
                    <span>{t('quote.preferredEmail') || 'Email'}</span>
                  </label>
                  <label className={`flex items-center gap-2 text-xs cursor-pointer border rounded-lg p-2.5 transition-colors ${formData.preferredContact === 'phone' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="radio"
                      name="preferredContact"
                      value="phone"
                      checked={formData.preferredContact === 'phone'}
                      onChange={handleChange}
                      className="accent-primary"
                    />
                    <FiPhone size={14} className="text-primary" />
                    <span>{t('quote.preferredPhone') || 'Điện thoại'}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 border border-red-100 rounded-lg p-3">
              <FiAlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={sending || count === 0}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {sending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t('quoteSection.form.sending') || 'Đang gửi...'}
              </>
            ) : (
              <>
                <FiSend size={16} />
                {t('quoteSection.form.submit') || 'Gửi yêu cầu báo giá'}
              </>
            )}
          </button>
          {count === 0 && !sending && (
            <p className="text-xs text-red-600 text-center">{t('quote.bagEmpty') || 'Vui lòng chọn ít nhất một sản phẩm để gửi yêu cầu'}</p>
          )}
        </form>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg p-4 sticky top-16">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold">
                {t('quote.bag') || 'Sản phẩm yêu cầu'} ({count})
              </h2>
              {count > 0 && (
                <button
                  type="button"
                  onClick={clearQuoteBag}
                  className="text-[10px] text-red-600 hover:underline flex items-center gap-1"
                >
                  <FiTrash2 size={10} />
                  {t('quote.clear') || 'Xoá hết'}
                </button>
              )}
            </div>

            {summaryItems.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-gray-500 mb-2">{t('quote.bagEmpty') || 'Chưa có sản phẩm nào'}</p>
                <Link to={`/${lang}/products`} className="text-xs text-primary hover:underline">
                  {t('quote.browseProducts') || 'Chọn sản phẩm'}
                </Link>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {summaryItems.map((item) => (
                  <div key={item._id} className="flex gap-2 items-center border-b pb-2">
                    <img
                      src={item.imageUrl || placeholderProduct}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded bg-gray-100"
                      onError={(e) => { e.currentTarget.src = placeholderProduct; }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium line-clamp-2">{item.name}</p>
                      {item.softeningPoint && (
                        <p className="text-[10px] text-gray-500">{item.softeningPoint}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromQuoteBag(item._id)}
                      className="text-gray-400 hover:text-red-500 flex-shrink-0"
                      title={t('quote.remove') || 'Xoá'}
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                )                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default QuoteRequest;