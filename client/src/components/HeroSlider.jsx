/**
 * DEPRECATED: This file is kept as a backward-compatible alias.
 *
 * The hero implementation has been moved to `./hero/HeroSection.jsx` and is now
 * data-driven (variants + i18n + design tokens). Please import from there directly:
 *
 *   import HeroSection from '../components/hero';
 *
 * This shim remains so existing imports of `HeroSlider` (e.g. from Home.jsx)
 * continue to work without changes.
 */
import HeroSection from './hero';

const HeroSlider = HeroSection;

export default HeroSlider;