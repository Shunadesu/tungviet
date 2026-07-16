import { useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { motion } from 'framer-motion';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

import { useSiteConfig } from '../context/SiteConfigContext';
import { SUPPORTED_LOCALES } from '../i18n';

const absoluteUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
  }
  return url;
};

const AnimatedGradient = () => (
  <div className="absolute inset-0 overflow-hidden">
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
  </div>
);

export default function HeroSlider() {
  const { heroSlides } = useSiteConfig();
  const { lang: urlLang } = useParams();
  const lang = SUPPORTED_LOCALES.includes(urlLang) ? urlLang : 'vi';

  const slidesWithImage = (heroSlides || []).filter(
    (s) => s.active !== false && s.imageUrl
  );

  if (slidesWithImage.length === 0) {
    return (
      <section aria-label="Hero" className="relative w-full h-screen -mt-16 overflow-hidden">
        <AnimatedGradient />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 h-full flex items-center justify-center text-center text-white px-6"
        >
          <h1 className="text-4xl md:text-6xl font-bold max-w-3xl leading-tight drop-shadow-lg">
            {lang === 'en' ? 'Bringing Nature Closer' : 'Mang Thiên Nhiên Đến Gần Bạn'}
          </h1>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="relative w-full h-screen -mt-16 overflow-hidden bg-gray-900">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        effect="fade"
        loop={slidesWithImage.length > 1}
        className="h-full hero-swiper"
      >
        {slidesWithImage.map((slide) => (
          <SwiperSlide key={slide._id}>
            <div
              className="relative w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${absoluteUrl(slide.imageUrl)})` }}
            >
              <div className="absolute inset-0 bg-black/50" />
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 h-full flex items-center justify-center text-center text-white px-6"
              >
                {slide.title && (
                  <h1
                    className="text-2xl md:text-4xl lg:text-5xl font-bold max-w-4xl leading-tight drop-shadow-lg"
                    dangerouslySetInnerHTML={{ __html: slide.title }}
                  />
                )}
              </motion.div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style>{`
        .hero-swiper .swiper-button-next,
        .hero-swiper .swiper-button-prev {
          color: white;
          width: 44px;
          height: 44px;
          background: rgba(0,0,0,0.25);
          border-radius: 9999px;
          transition: background 0.2s ease;
        }
        .hero-swiper .swiper-button-next:hover,
        .hero-swiper .swiper-button-prev:hover {
          background: rgba(0,0,0,0.5);
        }
        .hero-swiper .swiper-button-next::after,
        .hero-swiper .swiper-button-prev::after {
          font-size: 18px;
          font-weight: 700;
        }
        .hero-swiper .swiper-pagination-bullet {
          background: rgba(255,255,255,0.6);
          opacity: 1;
        }
        .hero-swiper .swiper-pagination-bullet-active {
          background: white;
        }
      `}</style>
    </section>
  );
}