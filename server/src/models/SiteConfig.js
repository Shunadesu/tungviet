import mongoose from 'mongoose';

const SITE_ID = 'site';

const heroCtaSchema = new mongoose.Schema(
  {
    label: {
      vi: { type: String, trim: true, default: '' },
      en: { type: String, trim: true, default: '' },
    },
    href: { type: String, trim: true, default: '' },
    style: {
      type: String,
      enum: ['solid', 'outline', 'ghost'],
      default: 'solid',
    },
  },
  { _id: false }
);

const heroSlideSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    title: {
      vi: { type: String, trim: true, default: '' },
      en: { type: String, trim: true, default: '' },
    },
    description: {
      vi: { type: String, trim: true, default: '' },
      en: { type: String, trim: true, default: '' },
    },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    // NEW: skeleton rebuild (Phase 1)
    variant: {
      type: String,
      enum: ['fullscreen', 'split', 'compact'],
      default: 'fullscreen',
    },
    eyebrow: {
      vi: { type: String, trim: true, default: '' },
      en: { type: String, trim: true, default: '' },
    },
    ctaPrimary: { type: heroCtaSchema, default: null },
    ctaSecondary: { type: heroCtaSchema, default: null },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto',
    },
    scrollHint: { type: Boolean, default: true },
    height: {
      type: String,
      enum: ['fullscreen', 'large', 'medium'],
      default: 'fullscreen',
    },
    animationPreset: {
      type: String,
      enum: ['fade-up', 'fade', 'slide'],
      default: 'fade-up',
    },
    backgroundOverlay: { type: Number, default: 50, min: 0, max: 100 },
  },
  { _id: true, timestamps: true }
);

const aboutSlideSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    title: {
      vi: { type: String, trim: true, default: '' },
      en: { type: String, trim: true, default: '' },
    },
    subtitle: {
      vi: { type: String, trim: true, default: '' },
      en: { type: String, trim: true, default: '' },
    },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { _id: true, timestamps: true }
);

const fastFactSchema = new mongoose.Schema(
  {
    label: {
      vi: { type: String, trim: true, default: '' },
      en: { type: String, trim: true, default: '' },
    },
    value: { type: Number, default: 0 },
    suffix: {
      vi: { type: String, trim: true, default: '' },
      en: { type: String, trim: true, default: '' },
    },
  },
  { _id: true }
);

const coreValueSchema = new mongoose.Schema(
  {
    icon: { type: String, trim: true, default: 'FiAward' },
    title: {
      vi: { type: String, trim: true, default: '' },
      en: { type: String, trim: true, default: '' },
    },
    description: {
      vi: { type: String, trim: true, default: '' },
      en: { type: String, trim: true, default: '' },
    },
  },
  { _id: true }
);

const floatingContactSchema = new mongoose.Schema(
  {
    icon: { type: String, default: 'FiPhone' },
    url: { type: String, required: true },
    label: { type: String, default: '' },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { _id: true, timestamps: true }
);

const footerSchema = new mongoose.Schema(
  {
    about: {
      type: String,
      default:
        'Chuyên cung cấp các loại cây cảnh chất lượng cao, từ cây trong nhà đến cây ngoài trời, mang thiên nhiên đến gần bạn hơn.',
    },
    phone: { type: String, default: '0123 456 789' },
    email: { type: String, default: 'contact@zuna.vn' },
    address: { type: String, default: '123 Đường Cây Xanh, TP.HCM' },
    copyright: { type: String, default: '© 2024 Zuna Tungviet. Tất cả quyền được bảo lưu.' },
    logoUrl: { type: String, default: '' },
    mapEmbed: { type: String, default: '' },
  },
  { _id: false }
);

const seoSchema = new mongoose.Schema(
  {
    defaultTitle: { type: String, default: 'Zuna Tungviet' },
    defaultDescription: { type: String, default: '' },
    defaultKeywords: { type: String, default: '' },
    ogImage: { type: String, default: '' },
    siteUrl: { type: String, default: 'https://tungviet.fun' },
  },
  { _id: false }
);

const siteConfigSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: SITE_ID,
      immutable: true,
    },
    logoUrl: { type: String, default: null },
    logoFilename: { type: String, default: null },
    heroSlides: { type: [heroSlideSchema], default: [] },
    aboutSlides: { type: [aboutSlideSchema], default: [] },
    about: {
      intro: {
        vi: { type: String, default: '' },
        en: { type: String, default: '' },
      },
      history: {
        vi: { type: String, default: '' },
        en: { type: String, default: '' },
      },
      foundedYear: { type: Number, default: null },
    },
    fastFacts: { type: [fastFactSchema], default: [] },
    coreValues: { type: [coreValueSchema], default: [] },
    footer: { type: footerSchema, default: () => ({}) },
    floatingContacts: { type: [floatingContactSchema], default: [] },
    seo: { type: seoSchema, default: () => ({}) },
    faviconUrl: { type: String, default: null },
    faviconFilename: { type: String, default: null },
  },
  { timestamps: true }
);

const SiteConfig = mongoose.model('SiteConfig', siteConfigSchema);

export const SITE_CONFIG_ID = SITE_ID;
export default SiteConfig;