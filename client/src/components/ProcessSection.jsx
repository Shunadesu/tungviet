import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiMessageSquare, FiSettings, FiPackage, FiTruck } from 'react-icons/fi';
import SectionHeader from './SectionHeader';

const STEPS = [
  {
    key: 'consult',
    Icon: FiMessageSquare,
    accent: 'from-primary to-primary-700',
    ring: 'ring-primary-100',
    bg: 'bg-primary-50',
    color: 'text-primary',
  },
  {
    key: 'formulate',
    Icon: FiSettings,
    accent: 'from-emerald-500 to-teal-600',
    ring: 'ring-emerald-100',
    bg: 'bg-emerald-50',
    color: 'text-emerald-600',
  },
  {
    key: 'produce',
    Icon: FiPackage,
    accent: 'from-cyan-500 to-sky-600',
    ring: 'ring-cyan-100',
    bg: 'bg-cyan-50',
    color: 'text-cyan-600',
  },
  {
    key: 'deliver',
    Icon: FiTruck,
    accent: 'from-accent to-accent-700',
    ring: 'ring-accent-100',
    bg: 'bg-accent-50',
    color: 'text-accent-700',
  },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const stepVariants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const ProcessSection = () => {
  const { t } = useTranslation();

  return (
    <section className="relative bg-white py-16 md:py-20 lg:py-24 overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent hidden lg:block"
      />

      <div className="container-page">
        <SectionHeader
          eyebrow={t('process.eyebrow', 'How we work')}
          title={t('process.title', 'Quy trình hợp tác')}
          subtitle={t('process.subtitle', 'Từ yêu cầu đến giao hàng trong 4 bước rõ ràng.')}
          align="center"
          className="mb-14"
        />

        <motion.ol
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-5 relative"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          {STEPS.map(({ key, Icon, accent, ring, bg, color }, index) => (
            <motion.li
              key={key}
              variants={stepVariants}
              className="group relative h-full bg-white rounded-2xl border border-gray-100 p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${accent} text-white text-2xl font-bold shadow-lg transition-transform duration-500 group-hover:rotate-[360deg]`}
                  aria-hidden="true"
                >
                  <Icon size={28} />
                </span>
                <span className="text-4xl font-extrabold text-slate-200 leading-none tracking-tight">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              <h3 className="text-base md:text-lg font-bold text-slate-900 mb-1.5 tracking-tight">
                {t(`process.steps.${key}.title`)}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t(`process.steps.${key}.desc`)}
              </p>

              <div
                aria-hidden="true"
                className={`absolute inset-x-6 -bottom-px h-0.5 bg-gradient-to-r ${accent} scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-full`}
              />
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
};

export default ProcessSection;