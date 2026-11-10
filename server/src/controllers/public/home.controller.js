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
import { localizeText, resolveLocale } from '../../utils/i18n.js';
import {
  localizeCert,
  localizeHomeSection,
  localizeMainTree,
  localizeMarket,
  localizePost,
  localizeProductList,
  localizeQuoteSection,
  localizeTestimonial,
} from '../../utils/publicLocalize.js';

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
