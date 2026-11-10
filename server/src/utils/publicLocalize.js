/**
 * Shared localization helpers cho toàn bộ endpoint public.
 *
 * Trước đây các helper này nằm rải rác trong `home.controller.js`, khiến các
 * controller khác (product, marketTree, common) phải copy lại logic địa phương
 * hoá. File này gom về một chỗ để mọi controller public dùng chung.
 */
import { localizeFields, localizeText } from './i18n.js';

export const PRODUCT_LOCALIZABLE = ['name', 'description'];
export const MARKET_LOCALIZABLE = ['title', 'description'];
export const MAIN_TREE_LOCALIZABLE = ['name', 'description'];
export const CERT_LOCALIZABLE = ['name', 'description'];
export const TESTIMONIAL_LOCALIZABLE = ['author', 'role', 'company', 'quote'];
export const HOME_SECTION_LOCALIZABLE = ['title', 'subtitle'];

/** Projection nhẹ cho danh sách sản phẩm (trang list, search, wishlist...). */
export const PRODUCT_LIST_PROJECTION =
  '_id productCode name nameEn imageUrl price priceVisible isFeatured isNew viewCount industries productLines';

export const localizeProduct = (product, locale) => {
  if (!product) return product;
  return localizeFields(product, locale, PRODUCT_LOCALIZABLE);
};

export const localizeProductList = (items, locale) =>
  (Array.isArray(items) ? items : []).map((p) => localizeProduct(p, locale));

export const localizeMarket = (market, locale) => {
  if (!market) return market;
  const out = localizeFields(market, locale, MARKET_LOCALIZABLE);
  if (market.industry) {
    out.industry = {
      _id: String(market.industry._id || market.industry),
      name: market.industry.name || '',
      nameEn: market.industry.nameEn || '',
      slug: market.industry.slug || '',
    };
  }
  return out;
};

export const localizeMainTree = (mainTree, locale) => {
  if (!mainTree) return mainTree;
  return localizeFields(mainTree, locale, MAIN_TREE_LOCALIZABLE);
};

export const localizeCert = (cert, locale) => {
  if (!cert) return cert;
  return localizeFields(cert, locale, CERT_LOCALIZABLE);
};

export const localizeTestimonial = (testimonial, locale) => {
  if (!testimonial) return testimonial;
  return localizeFields(testimonial, locale, TESTIMONIAL_LOCALIZABLE);
};

export const localizePost = (post, locale) => {
  if (!post) return post;
  return {
    ...post,
    title: localizeText(post.title, locale, ''),
    excerpt: localizeText(post.excerpt, locale, ''),
    category: post.category
      ? {
          _id: String(post.category._id || post.category),
          name: localizeText(post.category.name, locale, ''),
          slug: post.category.slug || '',
        }
      : null,
  };
};

export const localizeQuoteSection = (quote, locale) => {
  if (!quote) return quote;
  return {
    _id: quote._id,
    title: localizeText(quote.title, locale, ''),
    subtitle: localizeText(quote.subtitle, locale, ''),
    backgroundUrl: quote.backgroundUrl || '',
    hotlines: quote.hotlines || [],
  };
};

export const localizeHomeSection = (section, locale) => {
  if (!section) return section;
  return {
    ...section,
    title: localizeText(section.title, locale, ''),
    subtitle: localizeText(section.subtitle, locale, ''),
  };
};
