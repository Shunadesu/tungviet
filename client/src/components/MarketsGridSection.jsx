import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  GiPaintRoller,
  GiChemicalDrop,
  GiRoad,
  GiCardboardBox,
  GiChemicalTank,
  GiTestTubes,
} from 'react-icons/gi';
import { FiArrowRight, FiArrowUpRight } from 'react-icons/fi';
import { SUPPORTED_LOCALES } from '../i18n';
import SectionHeader from './SectionHeader';

const MARKETS = [
  {
    key: 'paint',
    Icon: GiPaintRoller,
    title_vi: 'Sơn & Chất phủ',
    title_en: 'Paints & Coatings',
    desc_vi: 'Nhựa thông tinh chất cho sơn, vecni và chất phủ công nghiệp.',
    desc_en: 'Refined rosin for paints, varnishes and industrial coatings.',
    gradient: 'from-sky-500 to-blue-600',
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
  },
  {
    key: 'adhesive',
    Icon: GiChemicalDrop,
    title_vi: 'Keo dán & Hot melt',
    title_en: 'Adhesives & Hot melt',
    desc_vi: 'Nguyên liệu tackifier cho keo dán nhạy cảm và hot melt.',
    desc_en: 'Tackifier raw material for pressure-sensitive and hot melt adhesives.',
    gradient: 'from-emerald-500 to-teal-600',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    key: 'road',
    Icon: GiRoad,
    title_vi: 'Đường bộ & Asphalt',
    title_en: 'Roads & Asphalt',
    desc_vi: 'Chất dính đặc biệt cho mặt đường và bê tông nhựa.',
    desc_en: 'Special binders for road surfaces and asphalt concrete.',
    gradient: 'from-cyan-500 to-sky-600',
    iconBg: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
  },
  {
    key: 'packaging',
    Icon: GiCardboardBox,
    title_vi: 'Bao bì & Giấy',
    title_en: 'Packaging & Paper',
    desc_vi: 'Dung dịch cho ngành bao bì và giấy, tăng độ bền và chống ẩm.',
    desc_en: 'Solutions for packaging and paper industry, enhancing durability and moisture resistance.',
    gradient: 'from-teal-500 to-cyan-600',
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
  },
  {
    key: 'rubber',
    Icon: GiChemicalTank,
    title_vi: 'Cao su & Polymer',
    title_en: 'Rubber & Polymer',
    desc_vi: 'Chất hoạt động trong sản xuất cao su kỹ thuật và polymer.',
    desc_en: 'Active ingredient for technical rubber and polymer manufacturing.',
    gradient: 'from-blue-500 to-indigo-600',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    key: 'pharma',
    Icon: GiTestTubes,
    title_vi: 'Mỹ phẩm & Dược phẩm',
    title_en: 'Cosmetics & Pharma',
    desc_vi: 'Nguyên liệu tinh khiết đạt chuẩn FDA và REACH.',
    desc_en: 'Purified ingredients meeting FDA and REACH standards.',
    gradient: 'from-emerald-500 to-green-600',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-700',
  },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

const MarketsGridSection = () => {
  const { t, i18n } = useTranslation();
  const { lang: urlLang } = useParams();
  const lang = SUPPORTED_LOCALES.includes(urlLang) ? urlLang : 'vi';
  const isEN = i18n.language === 'en';

  return (
    <section className="bg-slate-50/60 py-16 md:py-20 lg:py-24">
      <div className="container-page">
        <SectionHeader
          eyebrow={isEN ? 'Markets' : 'Thị trường'}
          title={t('marketsGrid.title')}
          subtitle={t('marketsGrid.subtitle')}
          align="center"
          className="mb-12"
        />

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          {MARKETS.map(({ key, Icon, title_vi, title_en, desc_vi, desc_en, gradient, iconBg, iconColor }) => (
            <motion.div key={key} variants={cardVariants}>
              <Link
                to={`/${lang}/products?market=${key}`}
                className="group relative block h-full bg-white rounded-2xl p-6 md:p-7 border border-gray-100 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <div
                  aria-hidden="true"
                  className={`absolute -top-24 -right-24 w-56 h-56 rounded-full bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-[0.10] transition-opacity duration-500 pointer-events-none blur-2xl`}
                />

                <div className="relative">
                  <div
                    className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${iconBg} ${iconColor} text-2xl mb-5 ring-1 ring-inset ring-current/10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-[6deg]`}
                  >
                    <Icon />
                  </div>

                  <h3 className="text-base md:text-lg font-bold text-slate-900 mb-2 tracking-tight">
                    {isEN ? title_en : title_vi}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                    {isEN ? desc_en : desc_vi}
                  </p>

                  <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <span>{isEN ? 'Explore' : 'Khám phá'}</span>
                    <FiArrowRight
                      size={12}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </div>
                </div>

                <FiArrowUpRight
                  size={16}
                  className="absolute top-5 right-5 text-slate-300 group-hover:text-primary group-hover:rotate-12 transition-all duration-300"
                />
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-10 text-center"
        >
          <Link
            to={`/${lang}/markets`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-700 transition-colors group"
          >
            {isEN ? 'View all markets' : 'Xem tất cả thị trường'}
            <FiArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default MarketsGridSection;