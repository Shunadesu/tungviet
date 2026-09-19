import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import HeroSlider from './HeroSlider';
import { SUPPORTED_LOCALES } from '../i18n';

let lang = 'vi';

const QuoteCTA = ({ quote }) => {
  if (!quote || !quote.title) return null;
  return (
    <section
      className="py-16 bg-gradient-to-r from-primary to-primary/80 text-white"
      style={
        quote.backgroundUrl
          ? {
              backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${quote.backgroundUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : {}
      }
    >
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">{quote.title}</h2>
        {quote.subtitle && (
          <p className="text-sm md:text-base opacity-90 mb-6">{quote.subtitle}</p>
        )}
        <Link
          to={`/${lang}/quote-bag`}
          className="inline-flex items-center gap-2 bg-white text-primary font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {lang === 'en' ? 'Request a quote' : 'Yêu cầu báo giá'}
          <FiArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
};

const HomeAggregator = () => {
  const { i18n } = useTranslation();
  lang = SUPPORTED_LOCALES.includes(i18n.language) ? i18n.language : 'vi';

  return (
    <div className="bg-white">
      <HeroSlider />
      
    </div>
  );
};

export default HomeAggregator;
