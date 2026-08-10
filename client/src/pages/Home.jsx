import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import HeroSlider from '../components/HeroSlider';
import WhyUsSection from '../components/WhyUsSection';
import ProcessSection from '../components/ProcessSection';
import FeaturedProducts from '../components/FeaturedProducts';
import MarketsGridSection from '../components/MarketsGridSection';
import CertificatesSection from '../components/CertificatesSection';
import BlogTeaserSection from '../components/BlogTeaserSection';
import TestimonialsSection from '../components/TestimonialsSection';
import PartnersSection from '../components/PartnersSection';
import SEO from '../components/SEO';
import { FiBox } from 'react-icons/fi';
import { SUPPORTED_LOCALES } from '../i18n';

const Home = () => {
  const { t, i18n } = useTranslation();
  const lang = SUPPORTED_LOCALES.includes(i18n.language) ? i18n.language : 'vi';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white"
    >
      <SEO
        title={t('seo.home.title')}
        description={t('seo.home.description')}
        keywords={t('seo.home.keywords')}
        url={`/${lang}`}
      />
      <HeroSlider />
      <WhyUsSection />
      <ProcessSection />
      <FeaturedProducts
        eyebrow={t('home.featuredEyebrow')}
        icon={FiBox}
        limit={8}
      />
      <MarketsGridSection />
      <CertificatesSection />
      <BlogTeaserSection />
      <TestimonialsSection />
      <PartnersSection />
    </motion.div>
  );
};

export default Home;