import { motion } from 'framer-motion';
import HeroEyebrow from '../atoms/HeroEyebrow';
import HeroTitle from '../atoms/HeroTitle';
import HeroDescription from '../atoms/HeroDescription';
import { HERO_ANIMATION_PRESETS, resolveHeightClass, resolveOverlayAlpha } from '../utils/heroTokens';

const absoluteUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
  }
  return url;
};

/**
 * Compact hero - 60vh, no CTA buttons, smaller title. For subpages.
 */
const HeroCompact = ({ slide, lang }) => {
  const preset = HERO_ANIMATION_PRESETS[slide.animationPreset] || HERO_ANIMATION_PRESETS['fade-up'];
  const heightClass = 'h-[60vh]';
  const _ = resolveHeightClass; // suppress unused warning while keeping import
  const overlayAlpha = resolveOverlayAlpha(slide.backgroundOverlay);
  const textClass = slide.theme === 'light' ? 'text-slate-900' : 'text-white';

  return (
    <section
      aria-label="Hero"
      className={`relative w-full ${heightClass} -mt-16 overflow-hidden bg-gray-900`}
    >
      {slide.imageUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${absoluteUrl(slide.imageUrl)})` }}
        />
      )}
      <div
        className="absolute inset-0"
        style={{ background: `rgba(0,0,0,${overlayAlpha})` }}
      />

      <motion.div
        {...preset}
        className={`relative z-10 h-full flex items-center justify-center text-center px-6 ${textClass}`}
      >
        <div className="flex flex-col items-center max-w-3xl">
          <HeroEyebrow text={slide.eyebrow} lang={lang} textClass={textClass} />
          <HeroTitle text={slide.title} lang={lang} size="md" textClass={textClass} />
          <div className="mt-3">
            <HeroDescription text={slide.description} lang={lang} size="md" textClass={textClass === 'text-white' ? 'text-white/90' : 'text-slate-700'} />
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroCompact;