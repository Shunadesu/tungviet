import { Link, useParams } from 'react-router-dom';
import { FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import { GiChemicalDrop, GiFactory } from 'react-icons/gi';
import { useTranslation } from 'react-i18next';
import { useSiteConfig } from '../context/SiteConfigContext';
import { SUPPORTED_LOCALES } from '../i18n';

const Footer = () => {
  const { t } = useTranslation();
  const { footer, logoUrl: siteLogo } = useSiteConfig();
  const { about, phone, email, address, copyright, logoUrl: footerLogo, mapEmbed } = footer;
  const { lang: urlLang } = useParams();
  const lang = SUPPORTED_LOCALES.includes(urlLang) ? urlLang : 'vi';
  const prefix = `/${lang}`;

  const displayLogo = footerLogo || siteLogo;

  return (
    <footer className="bg-primary-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-2 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <div className="mb-3">
              {displayLogo ? (
                <img src={displayLogo} alt=" Tungviet" className="h-10 w-auto max-w-[180px]" />
              ) : (
                <div className="flex items-center gap-2">
                  <GiFactory size={24} />
                  <span className="text-base font-semibold"> Tungviet</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">{about}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <GiChemicalDrop size={16} />
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-1">
              <li><Link to={`${prefix}`} className="text-xs text-gray-300 hover:text-white transition-colors">{t('nav.home')}</Link></li>
              <li><Link to={`${prefix}/products`} className="text-xs text-gray-300 hover:text-white transition-colors">{t('nav.products')}</Link></li>
              <li><Link to={`${prefix}/products`} className="text-xs text-gray-300 hover:text-white transition-colors">{t('nav.products')}</Link></li>
              <li><Link to={`${prefix}/about`} className="text-xs text-gray-300 hover:text-white transition-colors">{t('nav.about')}</Link></li>
              <li><Link to={`${prefix}/contact`} className="text-xs text-gray-300 hover:text-white transition-colors">{t('nav.contact')}</Link></li>
              <li><Link to={`${prefix}/quote`} className="text-xs text-gray-300 hover:text-white transition-colors">{t('nav.quote')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">{t('footer.categories')}</h3>
            <ul className="space-y-1">
              <li><Link to={`${prefix}/products`} className="text-xs text-gray-300 hover:text-white transition-colors">{t('footer.allProducts')}</Link></li>
              <li><Link to={`${prefix}/products`} className="text-xs text-gray-300 hover:text-white transition-colors">{t('footer.applications')}</Link></li>
              <li><Link to={`${prefix}/quote`} className="text-xs text-gray-300 hover:text-white transition-colors">{t('nav.quote')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">{t('footer.contactInfo')}</h3>
            <ul className="space-y-2">
              {phone && (
                <li className="flex items-center gap-2 text-xs text-gray-300">
                  <FiPhone size={14} />
                  <a href={`tel:${phone.replace(/\s/g, '')}`} className="hover:text-white">{phone}</a>
                </li>
              )}
              {email && (
                <li className="flex items-center gap-2 text-xs text-gray-300">
                  <FiMail size={14} />
                  <a href={`mailto:${email}`} className="hover:text-white break-all">{email}</a>
                </li>
              )}
              {address && (
                <li className="flex items-start gap-2 text-xs text-gray-300">
                  <FiMapPin size={14} className="mt-0.5 flex-shrink-0" />
                  {address}
                </li>
              )}
            </ul>
          </div>
        </div>

        {mapEmbed && (() => {
          let src = String(mapEmbed).trim();
          const iframeMatch = src.match(/<iframe[^>]*\ssrc=["']([^"']+)["']/i);
          if (iframeMatch) src = iframeMatch[1];
          const beforeQuote = src.split('"')[0].split("'")[0].trim();
          src = beforeQuote;
          if (!/^https?:\/\//i.test(src)) return null;
          try {
            const u = new URL(src);
            if (u.hostname.includes('google.com') && u.pathname.includes('/maps/embed')) {
              if (!u.searchParams.has('origin') && typeof window !== 'undefined') {
                u.searchParams.set('origin', window.location.origin);
              }
            }
            src = u.toString();
          } catch { return null; }
          return (
            <div className="mt-6">
              <div className="rounded-lg overflow-hidden border border-primary-700">
                <iframe
                  src={src}
                  className="w-full h-72 md:h-96"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  title="Google Maps"
                />
              </div>
            </div>
          );
        })()}

        <div className="border-t border-primary-700 mt-6 pt-4 text-center">
          <p className="text-xs text-gray-400">{copyright}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;