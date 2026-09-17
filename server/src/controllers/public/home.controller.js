import SiteConfig from '../../models/SiteConfig.js';
import Product from '../../models/Product.js';
import MarketTree from '../../models/MarketTree.js';
import MainTree from '../../models/MainTree.js';
import Partner from '../../models/Partner.js';
import Post from '../../models/Post.js';
import Member from '../../models/Member.js';
import Location from '../../models/Location.js';
import QuoteSection from '../../models/QuoteSection.js';
import { productService } from '../../services/product.service.js';
import { marketTreeService } from '../../services/marketTree.service.js';
import { mainTreeService } from '../../services/mainTree.service.js';
import { apiResponse } from '../../utils/apiResponse.js';
import { cacheKeys, cacheStore, TTL } from '../../utils/cache.js';
import { localizeFields, localizeText, resolveLocale } from '../../utils/i18n.js';

const PRODUCT_LOCALIZABLE = ['name', 'description'];
const MARKET_LOCALIZABLE = ['title', 'description'];
const MAIN_LOCALIZABLE = ['name', 'description'];
const CERT_LOCALIZABLE = ['name', 'description'];
const TESTIMONIAL_LOCALIZABLE = ['author', 'role', 'company', 'quote'];
const HOME_TITLE_LOCALIZABLE = ['title', 'subtitle'];
const PRODUCT_LIST_PROJECTION = '_id productCode name nameEn imageUrl price priceVisible isFeatured isNew viewCount industries productLines';

const localizeProduct = (p, locale) => {
  if (!p) return p;
  return localizeFields(p, locale, PRODUCT_LOCALIZABLE);
};

const localizeProductList = (items, locale) =>
  (items || []).map((p) => localizeProduct(p, locale));

const localizeMarket = (m, locale) => {
  if (!m) return m;
  const out = localizeFields(m, locale, MARKET_LOCALIZABLE);
  if (m.industry) {
    out.industry = {
      _id: String(m.industry._id || m.industry),
      name: m.industry.name || '',
      nameEn: m.industry.nameEn || '',
      slug: m.industry.slug || '',
    };
  }
  return out;
};

const localizeMainTree = (m, locale) => {
  if (!m) return m;
  return localizeFields(m, locale, MAIN_LOCALIZABLE);
};

const localizeCert = (c, locale) => {
  if (!c) return c;
  return localizeFields(c, locale, CERT_LOCALIZABLE);
};

const localizeTestimonial = (t, locale) => {
  if (!t) return t;
  return localizeFields(t, locale, TESTIMONIAL_LOCALIZABLE);
};

const localizePost = (p, locale) => {
  if (!p) return p;
  return {
    ...p,
    title: localizeText(p.title, locale, ''),
    excerpt: localizeText(p.excerpt, locale, ''),
    category: p.category
      ? {
          _id: String(p.category._id || p.category),
          name: localizeText(p.category.name, locale, ''),
          slug: p.category.slug || '',
        }
      : null,
  };
};

const localizeQuoteSection = (q, locale) => {
  if (!q) return q;
  return {
    _id: q._id,
    title: localizeText(q.title, locale, ''),
    subtitle: localizeText(q.subtitle, locale, ''),
    backgroundUrl: q.backgroundUrl || '',
    hotlines: q.hotlines || [],
  };
};

const localizeHomeSection = (s, locale) => {
  if (!s) return s;
  return {
    ...s,
    title: localizeText(s.title, locale, ''),
    subtitle: localizeText(s.subtitle, locale, ''),
  };
};

/**
 * GET /api/public/home?lang=
 * Aggregation endpoint - returns the entire home page payload in 1 call.
 */
