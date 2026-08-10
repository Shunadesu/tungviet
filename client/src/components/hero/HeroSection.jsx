import useHeroSlides from './hooks/useHeroSlides';
import HeroSectionSkeleton from './HeroSectionSkeleton';
import getHeroVariant from './utils/heroVariants';

/**
 * HeroSection - main entry point for the hero area.
 *
 * Behaviour:
 *  - When loading: render skeleton
 *  - When 0 slides: render skeleton (with i18n fallback)
 *  - When 1+ slides: render each via its variant
 *
 * Note: navigation/pagination between slides is intentionally not included
 * in the variant layer. Each variant renders ONE slide. If the homepage
 * eventually needs a Swiper again, the caller can wrap HeroSection with a
 * Swiper using per-slide variants as slides.
 */
const HeroSection = () => {
  const { slides, loading, lang } = useHeroSlides();

  if (loading || slides.length === 0) {
    return <HeroSectionSkeleton />;
  }

  return (
    <div className="hero-section-root">
      {slides.map((slide) => {
        const Variant = getHeroVariant(slide.variant);
        return <Variant key={slide._id} slide={slide} lang={lang} />;
      })}
    </div>
  );
};

export default HeroSection;