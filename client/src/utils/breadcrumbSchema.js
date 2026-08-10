import { SUPPORTED_LOCALES } from '../i18n';

const siteUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SITE_URL) || 'https://tungviet.fun';

/**
 * Build a schema.org BreadcrumbList JSON-LD object from a breadcrumb array.
 *
 * @param {Array<{label: string, to?: string}>} items
 * @param {string} lang - current locale (vi|en)
 * @returns {object|null}
 */
export const buildBreadcrumbJsonLd = (items, lang) => {
  if (!Array.isArray(items) || items.length === 0) return null;
  const safeLang = SUPPORTED_LOCALES.includes(lang) ? lang : 'vi';

  const list = items.map((item, idx) => {
    let url;
    if (item.to) {
      // Absolute path? prefix with siteUrl + lang. Already absolute? keep as-is.
      if (/^https?:\/\//i.test(item.to)) url = item.to;
      else if (item.to.startsWith('/')) url = `${siteUrl}${item.to}`;
      else url = `${siteUrl}/${safeLang}/${item.to}`;
    } else {
      // Last item (current page) — use current URL if available
      if (idx === items.length - 1 && typeof window !== 'undefined') {
        url = `${siteUrl}${window.location.pathname}`;
      } else {
        url = `${siteUrl}/${safeLang}`;
      }
    }
    return {
      '@type': 'ListItem',
      position: idx + 1,
      name: item.label || '',
      item: url,
    };
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: list,
  };
};

export default buildBreadcrumbJsonLd;
