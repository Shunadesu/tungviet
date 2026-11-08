import { useTranslation } from 'react-i18next';
import HeroSlider from './HeroSlider';
import MarketShowcaseSection from './MarketShowcaseSection';
import EcovadisAwardSection from './EcovadisAwardSection';
import CertificatesSection from './CertificatesSection';
import { useSiteConfig } from '../context/SiteConfigContext';
import { SUPPORTED_LOCALES } from '../i18n';

const HomeAggregator = () => {
  const { i18n } = useTranslation();
  const { ecovadis } = useSiteConfig();
  const lang = SUPPORTED_LOCALES.includes(i18n.language) ? i18n.language : 'vi';

  return (
    <div className="bg-white">
      <HeroSlider />
      <MarketShowcaseSection />
      <EcovadisAwardSection content={ecovadis} lang={lang} />
      <CertificatesSection />
    </div>
  );
};

export default HomeAggregator;
