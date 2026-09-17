import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import HomeAggregator from '../components/HomeAggregator';
import SEO from '../components/SEO';
import { SUPPORTED_LOCALES } from '../i18n';
import { useSiteConfig } from '../context/SiteConfigContext';
import {
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
} from '../utils/jsonLd';

const Home = () => {
  const { t, i18n } = useTranslation();
  const lang = SUPPORTED_LOCALES.includes(i18n.language) ? i18n.language : 'vi';
  const siteConfig = useSiteConfig();

  const homepageJsonLd = [
    buildOrganizationJsonLd(siteConfig),
    buildWebSiteJsonLd(),
  ].filter(Boolean);

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
        type="website"
        jsonLd={homepageJsonLd}
      />
      <HomeAggregator />
    </motion.div>
  );
};

export default Home;
