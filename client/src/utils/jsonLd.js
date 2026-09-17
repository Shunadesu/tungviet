/**
 * Schema.org JSON-LD builders for SEO.
 *
 * All builders return plain objects suitable for serialization into
 * <script type="application/ld+json">.
 */

const SITE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SITE_URL) ||
  'https://tungviet.fun';
const SITE_NAME = 'Tungviet';

const absoluteUrl = (maybePath, lang) => {
  if (!maybePath) return SITE_URL;
  if (/^https?:\/\//i.test(maybePath)) return maybePath;
  const safeLang = lang || 'vi';
  if (maybePath.startsWith('/')) return `${SITE_URL}${maybePath}`;
  return `${SITE_URL}/${safeLang}/${maybePath}`;
};

const stripHtml = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const truncate = (str, max = 200) => {
  if (!str) return '';
  const text = String(str).trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
};

/**
 * Product schema for product detail pages.
 * https://schema.org/Product
 */
export const buildProductJsonLd = (product, { lang = 'vi', url, siteConfig } = {}) => {
  if (!product) return null;
  const safeLang = lang === 'en' ? 'en' : 'vi';
  const name = safeLang === 'en' ? product.nameEn || product.name : product.name;
  const description = stripHtml(
    safeLang === 'en'
      ? product.descriptionEn || product.description
      : product.description || ''
  );
  const image = product.imageUrl
    ? absoluteUrl(product.imageUrl, safeLang)
    : absoluteUrl('/og-image.jpg', safeLang);
  const finalUrl = url || absoluteUrl(`/products/${product._id}`, safeLang);

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description: truncate(description, 500),
    image: [image],
    sku: product.productCode || undefined,
    mpn: product.productCode || undefined,
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
    manufacturer: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    url: finalUrl,
    category:
      Array.isArray(product.industries) && product.industries.length > 0
        ? stripHtml(
            safeLang === 'en'
              ? product.industries[0]?.nameEn || product.industries[0]?.name
              : product.industries[0]?.name
          )
        : undefined,
  };

  if (product.priceVisible !== false && typeof product.price === 'number' && product.price > 0) {
    ld.offers = {
      '@type': 'Offer',
      url: finalUrl,
      priceCurrency: 'VND',
      price: product.price,
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
      },
    };
  }

  if (siteConfig?.footer?.phone || siteConfig?.footer?.email) {
    const customer = {};
    if (siteConfig?.footer?.phone) customer.telephone = siteConfig.footer.phone;
    if (siteConfig?.footer?.email) customer.email = siteConfig.footer.email;
    ld.contactPoint = {
      '@type': 'ContactPoint',
      contactType: 'sales',
      ...customer,
      areaServed: 'Worldwide',
      availableLanguage: ['Vietnamese', 'English'],
    };
  }

  // Strip undefined fields
  return Object.fromEntries(Object.entries(ld).filter(([, v]) => v !== undefined));
};

/**
 * Article schema for news/blog posts.
 * https://schema.org/Article
 */
export const buildArticleJsonLd = (post, { lang = 'vi', url } = {}) => {
  if (!post) return null;
  const safeLang = lang === 'en' ? 'en' : 'vi';
  const title = safeLang === 'en' ? post.titleEn || post.title : post.title;
  const description = truncate(stripHtml(post.excerpt || post.content || ''), 500);
  const image = post.thumbnail
    ? absoluteUrl(post.thumbnail, safeLang)
    : absoluteUrl('/og-image.jpg', safeLang);
  const finalUrl = url || absoluteUrl(`/news/${post.slug}`, safeLang);

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: truncate(title, 110),
    description,
    image: [image],
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt || post.publishedAt || post.createdAt,
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/logo.png', safeLang),
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': finalUrl,
    },
    inLanguage: safeLang === 'en' ? 'en-US' : 'vi-VN',
    articleSection: post.category?.name || undefined,
  };
};

/**
 * Organization schema for the global site. Use on Home page or globally.
 * https://schema.org/Organization
 */
export const buildOrganizationJsonLd = (siteConfig) => {
  const footer = siteConfig?.footer || {};
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: siteConfig?.logoUrl
      ? absoluteUrl(siteConfig.logoUrl, 'vi')
      : absoluteUrl('/logo.png', 'vi'),
    description: truncate(footer.about || '', 500),
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      telephone: footer.phone || '',
      email: footer.email || '',
      areaServed: 'Worldwide',
      availableLanguage: ['Vietnamese', 'English'],
    },
    address: footer.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: footer.address,
        }
      : undefined,
    sameAs: [],
  };
  return Object.fromEntries(Object.entries(ld).filter(([, v]) => v !== undefined && v !== ''));
};

/**
 * WebSite schema with SearchAction for the global site.
 */
export const buildWebSiteJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: ['vi-VN', 'en-US'],
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/vi/products?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
});

/**
 * ItemList schema for market listings on Markets page.
 */
export const buildItemListJsonLd = (markets, { lang = 'vi' } = {}) => {
  if (!Array.isArray(markets) || markets.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: markets.map((m, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: lang === 'en' ? m.titleEn || m.title : m.title,
      url: absoluteUrl(`/markets/${m._id}`, lang),
    })),
  };
};

/**
 * CollectionPage schema for an application market detail page.
 * Markets group products, technologies and applications together so we use
 * `CollectionPage` (with `about` linking the related industry when available).
 * https://schema.org/CollectionPage
 */
export const buildMarketJsonLd = (market, { lang = 'vi', url, siteConfig } = {}) => {
  if (!market) return null;
  const safeLang = lang === 'en' ? 'en' : 'vi';
  const title = safeLang === 'en' ? market.titleEn || market.title : market.title;
  const description = truncate(
    stripHtml(
      safeLang === 'en'
        ? market.descriptionEn || market.description
        : market.description || ''
    ),
    500
  );
  const image = market.imageUrl
    ? absoluteUrl(market.imageUrl, safeLang)
    : absoluteUrl('/og-image.jpg', safeLang);
  const finalUrl = url || absoluteUrl(`/markets/${market._id}`, safeLang);

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url: finalUrl,
    image: [image],
    inLanguage: safeLang === 'en' ? 'en-US' : 'vi-VN',
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };

  // Link the related industry when present so crawlers can navigate from a
  // market to its parent industry. Markets use the `industry` field which is
  // a reference to MainTree (Industry) documents.
  if (market.industry && (market.industry._id || market.industry.name)) {
    const industryName = safeLang === 'en'
      ? market.industry.nameEn || market.industry.name
      : market.industry.name;
    ld.about = {
      '@type': 'Thing',
      name: industryName,
      url: market.industry._id
        ? absoluteUrl(`/main-trees/${market.industry._id}`, safeLang)
        : undefined,
    };
  }

  if (siteConfig?.footer?.phone || siteConfig?.footer?.email) {
    ld.publisher = {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'sales',
        telephone: siteConfig.footer.phone || '',
        email: siteConfig.footer.email || '',
        areaServed: 'Worldwide',
        availableLanguage: ['Vietnamese', 'English'],
      },
    };
  }

  return Object.fromEntries(Object.entries(ld).filter(([, v]) => v !== undefined));
};

export default {
  buildProductJsonLd,
  buildArticleJsonLd,
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
  buildItemListJsonLd,
  buildMarketJsonLd,
};
