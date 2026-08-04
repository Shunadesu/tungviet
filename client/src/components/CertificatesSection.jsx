import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiShield, FiCheckCircle } from 'react-icons/fi';
import SectionHeader from './SectionHeader';

const CERTIFICATES = [
  {
    key: 'iso9001',
    code: 'ISO 9001:2015',
    fullName_vi: 'Hệ thống Quản lý Chất lượng',
    fullName_en: 'Quality Management System',
    issuer: 'International',
    accent: 'from-primary to-primary-700',
  },
  {
    key: 'iso14001',
    code: 'ISO 14001:2015',
    fullName_vi: 'Hệ thống Quản lý Môi trường',
    fullName_en: 'Environmental Management',
    issuer: 'International',
    accent: 'from-emerald-500 to-teal-600',
  },
  {
    key: 'reach',
    code: 'REACH',
    fullName_vi: 'An toàn Hóa chất Liên minh châu Âu',
    fullName_en: 'EU Chemicals Safety',
    issuer: 'European Union',
    accent: 'from-cyan-500 to-sky-600',
  },
  {
    key: 'fda',
    code: 'FDA',
    fullName_vi: 'Cục Quản lý Thực phẩm & Dược phẩm Hoa Kỳ',
    fullName_en: 'US Food & Drug Administration',
    issuer: 'United States',
    accent: 'from-teal-500 to-emerald-600',
  },
  {
    key: 'gmp',
    code: 'GMP',
    fullName_vi: 'Thực hành Sản xuất Tốt',
    fullName_en: 'Good Manufacturing Practice',
    issuer: 'World Health Org.',
    accent: 'from-blue-500 to-indigo-600',
  },
  {
    key: 'rohs',
    code: 'RoHS',
    fullName_vi: 'Hạn chế Chất độc hại',
    fullName_en: 'Restriction of Hazardous Substances',
    issuer: 'EU Directive',
    accent: 'from-green-500 to-emerald-600',
  },
];

const CertificateBadge = ({ cert, isEN }) => (
  <div className="flex-shrink-0 mx-3 my-1">
    <div className="group bg-white rounded-2xl px-5 py-4 shadow-md hover:shadow-2xl border border-slate-100 transition-all duration-300 flex items-center gap-4 min-w-[280px] hover:-translate-y-0.5">
      <div className={`relative w-14 h-14 flex-shrink-0 rounded-xl bg-gradient-to-br ${cert.accent} text-white flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:rotate-[4deg]`}>
        <FiShield size={26} />
        <span className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow">
          <FiCheckCircle size={14} className="text-emerald-500" fill="currentColor" />
        </span>
      </div>

      <div className="min-w-0">
        <p className="text-sm font-bold text-slate-900 truncate">{cert.code}</p>
        <p className="text-xs text-slate-500 mt-0.5 truncate">
          {isEN ? cert.fullName_en : cert.fullName_vi}
        </p>
        <p className="text-[10px] uppercase tracking-wider text-slate-400 mt-0.5">
          {cert.issuer}
        </p>
      </div>
    </div>
  </div>
);

const CertificatesSection = () => {
  const { t, i18n } = useTranslation();
  const isEN = i18n.language === 'en';

  const Marquee = ({ reverse = false, duration = 50 }) => (
    <div className="relative overflow-hidden group/track">
      <div
        className={`flex w-max ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'} group-hover/track:[animation-play-state:paused]`}
        style={{ animationDuration: `${duration}s` }}
      >
        {[...CERTIFICATES, ...CERTIFICATES].map((cert, index) => (
          <CertificateBadge key={`${cert.key}-${index}`} cert={cert} isEN={isEN} />
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
    <section className="relative bg-gradient-to-br from-primary-50/40 via-white to-emerald-50/40 py-16 md:py-20 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <SectionHeader
          eyebrow={isEN ? 'Certifications' : 'Chứng nhận'}
          title={t('certificates.title')}
          subtitle={t('certificates.subtitle')}
          align="center"
          className="mb-10"
        />
      </div>

      <div className="relative">
        <div
          className="absolute inset-y-0 left-0 w-20 md:w-40 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute inset-y-0 right-0 w-20 md:w-40 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"
          aria-hidden="true"
        />

        <Marquee duration={48} />
        <div className="h-2" />
        <Marquee reverse duration={56} />
      </div>
    </section>
  );
};

export default CertificatesSection;