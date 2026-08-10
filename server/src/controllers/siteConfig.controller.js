import mongoose from 'mongoose';
import { siteConfigService } from '../services/siteConfig.service.js';
import { uploadService } from './upload.controller.js';
import { apiResponse } from '../utils/apiResponse.js';
import { AppError } from '../utils/AppError.js';
import { resolveLocale } from '../utils/i18n.js';
import { toAbsoluteUploadUrls } from '../utils/imageUrl.js';
import { logger } from '../utils/logger.js';

const requireString = (value, field) => {
  if (typeof value !== 'string') {
    throw AppError.badRequest(`${field} phải là chuỗi`, 'INVALID_FIELD');
  }
  return value;
};

export const getPublicSiteConfig = async (req, res, next) => {
  try {
    const locale = resolveLocale(req);
    const data = await siteConfigService.getPublic(locale);
    return apiResponse.ok(res, toAbsoluteUploadUrls(data));
  } catch (err) {
    next(err);
  }
};

export const getSiteConfig = async (req, res, next) => {
  try {
    const data = await siteConfigService.getAdmin();
    return apiResponse.ok(res, toAbsoluteUploadUrls(data));
  } catch (err) {
    next(err);
  }
};

export const updateLogoByUrl = async (req, res, next) => {
  try {
    const logoUrl = requireString(req.body?.logoUrl, 'logoUrl');
    const filename = logoUrl.replace(/^\/?uploads\//, '');
    const config = await siteConfigService.updateLogo({ logoUrl, logoFilename: filename });
    return apiResponse.ok(
      res,
      toAbsoluteUploadUrls({
        logoUrl: config.logoUrl,
        logoFilename: config.logoFilename,
        updatedAt: config.updatedAt,
      }),
      'Cập nhật logo thành công'
    );
  } catch (err) {
    next(err);
  }
};

export const uploadLogo = async (req, res, next) => {
  try {
    const saved = await uploadService.save(req.file);
    const config = await siteConfigService.updateLogo({
      logoUrl: saved.url,
      logoFilename: saved.filename,
    });
    return apiResponse.ok(
      res,
      toAbsoluteUploadUrls({
        logoUrl: saved.url,
        logoFilename: saved.filename,
        updatedAt: config.updatedAt,
      }),
      'Upload logo thành công'
    );
  } catch (err) {
    next(err);
  }
};

export const clearLogo = async (req, res, next) => {
  try {
    const current = await siteConfigService.getConfig();
    if (current.logoFilename) {
      await uploadService.remove(current.logoFilename);
    }
    const config = await siteConfigService.clearLogo();
    return apiResponse.ok(
      res,
      {
        logoUrl: null,
        logoFilename: null,
        updatedAt: config.updatedAt,
      },
      'Đã xoá logo'
    );
  } catch (err) {
    next(err);
  }
};

export const clearFavicon = async (req, res, next) => {
  try {
    const current = await siteConfigService.getConfig();
    if (current.faviconFilename) {
      await uploadService.remove(current.faviconFilename);
    }
    const config = await siteConfigService.clearFavicon();
    return apiResponse.ok(
      res,
      {
        faviconUrl: null,
        faviconFilename: null,
        updatedAt: config.updatedAt,
      },
      'Đã xoá favicon'
    );
  } catch (err) {
    next(err);
  }
};

const sanitizeFooter = (body = {}) => ({
  about: typeof body.about === 'string' ? body.about.slice(0, 1000) : '',
  phone: typeof body.phone === 'string' ? body.phone.slice(0, 50) : '',
  email: typeof body.email === 'string' ? body.email.slice(0, 120) : '',
  address: typeof body.address === 'string' ? body.address.slice(0, 500) : '',
  copyright: typeof body.copyright === 'string' ? body.copyright.slice(0, 200) : '',
  logoUrl: typeof body.logoUrl === 'string' ? body.logoUrl.slice(0, 500) : '',
  mapEmbed: typeof body.mapEmbed === 'string' ? body.mapEmbed.slice(0, 2000) : '',
});

export const updateFooter = async (req, res, next) => {
  try {
    const footer = sanitizeFooter(req.body);
    const config = await siteConfigService.updateFooter(footer);
    const result = config.footer
      ? toAbsoluteUploadUrls(config.footer.toObject ? config.footer.toObject() : config.footer)
      : footer;
    return apiResponse.ok(res, result, 'Cập nhật footer thành công');
  } catch (err) {
    logger.error({ err: err.message, stack: err.stack, url: req.originalUrl, body: req.body }, 'updateFooter error');
    next(err);
  }
};

const trimText = (v, max) =>
  typeof v === 'string' ? v.slice(0, max) : '';
const localePair = (v, max) => ({
  vi: trimText(v?.vi, max),
  en: trimText(v?.en, max),
});

const VARIANTS = ['fullscreen', 'split', 'compact'];
const THEMES = ['light', 'dark', 'auto'];
const HEIGHTS = ['fullscreen', 'large', 'medium'];
const ANIMATIONS = ['fade-up', 'fade', 'slide'];
const CTA_STYLES = ['solid', 'outline', 'ghost'];

const sanitizeCTA = (body = {}) => {
  if (!body || typeof body !== 'object') return null;
  const label = localePair(body.label, 80);
  // CTA chỉ giữ khi có label và href hợp lệ
  if (!label.vi && !label.en) return null;
  const href = trimText(body.href, 500);
  if (!href) return null;
  const style = CTA_STYLES.includes(body.style) ? body.style : 'solid';
  return { label, href, style };
};

const sanitizeSlide = (body = {}) => {
  const imageUrl = trimText(body.imageUrl, 500);
  if (!imageUrl) {
    throw AppError.badRequest('imageUrl là bắt buộc', 'INVALID_FIELD');
  }
  let order = Number(body.order);
  if (!Number.isFinite(order)) order = 0;
  const active = body.active === false ? false : Boolean(body.active !== false);
  const variant = VARIANTS.includes(body.variant) ? body.variant : 'fullscreen';
  const theme = THEMES.includes(body.theme) ? body.theme : 'auto';
  const height = HEIGHTS.includes(body.height) ? body.height : 'fullscreen';
  const animationPreset = ANIMATIONS.includes(body.animationPreset) ? body.animationPreset : 'fade-up';
  let overlay = Number(body.backgroundOverlay);
  if (!Number.isFinite(overlay)) overlay = 50;
  overlay = Math.max(0, Math.min(100, overlay));
  const scrollHint = body.scrollHint === false ? false : Boolean(body.scrollHint !== false);

  return {
    imageUrl,
    title: localePair(body.title, 200),
    description: localePair(body.description, 500),
    order,
    active,
    variant,
    eyebrow: localePair(body.eyebrow, 80),
    ctaPrimary: sanitizeCTA(body.ctaPrimary),
    ctaSecondary: sanitizeCTA(body.ctaSecondary),
    theme,
    scrollHint,
    height,
    animationPreset,
    backgroundOverlay: overlay,
  };
};

export const addHeroSlide = async (req, res, next) => {
  try {
    const slide = sanitizeSlide(req.body);
    const config = await siteConfigService.addHeroSlide(slide);
    const created = config.heroSlides[config.heroSlides.length - 1];
    return apiResponse.created(res, toAbsoluteUploadUrls(created), 'Thêm slide thành công');
  } catch (err) {
    next(err);
  }
};

export const updateHeroSlide = async (req, res, next) => {
  try {
    const { slideId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(slideId)) {
      throw AppError.badRequest('slideId không hợp lệ', 'INVALID_ID');
    }
    const update = sanitizeSlide(req.body);
    const config = await siteConfigService.updateHeroSlide(slideId, update);
    const updated = (config.heroSlides || []).find(
      (s) => String(s._id) === String(slideId)
    );
    return apiResponse.ok(res, toAbsoluteUploadUrls(updated), 'Cập nhật slide thành công');
  } catch (err) {
    next(err);
  }
};

export const deleteHeroSlide = async (req, res, next) => {
  try {
    const { slideId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(slideId)) {
      throw AppError.badRequest('slideId không hợp lệ', 'INVALID_ID');
    }
    const config = await siteConfigService.deleteHeroSlide(slideId);
    return apiResponse.ok(res, toAbsoluteUploadUrls(config.heroSlides), 'Xoá slide thành công');
  } catch (err) {
    next(err);
  }
};

export const reorderHeroSlides = async (req, res, next) => {
  try {
    const order = Array.isArray(req.body?.order) ? req.body.order : [];
    if (!order.every((id) => mongoose.Types.ObjectId.isValid(id))) {
      throw AppError.badRequest('order phải là mảng slideId hợp lệ', 'INVALID_FIELD');
    }
    const config = await siteConfigService.reorderHeroSlides(order);
    return apiResponse.ok(res, toAbsoluteUploadUrls(config.heroSlides), 'Sắp xếp slide thành công');
  } catch (err) {
    next(err);
  }
};

const sanitizeAboutSlide = (body = {}) => {
  const trimText = (v, max) =>
    typeof v === 'string' ? v.slice(0, max) : '';
  const localePair = (v, max) => ({
    vi: trimText(v?.vi, max),
    en: trimText(v?.en, max),
  });
  const imageUrl = trimText(body.imageUrl, 500);
  if (!imageUrl) {
    throw AppError.badRequest('imageUrl là bắt buộc', 'INVALID_FIELD');
  }
  let order = Number(body.order);
  if (!Number.isFinite(order)) order = 0;
  const active = body.active === false ? false : Boolean(body.active !== false);
  return {
    imageUrl,
    title: localePair(body.title, 200),
    subtitle: localePair(body.subtitle, 300),
    order,
    active,
  };
};

export const addAboutSlide = async (req, res, next) => {
  try {
    const slide = sanitizeAboutSlide(req.body);
    const config = await siteConfigService.addAboutSlide(slide);
    const created = config.aboutSlides[config.aboutSlides.length - 1];
    return apiResponse.created(res, toAbsoluteUploadUrls(created), 'Thêm slide thành công');
  } catch (err) {
    next(err);
  }
};

export const updateAboutSlide = async (req, res, next) => {
  try {
    const { slideId } = req.params;
    const update = sanitizeAboutSlide(req.body);
    const config = await siteConfigService.updateAboutSlide(slideId, update);
    const updated = (config.aboutSlides || []).find(
      (s) => String(s._id) === String(slideId)
    );
    return apiResponse.ok(res, toAbsoluteUploadUrls(updated), 'Cập nhật slide thành công');
  } catch (err) {
    next(err);
  }
};

export const deleteAboutSlide = async (req, res, next) => {
  try {
    const { slideId } = req.params;
    const config = await siteConfigService.deleteAboutSlide(slideId);
    return apiResponse.ok(res, toAbsoluteUploadUrls(config.aboutSlides), 'Xoá slide thành công');
  } catch (err) {
    next(err);
  }
};

export const reorderAboutSlides = async (req, res, next) => {
  try {
    const order = Array.isArray(req.body?.order) ? req.body.order : [];
    const config = await siteConfigService.reorderAboutSlides(order);
    return apiResponse.ok(res, toAbsoluteUploadUrls(config.aboutSlides), 'Sắp xếp slide thành công');
  } catch (err) {
    next(err);
  }
};

export const updateAbout = async (req, res, next) => {
  try {
    const body = req.body || {};
    const payload = {
      intro: {
        vi: typeof body.intro?.vi === 'string' ? body.intro.vi : '',
        en: typeof body.intro?.en === 'string' ? body.intro.en : '',
      },
      history: {
        vi: typeof body.history?.vi === 'string' ? body.history.vi : '',
        en: typeof body.history?.en === 'string' ? body.history.en : '',
      },
      foundedYear: typeof body.foundedYear === 'number' ? body.foundedYear : null,
    };
    const config = await siteConfigService.updateAbout(payload);
    return apiResponse.ok(res, config.about, 'Cập nhật thông tin thành công');
  } catch (err) {
    next(err);
  }
};

export const updateFastFacts = async (req, res, next) => {
  try {
    const facts = Array.isArray(req.body) ? req.body : [];
    const config = await siteConfigService.updateFastFacts(facts);
    return apiResponse.ok(res, config.fastFacts, 'Cập nhật fast facts thành công');
  } catch (err) {
    next(err);
  }
};

export const updateCoreValues = async (req, res, next) => {
  try {
    const values = Array.isArray(req.body) ? req.body : [];
    const config = await siteConfigService.updateCoreValues(values);
    return apiResponse.ok(res, config.coreValues, 'Cập nhật core values thành công');
  } catch (err) {
    next(err);
  }
};

export const updateSeo = async (req, res, next) => {
  try {
    const body = req.body || {};
    const seo = {
      defaultTitle: typeof body.defaultTitle === 'string' ? body.defaultTitle.slice(0, 200) : '',
      defaultDescription: typeof body.defaultDescription === 'string' ? body.defaultDescription.slice(0, 500) : '',
      defaultKeywords: typeof body.defaultKeywords === 'string' ? body.defaultKeywords.slice(0, 500) : '',
      ogImage: typeof body.ogImage === 'string' ? body.ogImage.slice(0, 500) : '',
      siteUrl: typeof body.siteUrl === 'string' ? body.siteUrl.slice(0, 300) : '',
    };
    const config = await siteConfigService.updateSeo(seo);
    return apiResponse.ok(res, config.seo, 'Cap nhat SEO thanh cong');
  } catch (err) {
    next(err);
  }
};

export const uploadFavicon = async (req, res, next) => {
  try {
    const saved = await uploadService.save(req.file);
    const config = await siteConfigService.updateFavicon({
      faviconUrl: saved.url,
      faviconFilename: saved.filename,
    });
    return apiResponse.ok(
      res,
      {
        faviconUrl: config.faviconUrl,
        faviconFilename: config.faviconFilename,
      },
      'Upload favicon thanh cong'
    );
  } catch (err) {
    next(err);
  }
};

export const updateFloatingContacts = async (req, res, next) => {
  try {
    const rawContacts = Array.isArray(req.body) ? req.body : [];
    const contacts = rawContacts.map((item, index) => {
      const normalized = {
        icon: typeof item?.icon === 'string' && item.icon.trim() ? item.icon.trim() : 'FiPhone',
        url: typeof item?.url === 'string' ? item.url : '',
        label: typeof item?.label === 'string' ? item.label : '',
        active: item?.active !== false,
        order: typeof item?.order === 'number' ? item.order : index,
      };
      if (item && item._id) {
        const raw = item._id;
        if (typeof raw === 'string') normalized._id = raw;
        else if (typeof raw === 'object' && typeof raw.toHexString === 'function') normalized._id = raw.toHexString();
        else if (typeof raw === 'object' && raw._id) normalized._id = String(raw._id);
        else normalized._id = String(raw);
      }
      return normalized;
    });
    const config = await siteConfigService.updateFloatingContacts(contacts);
    return apiResponse.ok(res, config.floatingContacts, 'Cap nhat thanh cong');
  } catch (err) {
    next(err);
  }
};