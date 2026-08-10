import { motion } from 'framer-motion';
import HeroEyebrow from '../atoms/HeroEyebrow';
import HeroTitle from '../atoms/HeroTitle';
import HeroDescription from '../atoms/HeroDescription';
import HeroCTAGroup from '../atoms/HeroCTAGroup';
import HeroScrollHint from '../atoms/HeroScrollHint';
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
 * Split hero - 2 columns on desktop (image left, text right).
 * On mobile stacks to fullscreen layout.
 */
const HeroSplit = ({ slide, lang }) => {
  const preset = HERO_ANIMATION_PRESETS[slide.animationPreset] || HERO_ANIMATION_PRESETS['fade-up'];
  const heightClass = resolveHeightClass(slide.height);
  const overlayAlpha = resolveOverlayAlpha(slide.backgroundOverlay);
  const textClass = slide.theme === 'light' ? 'text-slate-900' : 'text-white';

  return (
    <section
      aria-label="Hero"
      className={`relative w-full ${heightClass} -mt-16 overflow-hidden bg-gray-900`}
    >
      <div className="grid h-full md:grid-cols-2">
        {/* Image column */}
        <div className="relative h-full bg-cover bg-center hidden md:block"
             style={{ backgroundImage: slide.imageUrl ? `url(${absoluteUrl(slide.imageUrl)})` : 'none' }}>
          <div
            className="absolute inset-0"
            style={{ background: `rgba(0,0,0,${overlayAlpha * 0.4})` }}
          />
        </div>

        {/* Mobile fallback image */}
        {slide.imageUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center md:hidden"
            style={{ backgroundImage: `url(${absoluteUrl(slide.imageUrl)})` }}
          />
        )}
        <div
          className="absolute inset-0 md:hidden"
          style={{ background: `rgba(0,0,0,${overlayAlpha})` }}
        />

        {/* Text column */}
        <motion.div
          {...preset}
          className={`relative z-10 h-full flex items-center justify-center md:justify-start text-center md:text-left px-6 md:px-12 ${textClass} bg-gray-900/40 md:bg-gray-900/60 backdrop-blur-sm md:backdrop-blur-md`}
        >
          <div className="flex flex-col items-center md:items-start max-w-xl py-12">
            <HeroEyebrow text={slide.eyebrow} lang={lang} textClass={textClass} />
            <HeroTitle text={slide.title} lang={lang} size="lg" textClass={textClass} align="left" />
            <div className="mt-4">
              <HeroDescription text={slide.description} lang={lang} textClass={textClass === 'text-white' ? 'text-white/90' : 'text-slate-700'} />
            </div>
            <HeroCTAGroup
              primary={slide.ctaPrimary}
              secondary={slide.ctaSecondary}
              lang={lang}
              theme={slide.theme === 'light' ? 'light' : 'dark'}
            />
          </div>
        </motion.div>
      </div>

      <HeroScrollHint visible={slide.scrollHint !== false} textClass={textClass === 'text-white' ? 'text-white/80' : 'text-slate-700/80'} />
    </section>
  );
};

export default HeroSplit;