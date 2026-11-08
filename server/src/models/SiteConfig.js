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

const certificateSchema = new mongoose.Schema(
  {
    name: {
      vi: { type: String, trim: true, default: '' },
      en: { type: String, trim: true, default: '' },
    },
    description: {
      vi: { type: String, trim: true, default: '' },
      en: { type: String, trim: true, default: '' },
    },
    imageUrl: { type: String, default: '' },
    externalUrl: { type: String, default: '' },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { _id: true }
);

const testimonialSchema = new mongoose.Schema(
  {
    author: {
      vi: { type: String, trim: true, default: '' },
      en: { type: String, trim: true, default: '' },
    },
    role: {
      vi: { type: String, trim: true, default: '' },
      en: { type: String, trim: true, default: '' },
    },
    company: {
      vi: { type: String, trim: true, default: '' },
      en: { type: String, trim: true, default: '' },
    },
    quote: {
      vi: { type: String, trim: true, default: '' },
      en: { type: String, trim: true, default: '' },
    },
    avatarUrl: { type: String, default: '' },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { _id: true }
);

const ecovadisSchema = new mongoose.Schema(
  {
    eyebrow: {
      vi: { type: String, trim: true, default: '' },
      en: { type: String, trim: true, default: '' },
    },
    title: {
      vi: { type: String, trim: true, default: '' },
      en: { type: String, trim: true, default: '' },
    },
    subtitle: {
      vi: { type: String, trim: true, default: '' },
      en: { type: String, trim: true, default: '' },
    },
    imageUrl: { type: String, default: '' },
    badgeLabel: { type: String, default: '' },
    link1Label: {
      vi: { type: String, trim: true, default: '' },
      en: { type: String, trim: true, default: '' },
    },
    link1Href: { type: String, default: '' },
    link2Label: {
      vi: { type: String, trim: true, default: '' },
      en: { type: String, trim: true, default: '' },
    },
    link2Href: { type: String, default: '' },
    active: { type: Boolean, default: true },
  },
  { _id: false }
);

const homeSectionSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      enum: [
        'hero',
        'whyUs',
        'process',
        'featuredProducts',
        'newProducts',
        'popularProducts',
        'markets',
        'industries',
        'fastFacts',
        'coreValues',
        'certificates',
        'testimonials',
        'blog',
        'partners',
        'members',
        'quoteSection',
        'locations',
        'ecovadis',
      ],
      required: true,
    },
    enabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    title: {
      vi: { type: String, default: '' },
      en: { type: String, default: '' },
    },
    subtitle: {
      vi: { type: String, default: '' },
      en: { type: String, default: '' },
    },
    limit: { type: Number, default: 0 },
  },
  { _id: true }
);

const footerSchema = new mongoose.Schema(
  {
    // Không đặt giá trị mặc định giả (SĐT/email/địa chỉ/copyright).
    // Nếu Admin chưa cấu hình thì để trống — client sẽ ẩn phần tương ứng.
    about: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
    copyright: { type: String, default: '' },
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
    certificates: { type: [certificateSchema], default: [] },
    testimonials: { type: [testimonialSchema], default: [] },
    homeSections: { type: [homeSectionSchema], default: [] },
    ecovadis: { type: ecovadisSchema, default: () => ({}) },
    seo: { type: seoSchema, default: () => ({}) },
    faviconUrl: { type: String, default: null },
    faviconFilename: { type: String, default: null },
  },
  { timestamps: true }
);

const SiteConfig = mongoose.model('SiteConfig', siteConfigSchema);

export const SITE_CONFIG_ID = SITE_ID;
export default SiteConfig;