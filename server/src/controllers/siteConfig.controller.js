import mongoose from 'mongoose';
import { siteConfigService } from '../services/siteConfig.service.js';
import { uploadService } from './upload.controller.js';
import { apiResponse } from '../utils/apiResponse.js';
import { AppError } from '../utils/AppError.js';
import { resolveLocale } from '../utils/i18n.js';

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
    return apiResponse.ok(res, data);
  } catch (err) {
    next(err);
  }
};

export const getSiteConfig = async (req, res, next) => {
  try {
    const data = await siteConfigService.getAdmin();
    return apiResponse.ok(res, data);
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
      {
        logoUrl: config.logoUrl,
        logoFilename: config.logoFilename,
        updatedAt: config.updatedAt,
      },
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
      {
        logoUrl: saved.url,
        logoFilename: saved.filename,
        updatedAt: config.updatedAt,
      },
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

const sanitizeFooter = (body = {}) => ({
  about: typeof body.about === 'string' ? body.about.slice(0, 500) : '',
  phone: typeof body.phone === 'string' ? body.phone.slice(0, 50) : '',
  email: typeof body.email === 'string' ? body.email.slice(0, 120) : '',
  address: typeof body.address === 'string' ? body.address.slice(0, 300) : '',
  copyright: typeof body.copyright === 'string' ? body.copyright.slice(0, 200) : '',
  logoUrl: typeof body.logoUrl === 'string' ? body.logoUrl.slice(0, 500) : '',
  mapEmbed: typeof body.mapEmbed === 'string' ? body.mapEmbed.slice(0, 500) : '',
});

export const updateFooter = async (req, res, next) => {
  try {
    const footer = sanitizeFooter(req.body);
    const config = await siteConfigService.updateFooter(footer);
    return apiResponse.ok(res, config.footer, 'Cập nhật footer thành công');
  } catch (err) {
    next(err);
  }
};

const sanitizeSlide = (body = {}) => {
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
    order,
    active,
  };
};

export const addHeroSlide = async (req, res, next) => {
  try {
    const slide = sanitizeSlide(req.body);
    const config = await siteConfigService.addHeroSlide(slide);
    const created = config.heroSlides[config.heroSlides.length - 1];
    return apiResponse.created(res, created, 'Thêm slide thành công');
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
    return apiResponse.ok(res, updated, 'Cập nhật slide thành công');
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
    return apiResponse.ok(res, config.heroSlides, 'Xoá slide thành công');
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
    return apiResponse.ok(res, config.heroSlides, 'Sắp xếp slide thành công');
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
    return apiResponse.created(res, created, 'Thêm slide thành công');
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
    return apiResponse.ok(res, updated, 'Cập nhật slide thành công');
  } catch (err) {
    next(err);
  }
};

export const deleteAboutSlide = async (req, res, next) => {
  try {
    const { slideId } = req.params;
    const config = await siteConfigService.deleteAboutSlide(slideId);
    return apiResponse.ok(res, config.aboutSlides, 'Xoá slide thành công');
  } catch (err) {
    next(err);
  }
};

export const reorderAboutSlides = async (req, res, next) => {
  try {
    const order = Array.isArray(req.body?.order) ? req.body.order : [];
    const config = await siteConfigService.reorderAboutSlides(order);
    return apiResponse.ok(res, config.aboutSlides, 'Sắp xếp slide thành công');
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
    const contacts = Array.isArray(req.body) ? req.body : [];
    const config = await siteConfigService.updateFloatingContacts(contacts);
    return apiResponse.ok(res, config.floatingContacts, 'Cap nhat thanh cong');
  } catch (err) {
    next(err);
  }
};