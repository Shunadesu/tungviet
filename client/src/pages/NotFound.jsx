import { motion } from 'framer-motion';
import { Link, useLocation, useParams } from 'react-router-dom';
import { FiHome, FiArrowRight, FiCompass, FiPackage, FiTrendingUp, FiInfo, FiFileText, FiSearch } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { SUPPORTED_LOCALES } from '../i18n';

/**
 * Trang 404 — hiển thị khi người dùng truy cập một đường dẫn không được đăng ký
 * trong hệ thống route của ứng dụng.
 *
 * Trang được render bên trong <Layout> nên vẫn giữ đầy đủ header/footer,
 * giúp người dùng không bị cảm giác "mất trang web".
 */
const NotFound = () => {
  const { t } = useTranslation();
  const { lang: urlLang } = useParams();
  const location = useLocation();
  const lang = SUPPORTED_LOCALES.includes(urlLang) ? urlLang : 'vi';
  const prefix = `/${lang}`;

  const quickLinks = [
    { to: `${prefix}/products`, label: t('notFound.links.products'), icon: FiPackage },
    { to: `${prefix}/markets`, label: t('notFound.links.markets'), icon: FiTrendingUp },
    { to: `${prefix}/about`, label: t('notFound.links.about'), icon: FiInfo },
    { to: `${prefix}/news`, label: t('notFound.links.news'), icon: FiSearch },
    { to: `${prefix}/quote`, label: t('notFound.links.quote'), icon: FiFileText },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center py-16 md:py-24"
    >
      <SEO
        title={t('notFound.title')}
        description={t('notFound.description')}
        url={location.pathname}
        noindex
      />

      <div className="container-page">
        <div className="max-w-2xl mx-auto text-center">
          {/* Mã lỗi */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative inline-block mb-4"
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 blur-3xl bg-primary-100/50 rounded-full w-40 h-40 mx-auto"
            />
            <span className="relative text-[80px] md:text-[120px] font-extrabold leading-none tracking-tight text-transparent bg-gradient-to-br from-primary via-primary-600 to-accent bg-clip-text select-none">
              {t('notFound.code')}
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-14 h-14 rounded-2xl bg-primary-50 text-primary flex items-center justify-center mx-auto mb-5"
          >
            <FiCompass size={26} aria-hidden="true" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mb-3"
          >
            {t('notFound.title')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm md:text-base text-slate-600 leading-relaxed max-w-xl mx-auto mb-8"
          >
            {t('notFound.description')}
          </motion.p>

          {/* Nút quay về trang chủ */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="flex justify-center"
          >
            <Link to={prefix} className="btn-primary shadow-sm">
              <FiHome size={16} aria-hidden="true" />
              {t('notFound.backHome')}
              <FiArrowRight size={16} aria-hidden="true" />
            </Link>
          </motion.div>

          {/* Liên kết nhanh */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
              {t('notFound.popularLinks')}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {quickLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-200 bg-white text-sm text-slate-600 hover:text-primary hover:border-primary/30 hover:bg-primary-50/50 transition-colors"
                >
                  <Icon size={15} aria-hidden="true" />
                  {label}
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default NotFound;
