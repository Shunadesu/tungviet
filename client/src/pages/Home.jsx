import { useTranslation } from 'react-i18next';
import HeroSlider from '../components/HeroSlider';
import WhyUsSection from '../components/WhyUsSection';
import StatsSection from '../components/StatsSection';
import TestimonialsSection from '../components/TestimonialsSection';
import MarketsGridSection from '../components/MarketsGridSection';
import CertificatesSection from '../components/CertificatesSection';
import FeaturedProducts from '../components/FeaturedProducts';
import PartnersSection from '../components/PartnersSection';
import SEO from '../components/SEO';
import { SUPPORTED_LOCALES } from '../i18n';

const Home = () => {
  const { t, i18n } = useTranslation();
  const lang = SUPPORTED_LOCALES.includes(i18n.language) ? i18n.language : 'vi';

  return (
    <>
      <SEO
        title={t('seo.home.title')}
        description={t('seo.home.description')}
        keywords={t('seo.home.keywords')}
        url={`/${lang}`}
      />
      <HeroSlider />
      <WhyUsSection />
      <StatsSection />
      <TestimonialsSection />
      <MarketsGridSection />
      <CertificatesSection />
      <FeaturedProducts />
      <PartnersSection />
    </>
  );
};

export default Home;
