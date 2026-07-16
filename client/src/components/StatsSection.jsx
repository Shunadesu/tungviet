import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useInView } from 'framer-motion';

const STATS = [
  { key: 'experience', value: 25, suffix: '+' },
  { key: 'clients', value: 500, suffix: '+' },
  { key: 'capacity', value: 10000, suffix: '+' },
  { key: 'countries', value: 40, suffix: '+' },
];

const formatNumber = (n) => {
  if (n >= 1000) return n.toLocaleString('en-US');
  return n.toString();
};

const CountUp = ({ target, suffix, duration = 1.6 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = null;
    let raf;
    const step = (ts) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(target * eased));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration]);

  return (
    <span ref={ref}>
      {formatNumber(display)}
      {suffix}
    </span>
  );
};

const StatsSection = () => {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-sky-900 via-cyan-900 to-emerald-900 py-16 md:py-20">
      <div className="absolute inset-0 opacity-30" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, rgba(56,189,248,0.4), transparent 45%), radial-gradient(circle at 80% 70%, rgba(16,185,129,0.4), transparent 45%)',
          }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
            {t('stats.title')}
          </h2>
          <div className="mt-3 mx-auto h-1 w-16 rounded-full bg-gradient-to-r from-sky-400 to-emerald-400" />
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map(({ key, value, suffix }, index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="text-center px-3 py-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm"
            >
              <div className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
                <CountUp target={value} suffix={suffix} />
              </div>
              <div className="mt-2 text-xs md:text-sm font-medium text-sky-200 uppercase tracking-wider">
                {t(`stats.${key}`)}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
