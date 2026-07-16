import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiShield, FiCheckCircle } from 'react-icons/fi';

const CERTIFICATES = [
  { key: 'iso9001', code: 'ISO 9001:2015', accent: 'from-sky-500 to-blue-600' },
  { key: 'iso14001', code: 'ISO 14001:2015', accent: 'from-emerald-500 to-teal-600' },
  { key: 'reach', code: 'REACH Compliance', accent: 'from-cyan-500 to-sky-600' },
  { key: 'fda', code: 'FDA Approved', accent: 'from-teal-500 to-emerald-600' },
  { key: 'gmp', code: 'GMP Certificate', accent: 'from-blue-500 to-indigo-600' },
  { key: 'rohs', code: 'RoHS Compliance', accent: 'from-green-500 to-emerald-600' },
];

const CertificateBadge = ({ cert }) => (
  <div className="flex-shrink-0 mx-3 my-1">
    <div className="group bg-white rounded-2xl px-5 py-4 shadow-md hover:shadow-2xl border border-slate-100 transition-all duration-300 flex items-center gap-4 min-w-[260px]">
      <div className={`relative w-14 h-14 flex-shrink-0 rounded-xl bg-gradient-to-br ${cert.accent} text-white flex items-center justify-center shadow-lg`}>
        <FiShield size={26} />
        <span className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow">
          <FiCheckCircle size={14} className="text-emerald-500" fill="currentColor" />
        </span>
      </div>

      <div className="min-w-0">
        <p className="text-sm font-bold text-slate-900 truncate">{cert.code}</p>
        <p className="text-xs text-slate-500 mt-0.5">
          {cert.key === 'reach'
            ? 'European Union'
            : cert.key === 'fda'
            ? 'United States'
            : cert.key === 'gmp'
            ? 'World Health Org.'
            : cert.key === 'rohs'
            ? 'EU Directive'
            : 'International'}
        </p>
      </div>
    </div>
  </div>
);

const CertificatesSection = () => {
  const { t } = useTranslation();

  const Marquee = ({ reverse = false, duration = 30 }) => (
    <div className="relative overflow-hidden">
      <div
        className={`flex w-max ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'}`}
        style={{ animationDuration: `${duration}s` }}
      >
        {[...CERTIFICATES, ...CERTIFICATES].map((cert, index) => (
          <CertificateBadge key={`${cert.key}-${index}`} cert={cert} />
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes marquee-reverse {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
        .animate-marquee {
          animation: marquee linear infinite;
        }
        .animate-marquee-reverse {
          animation: marquee-reverse linear infinite;
        }
      `}</style>
    </div>
  );

  return (
    <section className="relative bg-gradient-to-br from-sky-50 via-white to-emerald-50 py-16 md:py-20 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <span className="inline-block px-3 py-1 text-xs font-medium uppercase tracking-wider text-sky-700 bg-sky-100 rounded-full mb-3">
            Certifications
          </span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900">
            {t('certificates.title')}
          </h2>
          <p className="mt-3 text-sm md:text-base text-slate-600 max-w-2xl mx-auto">
            {t('certificates.subtitle')}
          </p>
        </motion.div>
      </div>

      <div className="relative">
        <div
          className="absolute inset-y-0 left-0 w-20 md:w-40 bg-gradient-to-r from-sky-50 to-transparent z-10 pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute inset-y-0 right-0 w-20 md:w-40 bg-gradient-to-l from-emerald-50 to-transparent z-10 pointer-events-none"
          aria-hidden="true"
        />

        <Marquee duration={32} />
        <Marquee reverse duration={40} />
      </div>
    </section>
  );
};

export default CertificatesSection;
