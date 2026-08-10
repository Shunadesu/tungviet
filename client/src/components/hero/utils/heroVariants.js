import HeroFullscreen from '../variants/HeroFullscreen.jsx';
import HeroSplit from '../variants/HeroSplit.jsx';
import HeroCompact from '../variants/HeroCompact.jsx';
import { HERO_VARIANT_DEFAULT } from './heroTokens.js';

const VARIANT_MAP = {
  fullscreen: HeroFullscreen,
  split: HeroSplit,
  compact: HeroCompact,
};

/**
 * Resolve variant name -> component. Falls back to default.
 */
const getHeroVariant = (name) =>
  VARIANT_MAP[name] || VARIANT_MAP[HERO_VARIANT_DEFAULT];

export { VARIANT_MAP };
export default getHeroVariant;