import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiAward, FiUsers, FiTruck, FiHeadphones } from 'react-icons/fi';

const FEATURES = [
  {
    key: 'quality',
    Icon: FiAward,
    accent: 'from-sky-500 to-blue-600',
    shadow: 'shadow-sky-200/50',
  },
  {
    key: 'team',
    Icon: FiUsers,
    accent: 'from-emerald-500 to-teal-600',
    shadow: 'shadow-emerald-200/50',
  },
  {
    key: 'logistics',
    Icon: FiTruck,
    accent: 'from-cyan-500 to-sky-600',
    shadow: 'shadow-cyan-200/50',
  },
  {
    key: 'support',
    Icon: FiHeadphones,
    accent: 'from-teal-500 to-emerald-600',
    shadow: 'shadow-teal-200/50',
  },
];

const WhyUsSection = () => {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-white to-emerald-50 py-16 md:py-20">
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-sky-200/40 rounded-full blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-emerald-200/40 rounded-full blur-3xl" aria-hidden="true" />

      <div className="relative max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-3 py-1 text-xs font-medium uppercase tracking-wider text-emerald-700 bg-emerald-100 rounded-full mb-3">
            Why Tung Viet
          </span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900">
            {t('whyUs.title')}
          </h2>
          <p className="mt-3 text-sm md:text-base text-slate-600 max-w-2xl mx-auto">
            {t('whyUs.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(({ key, Icon, accent, shadow }, index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              whileHover={{ y: -6 }}
              className={`group relative bg-white rounded-2xl p-6 border border-slate-100 shadow-lg ${shadow} hover:shadow-2xl transition-all duration-300`}
            >
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${accent} text-white text-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <Icon />
              </div>

              <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-1.5">
                {t(`whyUs.${key}.title`)}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t(`whyUs.${key}.desc`)}
              </p>

              <div className="absolute inset-x-6 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUsSection;
