/**
 * SkipLink — WCAG 2.1 SC 2.4.1 "Bypass Blocks"
 *
 * A hidden link that becomes visible on keyboard focus, letting screen-reader
 * and keyboard users jump straight to the main content without tabbing through
 * every navigation item.
 *
 * Placed at the very top of the DOM tree (first child of <body>), so it is
 * reached before the site header.
 */
import { useTranslation } from 'react-i18next';

const SkipLink = () => {
  const { t } = useTranslation();

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:inline-flex focus:items-center focus:gap-2 focus:rounded-lg focus:px-4 focus:py-2.5 focus:bg-primary focus:text-white focus:font-semibold focus:text-sm focus:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
      style={{ fontSize: '0.875rem' }}
    >
      {t('a11y.skipToContent')}
    </a>
  );
};

export default SkipLink;
