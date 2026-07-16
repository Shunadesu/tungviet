import { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiTrash2, FiX, FiMail } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { useQuoteBag } from '../context/QuoteBagContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { SUPPORTED_LOCALES } from '../i18n';
import placeholderProduct from '../assets/placeholder-product.svg';

const QuoteRequest = () => {
  const { t, i18n } = useTranslation();
  const lang = SUPPORTED_LOCALES.includes(i18n.language) ? i18n.language : 'vi';

  const { items, count, removeFromQuoteBag, clearQuoteBag } = useQuoteBag();
  const { footer } = useSiteConfig();

  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    preferredContact: 'email',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    document.title = t('quote.title');
  }, [t]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = true;
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = true;
    }
    if (!formData.phone.trim()) newErrors.phone = true;
    if (count === 0) newErrors.items = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildEmailBody = () => {
    const lines = [
      `${t('quote.fullName')}: ${formData.fullName}`,
      `${t('quote.email')}: ${formData.email}`,
      `${t('quote.phone')}: ${formData.phone}`,
    ];
    if (formData.company) lines.push(`${t('quote.company')}: ${formData.company}`);
    lines.push('');
    lines.push(`${t('quote.bag')}:`);
    items.forEach((it, i) => {
      lines.push(`${i + 1}. ${it.name}${it.softeningPoint ? ` (${it.softeningPoint})` : ''} - ${it._id}`);
    });
    if (formData.message) {
      lines.push('');
      lines.push(`${t('quote.message')}:`);
      lines.push(formData.message);
    }
    lines.push('');
    lines.push(`${t('quote.preferredContact')}: ${formData.preferredContact === 'email' ? t('quote.preferredEmail') : t('quote.preferredPhone')}`);
    return lines.join('\n');
  };

  const handleSendViaEmail = () => {
    if (!validate()) return;
    const to = footer?.email || 'contact@zuna.vn';
    const subject = `[Quote Request] ${formData.fullName}`;
    const body = buildEmailBody();
    const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    setSuccess(true);
  };

  const handleSendAnother = () => {
    setSuccess(false);
    clearQuoteBag();
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      company: '',
      message: '',
      preferredContact: 'email',
    });
  };

  const summaryItems = useMemo(() => items, [items]);

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen flex items-center justify-center px-4"
      >
        <div className="text-center max-w-md mx-auto">
          <FiCheckCircle size={72} className="mx-auto text-green-500 mb-3" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('quote.success')}</h2>
          <p className="text-sm text-gray-600 mb-4">
            {t('quote.successSubtitle')}{' '}
            <strong>{formData.preferredContact === 'email' ? formData.email : formData.phone}</strong>.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link to={`/${lang}/products`} className="btn-secondary text-sm">
              {t('quote.browseProducts')}
            </Link>
            <button type="button" onClick={handleSendAnother} className="btn-primary text-sm">
              {t('quote.sendAnother')}
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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendViaEmail();
          }}
          className="lg:col-span-2 space-y-4"
        >
          <div className="bg-white rounded-lg p-4">
            <h2 className="text-sm font-semibold mb-3">{t('quote.info')}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">{t('quote.fullName')} *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder={t('auth.fullNamePlaceholder')}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">{t('quote.email')} *</label>
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
                  <label className="block text-xs text-gray-600 mb-1">{t('quote.phone')} *</label>
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
                <label className="block text-xs text-gray-600 mb-1">{t('quote.company')}</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="input-field"
                  placeholder={t('quote.companyPlaceholder')}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">{t('quote.message')}</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="input-field resize-none"
                  placeholder={t('quote.messagePlaceholder')}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">{t('quote.preferredContact')}</label>
                <div className="flex gap-2">
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="preferredContact"
                      value="email"
                      checked={formData.preferredContact === 'email'}
                      onChange={handleChange}
                    />
                    {t('quote.preferredEmail')}
                  </label>
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="preferredContact"
                      value="phone"
                      checked={formData.preferredContact === 'phone'}
                      onChange={handleChange}
                    />
                    {t('quote.preferredPhone')}
                  </label>
                </div>
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2">
            <FiMail size={16} />
            {t('quote.sendViaEmail')}
          </button>
          {errors.items && (
            <p className="text-xs text-red-600 text-center">{t('quote.bagEmpty')}</p>
          )}
        </form>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg p-4 sticky top-16">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold">
                {t('quote.bag')} ({count})
              </h2>
              {count > 0 && (
                <button
                  type="button"
                  onClick={clearQuoteBag}
                  className="text-[10px] text-red-600 hover:underline flex items-center gap-1"
                >
                  <FiTrash2 size={10} />
                  {t('quote.clear')}
                </button>
              )}
            </div>

            {summaryItems.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-gray-500 mb-2">{t('quote.bagEmpty')}</p>
                <Link to={`/${lang}/products`} className="text-xs text-primary hover:underline">
                  {t('quote.browseProducts')}
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
                      title={t('quote.remove')}
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default QuoteRequest;