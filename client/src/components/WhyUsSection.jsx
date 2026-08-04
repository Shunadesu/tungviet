import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiAward, FiUsers, FiTruck, FiHeadphones } from 'react-icons/fi';

const FEATURES = [
  {
    key: 'quality',
    Icon: FiAward,
    accent: 'from-primary to-primary-700',
    ring: 'ring-primary-100',
    iconBg: 'bg-primary-50',
    iconColor: 'text-primary',
  },
  {
    key: 'team',
    Icon: FiUsers,
    accent: 'from-emerald-500 to-teal-600',
    ring: 'ring-emerald-100',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    key: 'logistics',
    Icon: FiTruck,
    accent: 'from-cyan-500 to-sky-600',
    ring: 'ring-cyan-100',
    iconBg: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
  },
  {
    key: 'support',
    Icon: FiHeadphones,
    accent: 'from-accent to-accent-700',
    ring: 'ring-accent-100',
    iconBg: 'bg-accent-50',
    iconColor: 'text-accent-700',
  },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const WhyUsSection = () => {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-50/40 via-white to-emerald-50/40 py-16 md:py-20">
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl" aria-hidden="true" />

      <div className="relative max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary bg-primary-50 rounded-full mb-3">
            Why Tung Viet
          </span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900">
            {t('whyUs.title')}
          </h2>
          <p className="mt-3 text-sm md:text-base text-slate-600 max-w-2xl mx-auto">
            {t('whyUs.subtitle')}
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          {FEATURES.map(({ key, Icon, iconBg, iconColor, ring }) => (
            <motion.article
              key={key}
              variants={cardVariants}
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="group relative bg-white rounded-2xl p-6 border border-slate-100 shadow-card hover:shadow-card-hover transition-shadow duration-300 overflow-hidden"
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute inset-x-6 -bottom-px h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center`}
              />

              <div className="relative mb-4">
                <span
                  className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ring-2 ${iconBg} ${iconColor} ${ring} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[6deg]`}
                >
                  <Icon size={24} />
                </span>
              </div>

              <h3 className="text-base md:text-lg font-bold text-slate-900 mb-1.5 tracking-tight">
                {t(`whyUs.${key}.title`)}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t(`whyUs.${key}.desc`)}
              </p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default WhyUsSection;