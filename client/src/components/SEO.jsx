import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { SUPPORTED_LOCALES } from '../i18n';

const OG_LOCALE = { vi: 'vi_VN', en: 'en_US' };

const SEO = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  noindex = false,
}) => {
  const { t } = useTranslation();
  const { lang: urlLang } = useParams();
  const lang = SUPPORTED_LOCALES.includes(urlLang) ? urlLang : 'vi';

  const siteName = 'Zuna Tungviet';
  const defaultTitle = t('seo.defaultTitle');
  const defaultDescription = t('seo.defaultDescription');
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://tungviet.fun';

  const finalTitle = title ? `${title} | ${siteName}` : defaultTitle;
  const finalDescription = description || defaultDescription;
  const pathWithoutLocale = url ? url.replace(/^\/[^/]+/, '') : '';
  const finalUrl = url ? `${siteUrl}/${lang}${pathWithoutLocale}` : `${siteUrl}/${lang}`;
  const finalImage = image || `${siteUrl}/og-image.jpg`;

  const alternates = SUPPORTED_LOCALES.map((code) => ({
    hreflang: code,
    href: `${siteUrl}/${code}${pathWithoutLocale}`,
  }));

  return (
    <Helmet>
      <html lang={lang} />
      <title>{finalTitle}</title>
      <meta name="title" content={finalTitle} />
      <meta name="description" content={finalDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      <link rel="canonical" href={finalUrl} />
      {alternates.map((alt) => (
        <link key={alt.hreflang} rel="alternate" hrefLang={alt.hreflang} href={alt.href} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={`${siteUrl}/vi${pathWithoutLocale}`} />

      <meta property="og:type" content={type} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={OG_LOCALE[lang] || 'en_US'} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={finalUrl} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />
    </Helmet>
  );
};

export default SEO;