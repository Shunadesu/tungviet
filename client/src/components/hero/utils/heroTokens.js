/**
 * Design tokens for the Hero section.
 * Centralised so variants stay consistent and easy to tweak.
 */

export const HERO_HEIGHTS = {
  fullscreen: 'h-screen',
  large: 'h-[80vh]',
  medium: 'h-[60vh]',
};

export const HERO_HEIGHT_DEFAULT = 'fullscreen';

export const HERO_VARIANTS = ['fullscreen', 'split', 'compact'];
export const HERO_VARIANT_DEFAULT = 'fullscreen';

export const HERO_THEMES = ['light', 'dark', 'auto'];
export const HERO_THEME_DEFAULT = 'auto';

export const HERO_ANIMATIONS = ['fade-up', 'fade', 'slide'];
export const HERO_ANIMATION_DEFAULT = 'fade-up';

export const HERO_CTA_STYLES = ['solid', 'outline', 'ghost'];
export const HERO_CTA_STYLE_DEFAULT = 'solid';

export const HERO_OVERLAY_MIN = 0;
export const HERO_OVERLAY_MAX = 100;
export const HERO_OVERLAY_DEFAULT = 50;

/**
 * Map slide.animationPreset -> framer-motion config
 */
export const HERO_ANIMATION_PRESETS = {
  'fade-up': {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: 'easeOut' },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.8, ease: 'easeOut' },
  },
  slide: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

/**
 * Container-level stagger for multi-slide hero (Swiper replacement).
 */
export const HERO_CONTAINER_VARIANTS = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

/**
 * Resolve a height token to Tailwind class.
 */
export const resolveHeightClass = (height) =>
  HERO_HEIGHTS[height] || HERO_HEIGHTS[HERO_HEIGHT_DEFAULT];

/**
 * Map theme token to text color class (used in atoms).
 * - light: dark text on light/photo bg
 * - dark:  white text always
 * - auto:  white text (default for photo background)
 */
export const resolveTextClass = (theme) => {
  if (theme === 'light') return 'text-slate-900';
  return 'text-white';
};

/**
 * Convert overlay percentage (0-100) to rgba alpha.
 */
export const resolveOverlayAlpha = (overlay) => {
  const safe = Math.max(HERO_OVERLAY_MIN, Math.min(HERO_OVERLAY_MAX, overlay ?? HERO_OVERLAY_DEFAULT));
  return safe / 100;
};

export default {
  HERO_HEIGHTS,
  HERO_HEIGHT_DEFAULT,
  HERO_VARIANTS,
  HERO_VARIANT_DEFAULT,
  HERO_THEMES,
  HERO_THEME_DEFAULT,
  HERO_ANIMATIONS,
  HERO_ANIMATION_DEFAULT,
  HERO_CTA_STYLES,
  HERO_CTA_STYLE_DEFAULT,
  HERO_OVERLAY_MIN,
  HERO_OVERLAY_MAX,
  HERO_OVERLAY_DEFAULT,
  HERO_ANIMATION_PRESETS,
  HERO_CONTAINER_VARIANTS,
  resolveHeightClass,
  resolveTextClass,
  resolveOverlayAlpha,
};