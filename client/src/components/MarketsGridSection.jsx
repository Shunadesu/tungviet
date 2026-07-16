import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  GiPaintRoller,
  GiChemicalDrop,
  GiRoad,
  GiShop,
  GiCardboardBox,
  GiChemicalTank,
  GiTestTubes,
} from 'react-icons/gi';
import { FiArrowRight } from 'react-icons/fi';
import { SUPPORTED_LOCALES } from '../i18n';

const MARKETS = [
  {
    key: 'paint',
    Icon: GiPaintRoller,
    title_vi: 'Son & Chat phu',
    title_en: 'Paints & Coatings',
    desc_vi: 'Nhua thong tinh chat cho son, vecni va chat phu cong nghiep.',
    desc_en: 'Refined rosin for paints, varnishes and industrial coatings.',
    gradient: 'from-sky-500 to-blue-600',
  },
  {
    key: 'adhesive',
    Icon: GiChemicalDrop,
    title_vi: 'Keo dan & Hot melt',
    title_en: 'Adhesives & Hot melt',
    desc_vi: 'Nguyen lieu tackifier cho keo dan nhay cam va hot melt.',
    desc_en: 'Tackifier raw material for pressure-sensitive and hot melt adhesives.',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    key: 'road',
    Icon: GiRoad,
    title_vi: 'Duong bo & Asphalt',
    title_en: 'Roads & Asphalt',
    desc_vi: 'Chat dinh dac biet cho mat duong va be tong nhua.',
    desc_en: 'Special binders for road surfaces and asphalt concrete.',
    gradient: 'from-cyan-500 to-sky-600',
  },
  {
    key: 'packaging',
    Icon: GiCardboardBox,
    title_vi: 'Bao bi & Giay',
    title_en: 'Packaging & Paper',
    desc_vi: 'Dung dich cho nganh bao bi va giay, tang do ben va chong am.',
    desc_en: 'Solutions for packaging and paper industry, enhancing durability and moisture resistance.',
    gradient: 'from-teal-500 to-cyan-600',
  },
  {
    key: 'rubber',
    Icon: GiChemicalTank,
    title_vi: 'Cao su & Polymer',
    title_en: 'Rubber & Polymer',
    desc_vi: 'Chat hoa dong trong san xuat cao su ky thuat va polymer.',
    desc_en: 'Active ingredient for technical rubber and polymer manufacturing.',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    key: 'pharma',
    Icon: GiTestTubes,
    title_vi: 'My pham & Duoc pham',
    title_en: 'Cosmetics & Pharma',
    desc_vi: 'Nguyen lieu tinh kiet dat chuan FDA va REACH.',
    desc_en: 'Purified ingredients meeting FDA and REACH standards.',
    gradient: 'from-emerald-500 to-green-600',
  },
];

const MarketsGridSection = () => {
  const { t, i18n } = useTranslation();
  const { lang: urlLang } = useParams();
  const lang = SUPPORTED_LOCALES.includes(urlLang) ? urlLang : 'vi';
  const isEN = i18n.language === 'en';

  return (
    <section className="bg-white py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-3 py-1 text-xs font-medium uppercase tracking-wider text-emerald-700 bg-emerald-100 rounded-full mb-3">
            {isEN ? 'Markets' : 'Thi truong'}
          </span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900">
            {t('marketsGrid.title')}
          </h2>
          <p className="mt-3 text-sm md:text-base text-slate-600 max-w-2xl mx-auto">
            {t('marketsGrid.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
          {MARKETS.map(({ key, Icon, title_vi, title_en, desc_vi, desc_en, gradient }, index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06, duration: 0.4 }}
              whileHover={{ y: -4 }}
              className="group relative"
            >
              <Link
                to={`/${lang}/products?market=${key}`}
                className="block h-full"
              >
                <div className="relative h-full bg-white rounded-2xl p-5 border border-slate-100 shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  <div
                    className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-500`}
                  />

                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} text-white text-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon />
                  </div>

                  <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-1.5">
                    {isEN ? title_en : title_vi}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                    {isEN ? desc_en : desc_vi}
                  </p>

                  <div className="mt-3 flex items-center gap-1 text-xs font-medium text-emerald-600 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-300">
                    <span>{isEN ? 'Explore' : 'Kham pha'}</span>
                    <FiArrowRight size={12} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MarketsGridSection;
