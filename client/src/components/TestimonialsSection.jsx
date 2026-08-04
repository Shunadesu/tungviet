import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { FiStar, FiChevronLeft, FiChevronRight, FiMessageCircle } from 'react-icons/fi';
import SectionHeader from './SectionHeader';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const TESTIMONIALS = [
  {
    name: 'Nguyen Van Minh',
    role: 'CEO',
    company: 'Minh Phat Paint Co., Ltd',
    country: 'Vietnam',
    rating: 5,
    quote_vi:
      'Tung Viet da dong hanh cung chung toi hon 8 nam. Chat luong on dinh, gia ca canh tranh va doi ngu ky su ho tro tan tinh la dieu chung toi danh gia cao nhat.',
    quote_en:
      'Tung Viet has been our partner for over 8 years. Stable quality, competitive pricing, and a dedicated engineering team are what we value most.',
    initials: 'NM',
    accent: 'from-primary to-primary-700',
  },
  {
    name: 'Sarah Johnson',
    role: 'Procurement Manager',
    company: 'AdhesiveTech USA',
    country: 'United States',
    rating: 5,
    quote_vi:
      'Tung Viet la nha cung cap nhua thong dang tin cay nhat cua chung toi tai Dong Nam A. Logistics luon dung hen va san pham dat chuan REACH.',
    quote_en:
      'Tung Viet is our most reliable rosin supplier in Southeast Asia. Logistics are always on time and products meet REACH standards.',
    initials: 'SJ',
    accent: 'from-emerald-500 to-teal-500',
  },
  {
    name: 'Tanaka Hiroshi',
    role: 'Director',
    company: 'PackPro Japan',
    country: 'Japan',
    rating: 5,
    quote_vi:
      'Moi lan dat hang deu den dung lich voi chat luong dong nhat. Chung toi khong can kiem tra lai - do la dieu chung toi yeu thich o Tung Viet.',
    quote_en:
      'Every shipment arrives on schedule with consistent quality. We never need to re-inspect — that is what we love about Tung Viet.',
    initials: 'TH',
    accent: 'from-blue-500 to-indigo-500',
  },
  {
    name: 'Kim Soo-jin',
    role: 'Technical Director',
    company: 'K-BUILD Corporation',
    country: 'South Korea',
    rating: 5,
    quote_vi:
      'San pham nhua thong cua Tung Viet da giup chung toi dat duoc cac tieu chuan chat luong khat khe cho du an duong bo. Tu van ky thuat xuat sac.',
    quote_en:
      "Tung Viet's rosin products helped us meet the strict quality requirements for our road construction projects. Outstanding technical support.",
    initials: 'KS',
    accent: 'from-teal-500 to-sky-500',
  },
];

const Stars = ({ count }) => (
  <div className="flex gap-0.5 text-amber-400">
    {Array.from({ length: count }).map((_, i) => (
      <FiStar key={i} fill="currentColor" size={14} />
    ))}
  </div>
);

const TestimonialsSection = () => {
  const { t, i18n } = useTranslation();
  const isEN = i18n.language === 'en';

  return (
    <section className="relative bg-gradient-to-b from-white via-primary-50/20 to-white py-16 md:py-20 overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute -top-20 -left-20 w-80 h-80 bg-primary-100/40 rounded-full blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-20 -right-20 w-80 h-80 bg-emerald-100/40 rounded-full blur-3xl"
      />

      <div className="relative max-w-6xl mx-auto px-4">
        <SectionHeader
          eyebrow={t('testimonials.eyebrow', 'Testimonials')}
          title={t('testimonials.title')}
          subtitle={t('testimonials.subtitle')}
          align="center"
          className="mb-12"
        />

        <div className="relative testimonial-swiper px-2">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            navigation={{
              prevEl: '.testimonial-prev',
              nextEl: '.testimonial-next',
            }}
            pagination={{ clickable: true }}
            autoplay={{ delay: 5500, disableOnInteraction: false }}
            loop
            spaceBetween={24}
            breakpoints={{
              0: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
          >
            {TESTIMONIALS.map((item, index) => (
              <SwiperSlide key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.45, delay: index * 0.04 }}
                  whileHover={{ y: -4 }}
                  className="relative h-full bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover border border-slate-100 transition-all duration-300 flex flex-col overflow-hidden"
                >
                  <div
                    aria-hidden="true"
                    className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-primary-50 to-emerald-50 opacity-70 blur-xl"
                  />

                  <div className="relative flex items-start justify-between mb-4">
                    <Stars count={item.rating} />
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-primary-50 text-primary">
                      <FiMessageCircle size={18} />
                    </span>
                  </div>

                  <p className="relative text-sm text-slate-700 leading-relaxed flex-1">
                    {isEN ? item.quote_en : item.quote_vi}
                  </p>

                  <div className="relative mt-6 pt-5 border-t border-slate-100 flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-full bg-gradient-to-br ${item.accent} text-white font-bold flex items-center justify-center text-sm flex-shrink-0 transition-transform duration-300 hover:scale-110`}
                    >
                      {item.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{item.name}</p>
                      <p className="text-xs text-slate-500 truncate">
                        {item.role} · {item.company}
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
                        {item.country}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>

          <button
            type="button"
            aria-label="Previous"
            className="testimonial-prev absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-10 h-10 rounded-full bg-white shadow-lg border border-slate-200 text-slate-700 hover:bg-primary hover:text-white hover:border-primary transition-colors hidden md:flex items-center justify-center"
          >
            <FiChevronLeft />
          </button>
          <button
            type="button"
            aria-label="Next"
            className="testimonial-next absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-10 h-10 rounded-full bg-white shadow-lg border border-slate-200 text-slate-700 hover:bg-primary hover:text-white hover:border-primary transition-colors hidden md:flex items-center justify-center"
          >
            <FiChevronRight />
          </button>
        </div>
      </div>

      <style>{`
        .testimonial-swiper .swiper-pagination-bullet {
          background: #cbd5e1;
          opacity: 1;
        }
        .testimonial-swiper .swiper-pagination-bullet-active {
          background: linear-gradient(90deg, var(--color-primary, #0ea5e9), #10b981);
          width: 24px;
          border-radius: 6px;
        }
      `}</style>
    </section>
  );
};

export default TestimonialsSection;