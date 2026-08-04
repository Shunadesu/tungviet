import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPhone, FiSend, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import publicApi from '../api/publicApi';
import { sanitizeHtml } from '../utils/sanitize';

const QuoteSection = ({ data, products, markets }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    productType: '',
    market: '',
  });
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const setField = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (!form.email.trim()) return;
    if (!form.phone.trim()) return;

    setSending(true);
    setError('');
    try {
      await publicApi.submitQuote(form);
      setSubmitted(true);
      setForm({ name: '', email: '', phone: '', productType: '', market: '' });
    } catch {
      setError(t('quoteSection.error'));
    } finally {
      setSending(false);
    }
  };

  const bgStyle = data?.backgroundUrl
    ? {
        backgroundImage: `url(${data.backgroundUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {};

  return (
    <section
      style={bgStyle}
      className={`relative ${data?.backgroundUrl ? 'text-white' : 'bg-gradient-to-br from-primary/90 via-primary to-primary/80 text-white'}`}
    >
      {/* Overlay when has background */}
      {data?.backgroundUrl && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary to-primary/80" />
      )}

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-16 md:py-20">
        <div className="grid md:grid-cols-2 gap-10 items-center">

          {/* Left: Description */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {data?.title || t('quoteSection.title')}
            </h2>
            <div
              className="text-white/90 text-base leading-relaxed [&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:pl-5 [&_li]:mb-1"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(data?.subtitle || t('quoteSection.subtitle')) }}
            />
          </div>

          {/* Right: Form */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl text-gray-800">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-8 text-center gap-3"
              >
                <FiCheckCircle size={48} className="text-green-500" />
                <p className="text-base font-medium text-gray-800">{t('quoteSection.success')}</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-sm text-primary hover:underline mt-2"
                >
                  Gui them yeu cau khac
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {data?.title || t('quoteSection.title')}
                </h3>

                {/* Name */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {t('quoteSection.form.name')} *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                    placeholder={t('quoteSection.form.namePlaceholder')}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {t('quoteSection.form.email')} *
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setField('email', e.target.value)}
                    placeholder={t('quoteSection.form.emailPlaceholder')}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {t('quoteSection.form.phone')} *
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setField('phone', e.target.value)}
                    placeholder={t('quoteSection.form.phonePlaceholder')}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                    required
                  />
                </div>

                {/* Product Type */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {t('quoteSection.form.productType')}
                  </label>
                  <select
                    value={form.productType}
                    onChange={(e) => setField('productType', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm bg-white"
                  >
                    <option value="">{t('quoteSection.form.productTypePlaceholder')}</option>
                    {products.map((p) => (
                      <option key={p._id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Market */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {t('quoteSection.form.market')}
                  </label>
                  <select
                    value={form.market}
                    onChange={(e) => setField('market', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm bg-white"
                  >
                    <option value="">{t('quoteSection.form.marketPlaceholder')}</option>
                    {markets.map((m) => (
                      <option key={m._id} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 text-red-500 text-xs">
                    <FiAlertCircle size={14} />
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {sending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t('quoteSection.form.sending')}
                    </>
                  ) : (
                    <>
                      <FiSend size={16} />
                      {t('quoteSection.form.submit')}
                    </>
                  )}
                </button>

                {/* Hotlines */}
                {data?.hotlines?.length > 0 && (
                  <div className="pt-2 border-t border-gray-100">
                    {data.hotlines.map((h, idx) => (
                      <a
                        key={idx}
                        href={`tel:${h.number}`}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors py-1"
                      >
                        <FiPhone size={14} />
                        <span className="font-medium">{h.label}:</span>
                        <span>{h.number}</span>
                      </a>
                    ))}
                  </div>
                )}
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};

export default QuoteSection;
