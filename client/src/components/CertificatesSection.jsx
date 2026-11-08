import { useTranslation } from 'react-i18next';
import { FiAward } from 'react-icons/fi';
import SectionHeader from './SectionHeader';
import { useSiteConfig } from '../context/SiteConfigContext';
import { SUPPORTED_LOCALES } from '../i18n';
import useHomeSection from '../hooks/useHomeSection';

const CertificateBadge = ({ cert }) => {
  const name = cert.name || '';
  const description = cert.description || '';

  return (
    <div className="flex-shrink-0 mx-3 my-1">
      <div className="group bg-white rounded-2xl px-5 py-4 border border-slate-100 transition-all duration-300 flex items-center gap-4 min-w-[260px] hover:-translate-y-0.5 hover:shadow-md">
        <div className="relative w-14 h-14 flex-shrink-0 rounded-xl bg-primary-50 text-primary flex items-center justify-center overflow-hidden">
          {cert.imageUrl ? (
            <img
              src={cert.imageUrl}
              alt={name || ''}
              loading="lazy"
              className="w-full h-full object-contain p-1.5 transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <FiAward size={26} />
          )}
        </div>

        <div className="min-w-0">
          {name && <p className="text-sm font-bold text-slate-900 truncate">{name}</p>}
          {description && (
            <p className="text-xs text-slate-500 mt-0.5 truncate">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * CertificatesSection - hiển thị chứng nhận lấy từ API (quản lý tại
 * Admin > Nội dung trang chủ > Chứng nhận). Không có dữ liệu giả hardcode.
 */
const CertificatesSection = () => {
  const { t, i18n } = useTranslation();
  const { certificates = [] } = useSiteConfig();
  const section = useHomeSection('certificates');
  const lang = SUPPORTED_LOCALES.includes(i18n.language) ? i18n.language : 'vi';

  const items = (certificates || []).filter((c) => c && c.active !== false);

  if (!section.enabled) return null;
  if (items.length === 0) return null;

  const Marquee = ({ reverse = false, duration = 50 }) => (
    <div className="relative overflow-hidden group/track">
      <div
        className={`flex w-max ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'} group-hover/track:[animation-play-state:paused]`}
        style={{ animationDuration: `${duration}s` }}
      >
        {[...items, ...items].map((cert, index) => (
          <CertificateBadge key={`${cert._id || cert.name}-${index}`} cert={cert} />
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
          eyebrow={lang === 'en' ? 'Certifications' : 'Chứng nhận'}
          title={section.title || t('certificates.title')}
          subtitle={section.subtitle || t('certificates.subtitle')}
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
