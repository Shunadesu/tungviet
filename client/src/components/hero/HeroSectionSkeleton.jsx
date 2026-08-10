import { motion } from 'framer-motion';
import HeroEyebrow from './atoms/HeroEyebrow';
import HeroTitle from './atoms/HeroTitle';
import HeroDescription from './atoms/HeroDescription';
import HeroCTAGroup from './atoms/HeroCTAGroup';
import { HERO_ANIMATION_PRESETS } from './utils/heroTokens';
import { useTranslation } from 'react-i18next';

/**
 * Skeleton / fallback hero - shown while loading or when no slides exist.
 * Uses i18n fallback text instead of hardcoded strings.
 */
const HeroSectionSkeleton = () => {
  const { t } = useTranslation();
  const preset = HERO_ANIMATION_PRESETS['fade-up'];

  const fallback = {
    eyebrow: t('hero.fallback.eyebrow'),
    title: t('hero.fallback.title'),
    description: t('hero.fallback.description'),
    ctaPrimary: {
      label: { vi: t('hero.fallback.ctaPrimary'), en: t('hero.fallback.ctaPrimary') },
      href: '/products',
      style: 'solid',
    },
    ctaSecondary: {
      label: { vi: t('hero.fallback.ctaSecondary'), en: t('hero.fallback.ctaSecondary') },
      href: '/contact',
      style: 'outline',
    },
  };

  return (
    <section
      aria-label="Hero"
      className="relative w-full h-screen -mt-16 overflow-hidden bg-gray-900"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(120deg, #14532d 0%, #166534 30%, #15803d 55%, #22c55e 80%, #bbf7d0 100%)',
          backgroundSize: '300% 300%',
          animation: 'heroGradient 14s ease-in-out infinite',
        }}
      />
      <div
        className="absolute inset-0 opacity-40 mix-blend-soft-light"
        style={{
          background:
            'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.5), transparent 55%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.35), transparent 55%)',
          animation: 'heroFloat 9s ease-in-out infinite alternate',
        }}
      />
      <style>{`
        @keyframes heroGradient {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes heroFloat {
          0%   { transform: translate3d(0, 0, 0) scale(1); }
          100% { transform: translate3d(-4%, 3%, 0) scale(1.05); }
        }
      `}</style>

      <motion.div
        {...preset}
        className="relative z-10 h-full flex items-center justify-center text-center text-white px-6"
      >
        <div className="flex flex-col items-center max-w-4xl">
          <HeroEyebrow text={fallback.eyebrow} textClass="text-white" />
          <HeroTitle text={fallback.title} textClass="text-white" />
          <div className="mt-4">
            <HeroDescription text={fallback.description} textClass="text-white/90" />
          </div>
          <HeroCTAGroup primary={fallback.ctaPrimary} secondary={fallback.ctaSecondary} theme="dark" />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSectionSkeleton;