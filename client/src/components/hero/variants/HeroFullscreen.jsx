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
 * Fullscreen hero - background image covers entire section, text overlay centered.
 *
 * Props:
 *  - slide: slide object from API
 *  - lang: 'vi' | 'en'
 */
const HeroFullscreen = ({ slide, lang }) => {
  const preset = HERO_ANIMATION_PRESETS[slide.animationPreset] || HERO_ANIMATION_PRESETS['fade-up'];
  const heightClass = resolveHeightClass(slide.height);
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
        <div className="flex flex-col items-center max-w-4xl">
          <HeroEyebrow text={slide.eyebrow} lang={lang} textClass={textClass} />
          <HeroTitle text={slide.title} lang={lang} textClass={textClass} />
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

      <HeroScrollHint visible={slide.scrollHint !== false} textClass={textClass === 'text-white' ? 'text-white/80' : 'text-slate-700/80'} />
    </section>
  );
};

export default HeroFullscreen;