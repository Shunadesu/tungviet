import { cacheGet, cacheSet } from '../utils/cache.js';
import Product from '../models/Product.js';
import Post from '../models/Post.js';
import MainTree from '../models/MainTree.js';
import MarketTree from '../models/MarketTree.js';

/**
 * Generate sitemap.xml for the public site.
 * Aggregates all indexable URLs across entities and locales (vi/en)
 * using lightweight DB projections for performance.
 *
 * Cached for 1 hour via in-memory cache + Cache-Control.
 */
const BASE_URL = process.env.SITE_URL || 'https://tungviet.fun';

const STATIC_ROUTES = [
  '', // home
  'products',
  'markets',
  'main-trees',
  'news',
  'quote',
  'contact',
  'about',
  'leadership',
  'board-of-directors',
  'locations',
];

const escapeXml = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const urlEntry = (loc, lastmod = new Date(), changefreq = 'weekly', priority = 0.7) =>
  `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${new Date(lastmod).toISOString()}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority.toFixed(1)}</priority>\n  </url>`;

const pairEntry = (path, lastmod) => {
  // Generate <url> entries for vi + en alternates of the same path.
  // x-default is set to vi.
  const viUrl = `${BASE_URL}/vi${path}`;
  const enUrl = `${BASE_URL}/en${path}`;
  return [
    `  <url>`,
    `    <loc>${escapeXml(viUrl)}</loc>`,
    `    <lastmod>${new Date(lastmod).toISOString()}</lastmod>`,
    `    <changefreq>weekly</changefreq>`,
    `    <priority>0.7</priority>`,
    `    <xhtml:link rel="alternate" hreflang="vi" href="${escapeXml(viUrl)}"/>`,
    `    <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(enUrl)}"/>`,
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(viUrl)}"/>`,
    `  </url>`,
    `  <url>`,
    `    <loc>${escapeXml(enUrl)}</loc>`,
    `    <lastmod>${new Date(lastmod).toISOString()}</lastmod>`,
    `    <changefreq>weekly</changefreq>`,
    `    <priority>0.7</priority>`,
    `    <xhtml:link rel="alternate" hreflang="vi" href="${escapeXml(viUrl)}"/>`,
    `    <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(enUrl)}"/>`,
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(viUrl)}"/>`,
    `  </url>`,
  ].join('\n');
};

export const getSitemap = async (req, res) => {
  try {
    const cacheKey = 'sitemap.xml:v1';
    const cached = cacheGet(cacheKey);
    if (cached) {
      res.set('Content-Type', 'application/xml; charset=utf-8');
      res.set('Cache-Control', 'public, max-age=3600');
      return res.send(cached);
    }

    const [products, posts, mainTrees, markets] = await Promise.all([
      Product.find({ webStatus: 'published', isActive: { $ne: false } })
        .select('_id updatedAt webStatus')
        .lean(),
      Post.find({ isActive: true })
        .select('_id slug updatedAt publishedAt')
        .lean(),
      MainTree.find({ isActive: { $ne: false } })
        .select('_id updatedAt')
        .lean(),
      MarketTree.find({ isActive: { $ne: false } })
        .select('_id updatedAt')
        .lean(),
    ]);

    const entries = [];
    const now = new Date();

    // Home (highest priority).
    entries.push(pairEntry('', now));
    entries[0] = entries[0]
      .replace('<priority>0.7</priority>', '<priority>1.0</priority>');
    entries[0] = entries[0]
      .replace('<changefreq>weekly</changefreq>', '<changefreq>daily</changefreq>');

    // Static routes (medium priority).
    for (const route of STATIC_ROUTES.slice(1)) {
      entries.push(pairEntry(`/${route}`, now));
    }

    // Products.
    for (const p of products) {
      entries.push(pairEntry(`/products/${p._id}`, p.updatedAt || now));
    }

    // Markets.
    for (const m of markets) {
      entries.push(pairEntry(`/markets/${m._id}`, m.updatedAt || now));
    }

    // Main trees.
    for (const tree of mainTrees) {
      entries.push(pairEntry(`/main-trees/${tree._id}`, tree.updatedAt || now));
    }

    // News posts (slug-based URLs).
    for (const post of posts) {
      const slug = post.slug || String(post._id);
      entries.push(pairEntry(`/news/${slug}`, post.updatedAt || post.publishedAt || now));
    }

    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n` +
      `        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
      `${entries.join('\n')}\n` +
      `</urlset>`;

    cacheSet(cacheKey, xml, 60 * 60 * 1000);

    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600');
    return res.send(xml);
  } catch (err) {
    // Soft-fail — return a minimal but valid sitemap so search engines
    // can still index the site even if the DB is down.
    const fallback = `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      `  <url>\n    <loc>${BASE_URL}/vi</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n` +
      `  <url>\n    <loc>${BASE_URL}/en</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n` +
      `</urlset>`;
    res.set('Content-Type', 'application/xml; charset=utf-8');
    return res.status(200).send(fallback);
  }
};
