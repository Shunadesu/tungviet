import SiteConfig, { SITE_CONFIG_ID } from '../models/SiteConfig.js';
import { cacheStore, invalidatePublicCache } from '../utils/cache.js';

const PUBLIC_KEY = (locale) => `public:site-config:${locale}`;

const localizeSlide = (slide, locale) => {
  if (!slide) return slide;
  const pick = (field) => {
    const vi = slide?.[field]?.vi;
    const en = slide?.[field]?.en;
    if (locale === 'en') {
      return en && String(en).trim() ? en : vi || '';
    }
    return vi || '';
  };
  return {
    _id: slide._id,
    imageUrl: slide.imageUrl || '',
    title: pick('title'),
    description: pick('description'),
    order: typeof slide.order === 'number' ? slide.order : 0,
    active: slide.active !== false,
  };
};

const localizeAboutSlide = (slide, locale) => {
  if (!slide) return slide;
  const pick = (field) => {
    const vi = slide?.[field]?.vi;
    const en = slide?.[field]?.en;
    if (locale === 'en') {
      return en && String(en).trim() ? en : vi || '';
    }
    return vi || '';
  };
  return {
    _id: slide._id,
    imageUrl: slide.imageUrl || '',
    title: pick('title'),
    subtitle: pick('subtitle'),
    order: typeof slide.order === 'number' ? slide.order : 0,
    active: slide.active !== false,
  };
};

const localizeFastFact = (fact, locale) => {
  if (!fact) return fact;
  const vi = fact.label?.vi || '';
  const en = fact.label?.en || '';
  const suffixVi = fact.suffix?.vi || '';
  const suffixEn = fact.suffix?.en || '';
  return {
    _id: fact._id,
    label: locale === 'en' && en.trim() ? en : vi,
    value: typeof fact.value === 'number' ? fact.value : 0,
    suffix: locale === 'en' && suffixEn.trim() ? suffixEn : suffixVi,
  };
};

const localizeCoreValue = (val, locale) => {
  if (!val) return val;
  const vi = val.title?.vi || '';
  const en = val.title?.en || '';
  const descVi = val.description?.vi || '';
  const descEn = val.description?.en || '';
  return {
    _id: val._id,
    icon: val.icon || 'FiAward',
    title: locale === 'en' && en.trim() ? en : vi,
    description: locale === 'en' && descEn.trim() ? descEn : descVi,
  };
};

const localizeAbout = (about, locale) => {
  if (!about) return about;
  const vi = about.intro?.vi || '';
  const en = about.intro?.en || '';
  const histVi = about.history?.vi || '';
  const histEn = about.history?.en || '';
  return {
    intro: locale === 'en' && en.trim() ? en : vi,
    history: locale === 'en' && histEn.trim() ? histEn : histVi,
    foundedYear: about.foundedYear || null,
  };
};

const normalizeId = (item) => {
  if (!item) return item;
  const raw = item._id;
  let idStr = null;
  if (raw == null) idStr = null;
  else if (typeof raw === 'string') idStr = raw;
  else if (typeof raw === 'object' && typeof raw.toHexString === 'function') idStr = raw.toHexString();
  else if (typeof raw === 'object' && raw._id) idStr = String(raw._id);
  else idStr = String(raw);
  return idStr ? { ...item, _id: idStr } : item;
};

const toClient = (doc, locale = 'vi') => {
  if (!doc) return null;
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  const heroSlides = (obj.heroSlides || [])
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((s) => localizeSlide(s, locale));
  const aboutSlides = (obj.aboutSlides || [])
    .filter((s) => s.active !== false)
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((s) => localizeAboutSlide(s, locale));
  return {
    logoUrl: obj.logoUrl || null,
    heroSlides,
    aboutSlides,
    about: obj.about ? localizeAbout(obj.about, locale) : null,
    fastFacts: (obj.fastFacts || []).map((f) => localizeFastFact(f, locale)),
    coreValues: (obj.coreValues || []).map((v) => localizeCoreValue(v, locale)),
    footer: obj.footer || null,
    seo: obj.seo || null,
    faviconUrl: obj.faviconUrl || null,
    floatingContacts: (obj.floatingContacts || [])
      .filter((c) => c.active !== false)
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((c) => normalizeId({ _id: c._id, icon: c.icon || 'FiPhone', url: c.url || '', label: c.label || '' })),
    updatedAt: obj.updatedAt || null,
  };
};

const toAdmin = (doc) => {
  if (!doc) return doc;
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  return {
    logoUrl: obj.logoUrl || null,
    logoFilename: obj.logoFilename || null,
    heroSlides: (obj.heroSlides || [])
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map(normalizeId),
    aboutSlides: (obj.aboutSlides || [])
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map(normalizeId),
    about: obj.about || null,
    fastFacts: (obj.fastFacts || []).map(normalizeId),
    coreValues: (obj.coreValues || []).map(normalizeId),
    floatingContacts: (obj.floatingContacts || [])
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map(normalizeId),
    footer: obj.footer || null,
    seo: obj.seo || null,
    faviconUrl: obj.faviconUrl || null,
    faviconFilename: obj.faviconFilename || null,
    updatedAt: obj.updatedAt || null,
  };
};

