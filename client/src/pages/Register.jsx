import { useState } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUserPlus } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import { SUPPORTED_LOCALES } from '../i18n';

const Register = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { register } = useAuth();
  const { lang: urlLang } = useParams();
  const lang = SUPPORTED_LOCALES.includes(urlLang) ? urlLang : i18n.language || 'vi';
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    if (formData.password.length < 6) {
      setError(t('auth.passwordTooShort'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register(formData.name, formData.email, formData.password);
      navigate(`/${lang}`);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        t('auth.registerFailed');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-50 to-white px-2 py-8"
    >
      <SEO title={t('auth.registerTitle')} description={t('auth.registerSubtitle')} url={`/${lang}/register`} noindex />
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-6">
            <span className="text-3xl">🏭</span>
            <h1 className="text-lg font-semibold text-primary mt-2">{t('auth.registerTitle')}</h1>
            <p className="text-xs text-gray-500 mt-1">{t('auth.registerSubtitle')}</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-xs p-2 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">{t('auth.name')}</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input-field"
                placeholder={t('auth.namePlaceholder')}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">{t('auth.email')}</label>
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
              <label className="block text-xs text-gray-600 mb-1">{t('auth.password')}</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="input-field"
                placeholder={t('auth.passwordHint')}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">{t('auth.confirmPassword')}</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="input-field"
                placeholder={t('auth.confirmPasswordPlaceholder')}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <FiUserPlus size={16} />
              {loading ? t('auth.registering') : t('auth.register')}
            </button>
          </form>

          <div className="mt-4 text-center text-xs">
            <span className="text-gray-500">{t('auth.hasAccount')} </span>
            <Link to={`/${lang}/login`} className="text-primary font-medium hover:underline">
              {t('auth.login')}
            </Link>
          </div>

          <div className="mt-4 pt-4 border-t">
            <Link to={`/${lang}`} className="block text-center text-xs text-gray-500 hover:text-primary">
              {t('auth.backToHome')}
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Register;