export const getHome = async (req, res, next) => {
  try {
    const locale = resolveLocale(req);
    const cacheKey = cacheKeys.publicHome(locale);
    const cached = cacheStore.get(cacheKey);
    if (cached) return apiResponse.ok(res, cached);

    // Run independent queries in parallel
    const [
      siteConfig,
      featured,
      popular,
      newProds,
      featuredMarkets,
      industries,
      posts,
      partners,
      members,
      locations,
      quote,
      productCount,
      marketCount,
      partnerCount,
      customerCount,
    ] = await Promise.all([
      SiteConfig.findOne({ _id: 'site' }).lean(),
      productService.listPublicFeatured({ limit: 8 }),
      productService.listPublicPopular({ limit: 4 }),
      productService.listPublicNew({ limit: 4 }),
      marketTreeService.getPublicFeatured({ limit: 6 }),
      mainTreeService.getPublic(),
      Post.find({ isActive: true })
        .sort({ order: 1, publishedAt: -1, createdAt: -1 })
        .limit(3)
        .populate('category', 'name nameEn slug')
        .lean(),
      Partner.find({ isActive: true }).sort({ order: 1 }).lean(),
      Member.find({ isActive: true }).sort({ order: 1 }).limit(4).lean(),
      Location.find({ isActive: true }).sort({ order: 1 }).limit(3).lean(),
      QuoteSection.findOne({ isActive: true }).lean(),
      Product.countDocuments({ isActive: true, webStatus: 'published' }),
      MarketTree.countDocuments({ isActive: true }),
      Partner.countDocuments({ isActive: true, type: 'partner' }),
      Partner.countDocuments({ isActive: true, type: 'customer' }),
    ]);

    // Compute product count per industry for the industries grid
    let industryProductCounts = new Map();
    if (industries.length > 0) {
      const counts = await Product.aggregate([
        {
          $match: {
            isActive: true,
            webStatus: 'published',
            industries: { $in: industries.map((i) => i._id) },
          },
        },
        { $unwind: '$industries' },
        { $match: { industries: { $in: industries.map((i) => i._id) } } },
        { $group: { _id: '$industries', count: { $sum: 1 } } },
      ]);
      industryProductCounts = new Map(
        counts.map((c) => [String(c._id), c.count])
      );
    }

    // Group partners by type
    const partnerGrouped = { partner: [], customer: [] };
    for (const p of partners) {
      if (p.type === 'customer') partnerGrouped.customer.push(p);
      else partnerGrouped.partner.push(p);
    }

    const payload = {
      siteConfig: siteConfig
        ? {
            logoUrl: siteConfig.logoUrl || null,
            faviconUrl: siteConfig.faviconUrl || null,
            heroSlides: (siteConfig.heroSlides || [])
              .filter((s) => s.active !== false)
              .sort((a, b) => (a.order || 0) - (b.order || 0)),
            aboutSlides: (siteConfig.aboutSlides || [])
              .filter((s) => s.active !== false)
              .sort((a, b) => (a.order || 0) - (b.order || 0)),
            about: siteConfig.about || null,
            fastFacts: siteConfig.fastFacts || [],
            coreValues: siteConfig.coreValues || [],
            footer: siteConfig.footer || {},
            floatingContacts: (siteConfig.floatingContacts || [])
              .filter((c) => c.active !== false)
              .sort((a, b) => (a.order || 0) - (b.order || 0)),
            certificates: (siteConfig.certificates || [])
              .filter((c) => c.active !== false)
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((c) => localizeCert(c, locale)),
            testimonials: (siteConfig.testimonials || [])
              .filter((t) => t.active !== false)
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((t) => localizeTestimonial(t, locale)),
            homeSections: (siteConfig.homeSections || [])
              .map((s) => localizeHomeSection(s, locale)),
            seo: siteConfig.seo || null,
          }
        : null,
      featuredProducts: localizeProductList(featured, locale),
      popularProducts: localizeProductList(popular, locale),
      newProducts: localizeProductList(newProds, locale),
      featuredMarkets: (featuredMarkets || []).map((m) => localizeMarket(m, locale)),
      industries: (industries || []).map((m) => ({
        ...localizeMainTree(m, locale),
        productCount: industryProductCounts.get(String(m._id)) || 0,
      })),
      posts: (posts || []).map((p) => localizePost(p, locale)),
      partners: partnerGrouped,
      members: (members || []).map((m) => ({
        _id: m._id,
        name: localizeText(m.name, locale, ''),
        position: localizeText(m.position, locale, ''),
        imageUrl: m.imageUrl || '',
        description: localizeText(m.description, locale, ''),
      })),
      locations: (locations || []).map((l) => ({
        _id: l._id,
        name: localizeText(l.name, locale, ''),
        address: localizeText(l.address, locale, ''),
        phone: l.phone || '',
        email: l.email || '',
      })),
      quoteSection: localizeQuoteSection(quote, locale),
      stats: {
        products: productCount,
        markets: marketCount,
        partners: partnerCount,
        customers: customerCount,
      },
    };

    cacheStore.set(cacheKey, payload, TTL.PUBLIC_HOME);
    return apiResponse.ok(res, payload);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/public/products/popular?limit=4&lang=
 */
export const getPopularProducts = async (req, res, next) => {
  try {
    const locale = resolveLocale(req);
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 4));
    const cacheKey = cacheKeys.publicProductsPopular(limit, locale);
    let items = cacheStore.get(cacheKey);
    if (!items) {
      items = await productService.listPublicPopular({ limit });
      cacheStore.set(cacheKey, items, TTL.PUBLIC_PRODUCTS_PRECOMPUTED);
    }
    return apiResponse.ok(res, localizeProductList(items, locale));
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/public/products/new?limit=4&lang=
 */
export const getNewProducts = async (req, res, next) => {
  try {
    const locale = resolveLocale(req);
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 4));
    const cacheKey = cacheKeys.publicProductsNew(limit, locale);
    let items = cacheStore.get(cacheKey);
    if (!items) {
      items = await productService.listPublicNew({ limit });
      cacheStore.set(cacheKey, items, TTL.PUBLIC_PRODUCTS_PRECOMPUTED);
    }
    return apiResponse.ok(res, localizeProductList(items, locale));
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/public/products/featured?limit=8&lang=
 */
export const getFeaturedProducts = async (req, res, next) => {
  try {
    const locale = resolveLocale(req);
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 8));
    const cacheKey = cacheKeys.publicProductsFeatured(limit, locale);
    let items = cacheStore.get(cacheKey);
    if (!items) {
      items = await productService.listPublicFeatured({ limit });
      cacheStore.set(cacheKey, items, TTL.PUBLIC_PRODUCTS_PRECOMPUTED);
    }
    return apiResponse.ok(res, localizeProductList(items, locale));
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/public/products/related/:id?limit=4&lang=
 */
export const getRelatedProducts = async (req, res, next) => {
  try {
    const locale = resolveLocale(req);
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 4));
    const cacheKey = cacheKeys.publicProductsRelated(req.params.id, limit, locale);
    let items = cacheStore.get(cacheKey);
    if (!items) {
      items = await productService.listRelated(req.params.id, { limit });
      cacheStore.set(cacheKey, items, TTL.PUBLIC_PRODUCTS_PRECOMPUTED);
    }
    return apiResponse.ok(res, localizeProductList(items, locale));
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/public/products/bulk?ids=a,b,c&lang=
 * Single endpoint to hydrate multiple products at once (used by Wishlist/Compare).
 */
export const getProductsBulk = async (req, res, next) => {
  try {
    const locale = resolveLocale(req);
    const rawIds = req.query.ids || req.query.id || '';
    const ids = Array.isArray(rawIds)
      ? rawIds
      : String(rawIds)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

    if (ids.length === 0) {
      return apiResponse.ok(res, []);
    }
    if (ids.length > 50) {
      return apiResponse.badRequest(res, 'ids không được vượt quá 50');
    }

    const cacheKey = cacheKeys.publicProductsBulk(ids, locale);
    let items = cacheStore.get(cacheKey);
    if (!items) {
      items = await productService.listByIds(ids);
      cacheStore.set(cacheKey, items, TTL.PUBLIC_PRODUCTS_PRECOMPUTED);
    }
    return apiResponse.ok(res, localizeProductList(items, locale));
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/public/markets/featured?limit=6&lang=
 */
export const getFeaturedMarkets = async (req, res, next) => {
  try {
    const locale = resolveLocale(req);
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 6));
    const cacheKey = cacheKeys.publicMarketsFeatured(limit, locale);
    let items = cacheStore.get(cacheKey);
    if (!items) {
      items = await marketTreeService.getPublicFeatured({ limit });
      cacheStore.set(cacheKey, items, TTL.PUBLIC_MARKETS);
    }
    return apiResponse.ok(res, (items || []).map((m) => localizeMarket(m, locale)));
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/public/markets/grouped?lang=
 */
export const getMarketsGrouped = async (req, res, next) => {
  try {
    const locale = resolveLocale(req);
    const cacheKey = cacheKeys.publicMarketsGrouped(locale);
    let items = cacheStore.get(cacheKey);
    if (!items) {
      items = await marketTreeService.getPublicGrouped();
      cacheStore.set(cacheKey, items, TTL.PUBLIC_MARKETS_GROUPED);
    }
    const localized = (items || []).map((group) => ({
      industry: group.industry
        ? {
            _id: String(group.industry._id),
            name: localizeText(group.industry.name, locale, ''),
            nameEn: localizeText(group.industry.nameEn, locale, ''),
            slug: group.industry.slug || '',
          }
        : null,
      markets: (group.markets || []).map((m) => localizeMarket(m, locale)),
    }));
    return apiResponse.ok(res, localized);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/public/stats
 */
export const getStats = async (req, res, next) => {
  try {
    const cacheKey = cacheKeys.publicStats();
    let stats = cacheStore.get(cacheKey);
    if (!stats) {
      const [products, markets, partners, customers, industries, posts] = await Promise.all([
        Product.countDocuments({ isActive: true, webStatus: 'published' }),
        MarketTree.countDocuments({ isActive: true }),
        Partner.countDocuments({ isActive: true, type: 'partner' }),
        Partner.countDocuments({ isActive: true, type: 'customer' }),
        MainTree.countDocuments({ isActive: true }),
        Post.countDocuments({ isActive: true }),
      ]);
      stats = { products, markets, partners, customers, industries, posts };
      cacheStore.set(cacheKey, stats, TTL.PUBLIC_STATS);
    }
    return apiResponse.ok(res, stats);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/public/search?q=&lang=
 * Unified search across products + posts + markets.
 */
export const unifiedSearch = async (req, res, next) => {
  try {
    const locale = resolveLocale(req);
    const q = String(req.query.q || '').trim();
    const limit = Math.min(10, Math.max(1, parseInt(req.query.limit, 10) || 5));

    if (!q) {
      return apiResponse.ok(res, { products: [], posts: [], markets: [] });
    }

    const cacheKey = cacheKeys.publicSearch(q.toLowerCase(), locale);
    let payload = cacheStore.get(cacheKey);
    if (!payload) {
      const nameField = locale === 'en' ? 'nameEn' : 'name';
      const titleField = locale === 'en' ? 'titleEn' : 'title';

      const [products, posts, markets] = await Promise.all([
        Product.find({
          isActive: true,
          webStatus: 'published',
          [nameField]: { $regex: q, $options: 'i' },
        })
          .select(PRODUCT_LIST_PROJECTION)
          .limit(limit)
          .lean(),
        Post.find({
          isActive: true,
          title: { $regex: q, $options: 'i' },
        })
          .select('_id slug title thumbnail category publishedAt createdAt')
          .limit(limit)
          .populate('category', 'name nameEn slug')
          .lean(),
        MarketTree.find({
          isActive: true,
          [titleField]: { $regex: q, $options: 'i' },
        })
          .select('_id slug title titleEn description imageUrl industry')
          .limit(limit)
          .populate('industry', 'name nameEn slug')
          .lean(),
      ]);

      payload = {
        products: products.map((p) => localizeProduct(p, locale)),
        posts: posts.map((p) => localizePost(p, locale)),
        markets: markets.map((m) => localizeMarket(m, locale)),
      };
      cacheStore.set(cacheKey, payload, TTL.PUBLIC_SEARCH);
    }
    return apiResponse.ok(res, payload);
  } catch (err) {
    next(err);
  }
};