export const siteConfigService = {
  async getConfig() {
    let config = await SiteConfig.findById(SITE_CONFIG_ID);
    if (!config) {
      config = await SiteConfig.create({ _id: SITE_CONFIG_ID });
    }
    return config;
  },

  async getPublic(locale = 'vi') {
    const key = PUBLIC_KEY(locale);
    const cached = cacheStore.get(key);
    if (cached) return cached;
    const config = await this.getConfig();
    const payload = toClient(config, locale);
    cacheStore.set(key, payload, 300);
    return payload;
  },

  async getAdmin() {
    const config = await this.getConfig();
    return toAdmin(config);
  },

  async updateLogo({ logoUrl, logoFilename }) {
    const config = await SiteConfig.findByIdAndUpdate(
      SITE_CONFIG_ID,
      { logoUrl, logoFilename },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    invalidatePublicCache();
    return config;
  },

  async clearLogo() {
    const config = await SiteConfig.findByIdAndUpdate(
      SITE_CONFIG_ID,
      { logoUrl: null, logoFilename: null },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    invalidatePublicCache();
    return config;
  },

  async updateFooter(payload) {
    const config = await SiteConfig.findByIdAndUpdate(
      SITE_CONFIG_ID,
      { $set: { footer: payload } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    invalidatePublicCache();
    return config;
  },

  async addHeroSlide(slide) {
    const config = await this.getConfig();
    const order = (config.heroSlides?.length || 0);
    const nextOrder = typeof slide.order === 'number' && slide.order >= 0 ? slide.order : order;
    config.heroSlides.push({ ...slide, order: nextOrder });
    await config.save();
    invalidatePublicCache();
    return config;
  },

  async updateHeroSlide(slideId, slide) {
    const current = await this.getConfig();
    const idx = (current.heroSlides || []).findIndex(
      (s) => String(s._id) === String(slideId)
    );
    if (idx === -1) {
      const { AppError } = await import('../utils/AppError.js');
      throw AppError.notFound('Không tìm thấy slide', 'SLIDE_NOT_FOUND');
    }
    current.heroSlides[idx] = { ...current.heroSlides[idx].toObject(), ...slide };
    await current.save();
    invalidatePublicCache();
    return current;
  },

  async deleteHeroSlide(slideId) {
    const config = await SiteConfig.findByIdAndUpdate(
      SITE_CONFIG_ID,
      { $pull: { heroSlides: { _id: slideId } } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    invalidatePublicCache();
    return config;
  },

  async reorderHeroSlides(orderedIds) {
    const current = await this.getConfig();
    const map = new Map(
      (current.heroSlides || []).map((s) => [String(s._id), s])
    );
    const next = orderedIds
      .map((id) => map.get(String(id)))
      .filter(Boolean)
      .map((s, idx) => ({ ...s.toObject(), order: idx }));
    current.heroSlides = next;
    await current.save();
    invalidatePublicCache();
    return current;
  },

  async addAboutSlide(slide) {
    const config = await this.getConfig();
    const order = (config.aboutSlides?.length || 0);
    const nextOrder = typeof slide.order === 'number' && slide.order >= 0 ? slide.order : order;
    config.aboutSlides.push({ ...slide, order: nextOrder });
    await config.save();
    invalidatePublicCache();
    return config;
  },

  async updateAboutSlide(slideId, slide) {
    const current = await this.getConfig();
    const idx = (current.aboutSlides || []).findIndex(
      (s) => String(s._id) === String(slideId)
    );
    if (idx === -1) {
      const { AppError } = await import('../utils/AppError.js');
      throw AppError.notFound('Không tìm thấy slide', 'SLIDE_NOT_FOUND');
    }
    current.aboutSlides[idx] = { ...current.aboutSlides[idx].toObject(), ...slide };
    await current.save();
    invalidatePublicCache();
    return current;
  },

  async deleteAboutSlide(slideId) {
    const config = await SiteConfig.findByIdAndUpdate(
      SITE_CONFIG_ID,
      { $pull: { aboutSlides: { _id: slideId } } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    invalidatePublicCache();
    return config;
  },

  async reorderAboutSlides(orderedIds) {
    const current = await this.getConfig();
    const map = new Map(
      (current.aboutSlides || []).map((s) => [String(s._id), s])
    );
    const next = orderedIds
      .map((id) => map.get(String(id)))
      .filter(Boolean)
      .map((s, idx) => ({ ...s.toObject(), order: idx }));
    current.aboutSlides = next;
    await current.save();
    invalidatePublicCache();
    return current;
  },

  async updateAbout(payload) {
    const config = await SiteConfig.findByIdAndUpdate(
      SITE_CONFIG_ID,
      {
        $set: {
          'about.intro': payload.intro || {},
          'about.history': payload.history || {},
          'about.foundedYear': typeof payload.foundedYear === 'number' ? payload.foundedYear : null,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    invalidatePublicCache();
    return config;
  },

  async updateFastFacts(facts) {
    const config = await SiteConfig.findByIdAndUpdate(
      SITE_CONFIG_ID,
      { $set: { fastFacts: facts || [] } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    invalidatePublicCache();
    return config;
  },

  async updateCoreValues(values) {
    const config = await SiteConfig.findByIdAndUpdate(
      SITE_CONFIG_ID,
      { $set: { coreValues: values || [] } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    invalidatePublicCache();
    return config;
  },

  async updateSeo(payload) {
    const config = await SiteConfig.findByIdAndUpdate(
      SITE_CONFIG_ID,
      { $set: { seo: payload } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    invalidatePublicCache();
    return config;
  },

  async updateFavicon({ faviconUrl, faviconFilename }) {
    const config = await SiteConfig.findByIdAndUpdate(
      SITE_CONFIG_ID,
      { faviconUrl, faviconFilename },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    invalidatePublicCache();
    return config;
  },

  async clearFavicon() {
    const config = await SiteConfig.findByIdAndUpdate(
      SITE_CONFIG_ID,
      { faviconUrl: null, faviconFilename: null },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    invalidatePublicCache();
    return config;
  },

  async updateFloatingContacts(contacts) {
    const config = await SiteConfig.findByIdAndUpdate(
      SITE_CONFIG_ID,
      { $set: { floatingContacts: contacts || [] } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    invalidatePublicCache();
    return config;
  },
};