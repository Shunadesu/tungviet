import { motion } from 'framer-motion';
import { FiAward, FiShield, FiStar, FiTrendingUp, FiGlobe, FiHeart, FiCheckCircle, FiPhone, FiMail, FiMapPin, FiFileText, FiGlobe as FiWeb } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { SUPPORTED_LOCALES } from '../i18n';
import { aboutCompany } from '../data/aboutCompany';

const ICON_MAP = {
  FiAward,
  FiShield,
  FiStar,
  FiTrendingUp,
  FiGlobe,
  FiHeart,
  FiCheckCircle,
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

// ── Section 1: Hero ──────────────────────────────────────────────────────────
function AboutHero({ hero }) {
  return (
    <section className="relative w-full h-[70vh] overflow-hidden bg-gray-900">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${hero.image})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      <div className="relative z-10 h-full flex flex-col items-center justify-end pb-20 px-6 text-center text-white">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-5xl font-bold max-w-4xl leading-tight drop-shadow-lg mb-3"
        >
          {hero.title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-base md:text-xl max-w-2xl text-white/90"
        >
          {hero.subtitle}
        </motion.p>
      </div>
    </section>
  );
}

// ── Section 2: Introduction & History ────────────────────────────────────────
function IntroSection({ content }) {
  return (
    <section className="max-w-5xl mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-8">
        <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="space-y-3">
          {content.intro.map((paragraph, idx) => (
            <p key={idx} className="text-sm text-gray-600 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </motion.div>

        <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }}>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{content.historyTitle}</h2>
          <ol className="relative border-l-2 border-primary/20 ml-2 space-y-5">
            {content.history.map((item) => (
              <li key={item.year} className="pl-5">
                <span className="absolute -left-[7px] mt-1.5 w-3 h-3 rounded-full bg-primary" />
                <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-1">
                  {item.year}
                </span>
                <p className="text-sm text-gray-600 leading-relaxed">{item.text}</p>
              </li>
            ))}
          </ol>
        </motion.div>
      </div>
    </section>
  );
}

// ── Section 3: Fast Facts ────────────────────────────────────────────────────
function FactsSection({ title, facts, numberLocale }) {
  return (
    <section className="bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <motion.h2
          {...fadeUp}
          className="text-lg font-semibold text-gray-800 text-center mb-8"
        >
          {title}
        </motion.h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {facts.map((fact, idx) => (
            <motion.div
              key={fact.label}
              {...fadeUp}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="bg-white rounded-xl p-5 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="text-3xl font-bold text-primary mb-1">
                {fact.isYear ? fact.value : fact.value.toLocaleString(numberLocale)}
                {fact.suffix && <span className="text-lg text-primary/70 ml-0.5">{fact.suffix}</span>}
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
function ValuesSection({ title, intro, values }) {
  return (
    <section className="max-w-5xl mx-auto px-4 py-12">
      <motion.div {...fadeUp} className="text-center mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
        <p className="text-sm text-gray-500">{intro}</p>
      </motion.div>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {values.map((value, idx) => {
          const IconComponent = ICON_MAP[value.icon] || FiAward;
          return (
            <motion.div
              key={value.title}
              {...fadeUp}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              whileHover={{ y: -4, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
              className="bg-white rounded-xl p-5 border border-gray-100 hover:border-primary/20 transition-all cursor-default"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-3">
                <IconComponent size={20} />
              </div>
              <h3 className="text-sm font-semibold text-gray-800 mb-1">{value.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{value.description}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

// ── Section 5: Contact (bento grid) ──────────────────────────────────────────
// Bố cục trên màn hình md trở lên (4 cột):
//   [Địa chỉ 2x2]      [Hotline 1] [Hotline 2]
//   [Địa chỉ 2x2]      [Mã số thuế] [Website]
//   [Điện thoại & Fax - full width]
// Trên mobile: một cột, xếp theo thứ tự trên.
function BentoCard({ dark = false, icon, label, className = '', children }) {
  return (
    <div
      className={`rounded-2xl p-5 flex flex-col gap-3 transition-shadow hover:shadow-md ${
        dark
          ? 'bg-primary text-white shadow-sm'
          : 'bg-white border border-gray-100 shadow-sm'
      } ${className}`}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
            dark ? 'bg-white/15 text-white' : 'bg-primary/10 text-primary'
          }`}
        >
          {icon}
        </span>
        <p className={`text-xs font-semibold uppercase tracking-wide ${dark ? 'text-white/80' : 'text-gray-500'}`}>
          {label}
        </p>
      </div>
      <div className={`text-sm break-words ${dark ? 'text-white' : 'text-gray-800'}`}>{children}</div>
    </div>
  );
}

const linkClass = (dark) =>
  `break-all hover:underline ${dark ? 'text-white' : 'text-gray-800 hover:text-primary'}`;

function ContactSection({ content }) {
  const labels = content.contactLabels;
  const telHref = (phone) => `tel:${phone.replace(/[\s.]/g, '')}`;

  return (
    <section className="max-w-5xl mx-auto px-4 py-12">
      <motion.div {...fadeUp} className="text-center mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">{content.contactTitle}</h2>
        <p className="text-sm text-gray-500">{content.contactSubtitle}</p>
      </motion.div>

      <motion.div
        {...fadeUp}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
      >
        {/* Địa chỉ - ô lớn, nổi bật */}
        <BentoCard
          dark
          icon={<FiMapPin size={18} />}
          label={labels.address}
          className="sm:col-span-2 md:col-span-2 md:row-span-2 justify-between"
        >
          <p className="text-base leading-relaxed">{content.address}</p>
        </BentoCard>

        {/* Hotline 1 */}
        <BentoCard icon={<FiPhone size={18} />} label={`${labels.hotline} 1`}>
          <a href={telHref(content.hotlines[0].phone)} className={`text-base font-semibold ${linkClass(false)}`}>
            {content.hotlines[0].phone}
          </a>
          <a href={`mailto:${content.hotlines[0].email}`} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary break-all">
            <FiMail size={12} />
            {content.hotlines[0].email}
          </a>
        </BentoCard>

        {/* Hotline 2 */}
        <BentoCard icon={<FiPhone size={18} />} label={`${labels.hotline} 2`}>
          <a href={telHref(content.hotlines[1].phone)} className={`text-base font-semibold ${linkClass(false)}`}>
            {content.hotlines[1].phone}
          </a>
          <a href={`mailto:${content.hotlines[1].email}`} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary break-all">
            <FiMail size={12} />
            {content.hotlines[1].email}
          </a>
        </BentoCard>

        {/* Mã số thuế */}
        <BentoCard icon={<FiFileText size={18} />} label={labels.taxCode}>
          <p className="text-base font-semibold tracking-wider">{content.taxCode}</p>
        </BentoCard>

        {/* Website */}
        <BentoCard icon={<FiWeb size={18} />} label={labels.website}>
          <a
            href={`https://${content.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-base font-semibold ${linkClass(false)}`}
          >
            {content.website}
          </a>
        </BentoCard>

        {/* Điện thoại & Fax - full width */}
        <BentoCard
          icon={<FiPhone size={18} />}
          label={`${labels.phone} / ${labels.fax}`}
          className="sm:col-span-2 md:col-span-4"
        >
          <div className="flex flex-wrap gap-x-10 gap-y-2">
            <a href={telHref(content.phone)} className={`text-base font-semibold ${linkClass(false)}`}>
              <span className="text-xs font-normal text-gray-500 mr-2">{labels.phone}</span>
              {content.phone}
            </a>
            <p className="text-base font-semibold">
              <span className="text-xs font-normal text-gray-500 mr-2">{labels.fax}</span>
              {content.fax}
            </p>
          </div>
        </BentoCard>
      </motion.div>
    </section>
  );
}

// ── Main About Page ──────────────────────────────────────────────────────────
const About = () => {
  const { i18n } = useTranslation();
  const lang = SUPPORTED_LOCALES.includes(i18n.language) ? i18n.language : 'vi';
  const content = aboutCompany[lang] || aboutCompany.vi;
  const numberLocale = lang === 'en' ? 'en-US' : 'vi-VN';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-16"
    >
      <SEO
        title={content.seoTitle}
        description={content.seoDescription}
        url={`/${lang}/about`}
      />

      <AboutHero hero={content.hero} />
      <IntroSection content={content} />
      <FactsSection title={content.factsTitle} facts={content.facts} numberLocale={numberLocale} />
      <ValuesSection title={content.valuesTitle} intro={content.valuesIntro} values={content.values} />
      <ContactSection content={content} />
    </motion.div>
  );
};

export default About;
