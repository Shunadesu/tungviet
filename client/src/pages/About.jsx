import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { FiAward, FiShield, FiStar, FiTrendingUp, FiGlobe, FiHeart, FiCheckCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { useSiteConfig } from '../context/SiteConfigContext';
import { SUPPORTED_LOCALES } from '../i18n';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const ICON_MAP = {
  FiAward,
  FiShield,
  FiStar,
  FiTrendingUp,
  FiGlobe,
  FiHeart,
  FiCheckCircle,
};

const absoluteUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
  }
  return url;
};

const CounterNumber = ({ value }) => {
  const ref = useRef(null);
  const display = value || 0;
  return (
    <span ref={ref}>
      {display.toLocaleString()}
    </span>
  );
};

// ── Section 1: About Hero Swiper ─────────────────────────────────────────────
function AboutHeroSwiper({ slides, lang }) {
  if (!slides || slides.length === 0) {
    return (
      <section className="relative w-full h-[60vh] bg-primary flex items-center justify-center">
        <div className="text-center text-white px-6">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">{lang === 'en' ? 'About Us' : 'Về chúng tôi'}</h1>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full h-[70vh] overflow-hidden bg-gray-900">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop={slides.length > 1}
        className="h-full about-hero-swiper"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide._id}>
            <div
              className="relative w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${absoluteUrl(slide.imageUrl)})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="relative z-10 h-full flex flex-col items-center justify-end pb-20 px-6 text-center text-white">
                {slide.title && (
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-4xl md:text-6xl font-bold max-w-4xl leading-tight drop-shadow-lg mb-3"
                    dangerouslySetInnerHTML={{ __html: slide.title }}
                  />
                )}
                {slide.subtitle && (
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    className="text-lg md:text-xl max-w-2xl text-white/90"
                    dangerouslySetInnerHTML={{ __html: slide.subtitle }}
                  />
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style>{`
        .about-hero-swiper .swiper-button-next,
        .about-hero-swiper .swiper-button-prev {
          color: white;
          width: 44px;
          height: 44px;
          background: rgba(0,0,0,0.3);
          border-radius: 9999px;
        }
        .about-hero-swiper .swiper-button-next:hover,
        .about-hero-swiper .swiper-button-prev:hover {
          background: rgba(0,0,0,0.6);
        }
        .about-hero-swiper .swiper-button-next::after,
        .about-hero-swiper .swiper-button-prev::after {
          font-size: 18px;
          font-weight: 700;
        }
        .about-hero-swiper .swiper-pagination-bullet {
          background: rgba(255,255,255,0.6);
        }
        .about-hero-swiper .swiper-pagination-bullet-active {
          background: white;
        }
      `}</style>
    </section>
  );
}

// ── Section 2: Description & History ─────────────────────────────────────────
function DescriptionSection({ about, lang }) {
  const { t } = useTranslation();

  const hasContent = about?.intro || about?.history;

  if (!hasContent) {
    return (
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center text-gray-400 text-sm">{t('about.noFacts')}</div>
      </section>
    );
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {about.foundedYear && (
            <div className="mb-4">
              <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">
                {t('about.founded')} {about.foundedYear}
              </span>
            </div>
          )}
          <h2 className="text-xl font-semibold text-gray-800 mb-3">{t('about.description')}</h2>
          {about.intro ? (
            <div
              className="text-sm text-gray-600 leading-relaxed space-y-2 [&_p]:mb-2 [&_ul]:pl-5 [&_li]:mb-1 [&_a]:text-primary [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: about.intro }}
            />
          ) : (
            <p className="text-sm text-gray-400">{lang === 'en' ? 'No introduction yet.' : 'Chưa có mô tả.'}</p>
          )}
        </motion.div>

        {/* History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-3">{t('about.history')}</h2>
          {about.history ? (
            <div
              className="text-sm text-gray-600 leading-relaxed space-y-2 [&_p]:mb-2 [&_ul]:pl-5 [&_li]:mb-1 [&_a]:text-primary [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: about.history }}
            />
          ) : (
            <p className="text-sm text-gray-400">{lang === 'en' ? 'No history yet.' : 'Chưa có lịch sử.'}</p>
          )}
        </motion.div>
      </div>
    </section>
  );
}

// ── Section 3: Fast Facts ────────────────────────────────────────────────────
function FastFactsSection({ facts, lang }) {
  const { t } = useTranslation();

  if (!facts || facts.length === 0) {
    return null;
  }

  return (
    <section className="bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-lg font-semibold text-gray-800 text-center mb-8"
        >
          {t('about.fastFactsTitle')}
        </motion.h2>
        <div className={`grid gap-4 ${
          facts.length === 1 ? 'grid-cols-1 max-w-sm mx-auto'
            : facts.length === 2 ? 'grid-cols-2 max-w-2xl mx-auto'
            : facts.length === 3 ? 'grid-cols-3'
            : 'grid-cols-2 md:grid-cols-4'
        }`}>
          {facts.map((fact, idx) => (
            <motion.div
              key={fact._id || idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="bg-white rounded-xl p-5 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="text-3xl font-bold text-primary mb-1">
                <CounterNumber value={fact.value} />
                {fact.suffix && (
                  <span className="text-lg text-primary/70 ml-0.5">{fact.suffix}</span>
                )}
              </div>
              <p className="text-xs text-gray-500 font-medium">{fact.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Section 4: Core Values ───────────────────────────────────────────────────
function CoreValuesSection({ values }) {
  const { t } = useTranslation();

  if (!values || values.length === 0) {
    return null;
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-8"
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-2">{t('about.coreValues')}</h2>
        <p className="text-sm text-gray-500">{t('about.valuesIntro')}</p>
      </motion.div>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {values.map((value, idx) => {
          const IconComponent = ICON_MAP[value.icon] || FiAward;
          return (
            <motion.div
              key={value._id || idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              whileHover={{ y: -4, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
              className="bg-white rounded-xl p-5 border border-gray-100 hover:border-primary/20 transition-all cursor-default"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-3">
                <IconComponent size={20} />
              </div>
              <h3 className="text-sm font-semibold text-gray-800 mb-1">{value.title}</h3>
              {value.description && (
                <p className="text-xs text-gray-500 leading-relaxed">{value.description}</p>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

// ── Main About Page ────────────────────────────────────────────────────────────
const About = () => {
  const { t, i18n } = useTranslation();
  const lang = SUPPORTED_LOCALES.includes(i18n.language) ? i18n.language : 'vi';
  const { aboutSlides, about, fastFacts, coreValues } = useSiteConfig();

  const activeSlides = (aboutSlides || []).filter((s) => s.active !== false && s.imageUrl);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-16"
    >
      <SEO
        title={t('about.title')}
        description={t('about.companyIntro')}
        url={`/${lang}/about`}
      />

      {/* Section 1: Hero Swiper */}
      <AboutHeroSwiper slides={activeSlides} lang={lang} />

      {/* Section 2: Description & History */}
      <DescriptionSection about={about} lang={lang} />

      {/* Section 3: Fast Facts */}
      <FastFactsSection facts={fastFacts} lang={lang} />

      {/* Section 4: Core Values */}
      <CoreValuesSection values={coreValues} />

      {/* Section 5: CTA */}
      <section className="bg-primary-50 rounded-lg mx-4 max-w-5xl mx-auto px-4 py-6 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <FiAward size={20} className="text-primary" />
          <h2 className="text-base font-semibold text-primary">{t('home.ctaTitle')}</h2>
        </div>
        <p className="text-sm text-gray-700 mb-3">{t('home.ctaSubtitle')}</p>
        <Link to={`/${lang}/quote`} className="btn-primary inline-block text-sm">
          {t('banner.fallbackCta')}
        </Link>
      </section>
    </motion.div>
  );
};

export default About;
