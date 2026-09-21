import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import { getLocalizedField } from '../utils/i18nField';
import { SUPPORTED_LOCALES } from '../i18n';

const EcovadisAwardSection = ({ content, lang }) => {
  const isEN = lang === 'en';
  const eyebrow = getLocalizedField(content, lang, 'eyebrow', 'eyebrowEn') || (isEN ? 'SUSTAINABLE SOLUTIONS. ENDLESS INNOVATION.™' : 'GIẢI PHÁP BỀN VỮNG. ĐỔI MỚI KHÔNG NGỪNG.™');
  const title = getLocalizedField(content, lang, 'title', 'titleEn') || (isEN
    ? 'We Are Committed to Responsible Business Practices'
    : 'Cam kết Thực hành Kinh doanh Có Trách nhiệm');
  const subtitle = getLocalizedField(content, lang, 'subtitle', 'subtitleEn') || (isEN
    ? 'Our sustainability journey is reflected in every decision we make — from product development to community impact.'
    : 'Hành trình bền vững của chúng tôi được phản ánh trong mọi quyết định — từ phát triển sản phẩm đến tác động cộng đồng.');
  const imageUrl = content?.imageUrl || '';
  const link1Label = getLocalizedField(content, lang, 'link1Label', 'link1LabelEn') || (isEN ? 'Learn More about EcoVadis' : 'Tìm hiểu thêm về EcoVadis');
  const link1Href = content?.link1Href || `/${lang}/innovation/credentials/#ecovadis`;
  const link2Label = getLocalizedField(content, lang, 'link2Label', 'link2LabelEn') || (isEN ? 'Read the Press Release' : 'Đọc Thông cáo Báo chí');
  const link2Href = content?.link2Href || `/${lang}/news`;
  const badgeLabel = content?.badgeLabel || (isEN ? 'Ecovadis' : 'Ecovadis');

  return (
    <section className="relative overflow-hidden">
      {/* Background: green gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-700 pointer-events-none" />
      {/* Decorative plant SVG — top right */}
      <div className="absolute top-0 right-0 w-64 md:w-96 opacity-10 pointer-events-none" aria-hidden="true">
        <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path d="M380 20C340 80 260 100 200 160C140 220 120 320 60 360" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <path d="M380 80C330 130 270 140 220 180C170 220 160 300 120 340" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
          <circle cx="380" cy="20" r="16" fill="white" opacity="0.3"/>
          <circle cx="200" cy="160" r="10" fill="white" opacity="0.25"/>
          <circle cx="60" cy="360" r="14" fill="white" opacity="0.2"/>
          <path d="M200 160 Q220 120 280 100" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
          <path d="M200 160 Q160 200 120 220" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.3"/>
        </svg>
      </div>
      {/* Decorative plant SVG — bottom left */}
      <div className="absolute bottom-0 left-0 w-64 md:w-96 opacity-10 pointer-events-none rotate-180" aria-hidden="true">
        <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path d="M380 20C340 80 260 100 200 160C140 220 120 320 60 360" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <path d="M380 80C330 130 270 140 220 180C170 220 160 300 120 340" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
        </svg>
      </div>

      <div className="relative container-page py-16 md:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left: Text & Buttons */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          >
            <span className="inline-block text-white/70 text-xs font-bold tracking-[0.2em] uppercase mb-4">
              {eyebrow}
            </span>
            <h2 className="text-white font-bold text-2xl md:text-3xl lg:text-4xl leading-snug mb-5">
              {title}
            </h2>
            {subtitle && (
              <p className="text-white/75 text-base leading-relaxed mb-8 max-w-lg">
                {subtitle}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <a
                href={link1Href}
                className="inline-flex items-center gap-2 border border-white/60 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-white/10 hover:border-white/80 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              >
                {link1Label}
                <FiArrowRight size={14} />
              </a>
              <a
                href={link2Href}
                className="inline-flex items-center gap-2 border border-white/60 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-white/10 hover:border-white/80 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              >
                {link2Label}
                <FiArrowRight size={14} />
              </a>
            </div>
          </motion.div>

          {/* Right: Award Badge */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: 'easeOut', delay: 0.1 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative w-56 h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 flex-shrink-0">
              {/* Outer glow ring */}
              <div className="absolute inset-0 rounded-full bg-white/10 animate-pulse" />
              {/* Inner ring */}
              <div className="absolute inset-3 rounded-full border-2 border-white/20" />
              {/* Badge circle */}
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={badgeLabel}
                  className="absolute inset-0 w-full h-full rounded-full object-cover shadow-2xl"
                />
              ) : (
                <div className="absolute inset-0 rounded-full bg-white/90 flex flex-col items-center justify-center shadow-2xl text-center p-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-700 flex items-center justify-center mb-2">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                  </div>
                  <span className="text-primary font-bold text-sm leading-tight">{badgeLabel}</span>
                  <span className="text-primary-600 text-xs font-semibold mt-0.5">Platinum</span>
                </div>
              )}
              {/* Decorative dots around badge */}
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-white/50"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${i * 45}deg) translateY(-${50 + (i % 2) * 12}%) translateX(-50%)`,
                  }}
                />
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default EcovadisAwardSection;
