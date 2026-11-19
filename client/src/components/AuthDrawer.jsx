import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiX, FiLogIn, FiUserPlus } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useAuthDrawer } from '../context/AuthDrawerContext';
import { useToast } from '../context/ToastContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { lockBodyScroll } from '../utils/scrollLock';

const Z_INDEX = 2147483000;

const LoginForm = ({ onSuccess }) => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(formData.email, formData.password);
      toast.success(t('auth.loginSuccess', { defaultValue: 'Đăng nhập thành công' }));
      onSuccess();
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || t('auth.loginFailed');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <div className="bg-red-50 text-red-600 text-xs p-2 rounded-lg">{error}</div>}

      <div>
        <label className="block text-xs text-gray-600 mb-1">{t('auth.email')}</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          autoFocus
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
          placeholder={t('auth.passwordPlaceholder')}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <FiLogIn size={16} />
        {loading ? t('auth.loggingIn') : t('auth.login')}
      </button>
    </form>
  );
};

const RegisterForm = ({ onSuccess }) => {
  const { t } = useTranslation();
  const { register } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
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
    if (!/^[0-9+\s().-]{8,20}$/.test(formData.phone.trim())) {
      setError(t('auth.phoneInvalid'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register({
        name: formData.name.trim(),
        company: formData.company.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
      toast.success(t('auth.registerSuccess', { defaultValue: 'Đăng ký thành công' }));
      onSuccess();
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || t('auth.registerFailed');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <div className="bg-red-50 text-red-600 text-xs p-2 rounded-lg">{error}</div>}

      <div>
        <label className="block text-xs text-gray-600 mb-1">{t('auth.name')}</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          autoFocus
          className="input-field"
          placeholder={t('auth.namePlaceholder')}
        />
      </div>

      <div>
        <label className="block text-xs text-gray-600 mb-1">{t('auth.company')}</label>
        <input
          type="text"
          name="company"
          value={formData.company}
          onChange={handleChange}
          className="input-field"
          placeholder={t('auth.companyPlaceholder')}
        />
      </div>

      <div>
        <label className="block text-xs text-gray-600 mb-1">{t('auth.phone')}</label>
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
  );
};

const AuthDrawer = () => {
  const { t } = useTranslation();
  const { open, mode, closeAuthDrawer, switchMode } = useAuthDrawer();
  const { logoUrl } = useSiteConfig();
  const panelRef = useRef(null);
  // Hướng trượt của nội dung khi đổi tab: login -> register trượt sang trái, ngược lại sang phải
  const [direction, setDirection] = useState(1);

  // Body scroll lock
  useEffect(() => {
    if (!open) return undefined;
    return lockBodyScroll();
  }, [open]);

  // ESC để đóng
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') closeAuthDrawer();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, closeAuthDrawer]);

  const handleSwitch = (next) => {
    if (next === mode) return;
    setDirection(next === 'register' ? 1 : -1);
    switchMode(next);
  };

  if (typeof document === 'undefined') return null;

  const drawer = (
    <AnimatePresence>
      {open && (
        <div key="auth-drawer-root" style={{ position: 'fixed', inset: 0, zIndex: Z_INDEX }}>
          <motion.button
            type="button"
            tabIndex={-1}
            aria-label={t('auth.close', { defaultValue: 'Đóng' })}
            onClick={closeAuthDrawer}
            className="absolute inset-0 bg-black/40 cursor-default"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={mode === 'register' ? t('auth.registerTitle') : t('auth.loginTitle')}
            className="absolute inset-y-0 right-0 w-full sm:w-[420px] bg-white shadow-2xl flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
          >
            <div className="flex items-center justify-between px-5 pt-4">
              {logoUrl ? (
                <img src={logoUrl} alt="Tungviet" className="h-10 w-auto object-contain" />
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={closeAuthDrawer}
                aria-label={t('auth.close', { defaultValue: 'Đóng' })}
                className="p-2 text-gray-500 hover:text-primary transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="px-5 pt-3 pb-4">
              <h1 className="text-lg font-semibold text-primary">
                {mode === 'register' ? t('auth.registerTitle') : t('auth.loginTitle')}
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                {mode === 'register' ? t('auth.registerSubtitle') : t('auth.loginWelcome')}
              </p>

              <div className="grid grid-cols-2 gap-1 mt-4 p-1 bg-gray-100 rounded-xl">
                {['login', 'register'].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSwitch(key)}
                    aria-pressed={mode === key}
                    className={`py-2 text-xs font-medium rounded-lg transition-colors ${
                      mode === key ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {key === 'login' ? t('auth.login') : t('auth.register')}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-6">
              <AnimatePresence mode="wait" initial={false} custom={direction}>
                <motion.div
                  key={mode}
                  custom={direction}
                  initial={{ x: direction * 40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: direction * -40, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  {mode === 'register' ? (
                    <RegisterForm onSuccess={closeAuthDrawer} />
                  ) : (
                    <LoginForm onSuccess={closeAuthDrawer} />
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="mt-4 text-center text-xs">
                {mode === 'register' ? (
                  <>
                    <span className="text-gray-500">{t('auth.hasAccount')} </span>
                    <button type="button" onClick={() => handleSwitch('login')} className="text-primary font-medium hover:underline">
                      {t('auth.switchToLogin', { defaultValue: 'Đăng nhập' })}
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-gray-500">{t('auth.noAccount')} </span>
                    <button type="button" onClick={() => handleSwitch('register')} className="text-primary font-medium hover:underline">
                      {t('auth.switchToRegister', { defaultValue: 'Đăng ký' })}
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(drawer, document.body);
};

export default AuthDrawer;
