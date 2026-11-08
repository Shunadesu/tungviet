import useHeroSlides from './hooks/useHeroSlides';
import getHeroVariant from './utils/heroVariants';
import useHomeSection from '../../hooks/useHomeSection';

/**
 * HeroSection - main entry point for the hero area.
 *
 * Behaviour:
 *  - Admin tắt section "hero": không render gì.
 *  - Chưa có slide nào được cấu hình: KHÔNG render banner giả (gradient cứng,
 *    ảnh mặc định hay nội dung fallback). Khu vực này để trống cho tới khi
 *    Admin cấu hình slide trong "Hero slider".
 *  - Trong lúc cấu hình site đang tải lần đầu: overlay loading phủ toàn bộ
 *    layout do <Layout /> đảm nhiệm, nên hero chỉ cần trả về null.
 *  - Khi có 1+ slide: render từng slide qua variant tương ứng.
 *
 * Note: navigation/pagination between slides is intentionally not included
 * in the variant layer. Each variant renders ONE slide. If the homepage
 * eventually needs a Swiper again, the caller can wrap HeroSection with a
 * Swiper using per-slide variants as slides.
 */
const HeroSection = () => {
  const { slides, lang } = useHeroSlides();
  const section = useHomeSection('hero');

  if (!section.enabled) return null;
  if (!slides || slides.length === 0) return null;

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
