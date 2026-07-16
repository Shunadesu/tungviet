import { motion } from 'framer-motion';
import { FiPhone, FiMail, FiMapPin, FiClock } from 'react-icons/fi';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { useSiteConfig } from '../context/SiteConfigContext';
import { SUPPORTED_LOCALES } from '../i18n';

const Contact = () => {
  const { t, i18n } = useTranslation();
  const lang = SUPPORTED_LOCALES.includes(i18n.language) ? i18n.language : 'vi';
  const { footer } = useSiteConfig();

  const items = [
    {
      icon: <FiPhone size={18} />,
      labelKey: 'contact.phone',
      value: footer?.phone,
      href: footer?.phone ? `tel:${footer.phone.replace(/\s/g, '')}` : null,
    },
    {
      icon: <FiMail size={18} />,
      labelKey: 'contact.email',
      value: footer?.email,
      href: footer?.email ? `mailto:${footer.email}` : null,
    },
    {
      icon: <FiMapPin size={18} />,
      labelKey: 'contact.address',
      value: footer?.address,
      href: null,
    },
    {
      icon: <FiClock size={18} />,
      labelKey: 'contact.workingHours',
      value: t('contact.workingHoursText'),
      href: null,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-8"
    >
      <SEO
        title={t('contact.title')}
        description={t('contact.subtitle')}
        url={`/${lang}/contact`}
      />

      <div className="bg-primary text-white py-8">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-2xl font-semibold mb-2">{t('contact.title')}</h1>
          <p className="text-sm text-white/80">{t('contact.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.labelKey} className="bg-white rounded-lg p-4 border flex items-start gap-3">
              <div className="text-primary flex-shrink-0 mt-0.5">{item.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 uppercase">{t(item.labelKey)}</p>
                {item.href && item.value ? (
                  <a
                    href={item.href}
                    className="text-sm text-gray-800 hover:text-primary break-all"
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="text-sm text-gray-800">{item.value || '—'}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg p-4 border">
          <h2 className="text-sm font-semibold mb-3">{t('home.ctaTitle')}</h2>
          <p className="text-xs text-gray-600 mb-3">{t('home.ctaSubtitle')}</p>
          <Link to={`/${lang}/quote`} className="btn-primary inline-block text-sm">
            {t('contact.sendMessage')}
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default Contact;