import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import { SUPPORTED_LOCALES } from '../i18n';
import useHomeSection from '../hooks/useHomeSection';

/**
 * Đọc field đã localize (string) hoặc chưa localize ({ vi, en }).
 */
const readField = (value, lang) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (lang === 'en') return value.en || value.vi || '';
  return value.vi || value.en || '';
};

/**
 * EcovadisAwardSection - band giải thưởng EcoVadis trên trang chủ.
 *
 * Section này KHÔNG dùng nội dung hardcode. Toàn bộ copy, ảnh huy hiệu và liên
 * kết đến từ `content` do API/Admin cung cấp. Nếu Admin chưa cấu hình gì thì
 * section không render (không hiển thị nội dung bịa).
 */
const EcovadisAwardSection = ({ content, lang: langProp }) => {
  const lang = SUPPORTED_LOCALES.includes(langProp) ? langProp : 'vi';
  const section = useHomeSection('ecovadis');

  const eyebrow = readField(content?.eyebrow, lang);
  const title = readField(content?.title, lang);
  const subtitle = readField(content?.subtitle, lang);
  const imageUrl = content?.imageUrl || '';
  const link1Label = readField(content?.link1Label, lang);
  const link1Href = content?.link1Href || '';
  const link2Label = readField(content?.link2Label, lang);
  const link2Href = content?.link2Href || '';
  const badgeLabel = content?.badgeLabel || '';

  // Không có nội dung nào từ API → không render gì.
  if (!section.enabled) return null;
  if (content?.active === false) return null;
  if (!title && !subtitle && !imageUrl && !link1Label && !link2Label) return null;

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
            {eyebrow && (
              <span className="inline-block text-white/70 text-xs font-bold tracking-[0.2em] uppercase mb-4">
                {eyebrow}
              </span>
            )}
            {title && (
              <h2 className="text-white font-bold text-2xl md:text-3xl lg:text-4xl leading-snug mb-5">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-white/75 text-base leading-relaxed mb-8 max-w-lg">
                {subtitle}
              </p>
            )}

            {(link1Label || link2Label) && (
              <div className="flex flex-wrap gap-3">
                {link1Label && link1Href && (
                  <a
                    href={link1Href}
                    className="inline-flex items-center gap-2 border border-white/60 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-white/10 hover:border-white/80 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  >
                    {link1Label}
                    <FiArrowRight size={14} />
                  </a>
                )}
                {link2Label && link2Href && (
                  <a
                    href={link2Href}
                    className="inline-flex items-center gap-2 border border-white/60 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-white/10 hover:border-white/80 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  >
                    {link2Label}
                    <FiArrowRight size={14} />
                  </a>
                )}
              </div>
            )}
          </motion.div>

          {/* Right: Award Badge */}
          {imageUrl && (
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
                {/* Badge circle — chỉ hiển thị huy hiệu khi Admin đã cấu hình ảnh */}
                <img
                  src={imageUrl}
                  alt={badgeLabel}
                  className="absolute inset-0 w-full h-full rounded-full object-cover shadow-2xl"
                />
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
          )}

        </div>
      </div>
    </section>
  );
};

export default EcovadisAwardSection;
