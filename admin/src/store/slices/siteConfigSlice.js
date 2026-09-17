/**
 * SiteConfig slice — singleton (non-entity).
 *
 * Loads ALL site config in one request on app startup and keeps it in memory.
 * Individual sections are mutated in-place so other parts of the UI see updates
 * immediately without a full reload.
 *
 * Sections:
 *  logo, favicon, heroSlides, aboutSlides, about, fastFacts,
 *  coreValues, seo, footer, floatingContacts,
 *  members, leadership, locations
 */
import adminApi from '../../api/adminApi';

export const createSiteConfigSlice = () => (set, get) => ({
  // ── State ────────────────────────────────────────────────
  data: {
    logo: null,
    favicon: null,
    heroSlides: [],
    aboutSlides: [],
    about: null,
    fastFacts: null,
    coreValues: [],
    seo: null,
    footer: null,
    floatingContacts: [],
    members: [],
    leadership: [],
    locations: [],
  },
  loading: false,
  error: null,

  // ── Load all config once ──────────────────────────────────
  load: async () => {
    set((s) => ({ siteConfig: { ...s.siteConfig, loading: true, error: null } }),
      false, 'siteConfig/load/start');

    try {
      const [siteRes, membersRes, leadershipRes, locationsRes] = await Promise.all([
        adminApi.getSiteConfig(),
        adminApi.getMembers(),
        adminApi.getLeadership(),
        adminApi.getLocations(),
      ]);

      const site = siteRes.data ?? {};

      set((s) => ({
        siteConfig: {
          ...s.siteConfig,
          data: {
            logo: site.logo ?? null,
            favicon: site.favicon ?? null,
            heroSlides: site.heroSlides ?? [],
            aboutSlides: site.aboutSlides ?? [],
            about: site.about ?? null,
            fastFacts: site.fastFacts ?? null,
            coreValues: site.coreValues ?? [],
            seo: site.seo ?? null,
            footer: site.footer ?? null,
            floatingContacts: site.floatingContacts ?? [],
            members: Array.isArray(membersRes.data?.data)
              ? membersRes.data.data
              : membersRes.data ?? [],
            leadership: Array.isArray(leadershipRes.data?.data)
              ? leadershipRes.data.data
              : leadershipRes.data ?? [],
            locations: Array.isArray(locationsRes.data?.data)
              ? locationsRes.data.data
              : locationsRes.data ?? [],
          },
          loading: false,
        },
      }), false, 'siteConfig/load/success');
    } catch (err) {
      set((s) => ({
        siteConfig: {
          ...s.siteConfig,
          error: err.message,
          loading: false,
        },
      }), false, 'siteConfig/load/error');
    }
  },

  // ── Hero slides ───────────────────────────────────────────
  addHeroSlide: async (data) => {
    const res = await adminApi.addHeroSlide(data);
    const slide = res.data?.data ?? res.data;
    if (slide) {
      set((s) => ({
        siteConfig: {
          ...s.siteConfig,
          data: {
            ...s.siteConfig.data,
            heroSlides: [...s.siteConfig.data.heroSlides, slide],
          },
        },
      }), false, 'siteConfig/addHeroSlide');
    }
    return slide;
  },

  updateHeroSlide: async (id, data) => {
    const res = await adminApi.updateHeroSlide(id, data);
    const updated = res.data?.data ?? res.data;
    if (updated) {
      set((s) => ({
        siteConfig: {
          ...s.siteConfig,
          data: {
            ...s.siteConfig.data,
            heroSlides: s.siteConfig.data.heroSlides.map((s) =>
              s._id === id ? updated : s
            ),
          },
        },
      }), false, 'siteConfig/updateHeroSlide');
    }
    return updated;
  },

  deleteHeroSlide: async (id) => {
    await adminApi.deleteHeroSlide(id);
    set((s) => ({
      siteConfig: {
        ...s.siteConfig,
        data: {
          ...s.siteConfig.data,
          heroSlides: s.siteConfig.data.heroSlides.filter((s) => s._id !== id),
        },
      },
    }), false, 'siteConfig/deleteHeroSlide');
  },

  reorderHeroSlides: async (order) => {
    const prev = get().siteConfig.data.heroSlides;
    const ordered = order.map((o) => prev.find((s) => s._id === o._id)).filter(Boolean);
    set((s) => ({
      siteConfig: {
        ...s.siteConfig,
        data: { ...s.siteConfig.data, heroSlides: ordered },
      },
    }), false, 'siteConfig/reorderHeroSlides/optimistic');
    try {
      await adminApi.reorderHeroSlides(order);
    } catch {
      set((s) => ({
        siteConfig: {
          ...s.siteConfig,
          data: { ...s.siteConfig.data, heroSlides: prev },
        },
      }), false, 'siteConfig/reorderHeroSlides/rollback');
      throw err;
    }
  },

  // ── About slides ──────────────────────────────────────────
  addAboutSlide: async (data) => {
    const res = await adminApi.addAboutSlide(data);
    const slide = res.data?.data ?? res.data;
    if (slide) {
      set((s) => ({
        siteConfig: {
          ...s.siteConfig,
          data: {
            ...s.siteConfig.data,
            aboutSlides: [...s.siteConfig.data.aboutSlides, slide],
          },
        },
      }), false, 'siteConfig/addAboutSlide');
    }
    return slide;
  },

  updateAboutSlide: async (id, data) => {
    const res = await adminApi.updateAboutSlide(id, data);
    const updated = res.data?.data ?? res.data;
    if (updated) {
      set((s) => ({
        siteConfig: {
          ...s.siteConfig,
          data: {
            ...s.siteConfig.data,
            aboutSlides: s.siteConfig.data.aboutSlides.map((s) =>
              s._id === id ? updated : s
            ),
          },
        },
      }), false, 'siteConfig/updateAboutSlide');
    }
    return updated;
  },

  deleteAboutSlide: async (id) => {
    await adminApi.deleteAboutSlide(id);
    set((s) => ({
      siteConfig: {
        ...s.siteConfig,
        data: {
          ...s.siteConfig.data,
          aboutSlides: s.siteConfig.data.aboutSlides.filter((s) => s._id !== id),
        },
      },
    }), false, 'siteConfig/deleteAboutSlide');
  },

  reorderAboutSlides: async (order) => {
    const prev = get().siteConfig.data.aboutSlides;
    const ordered = order.map((o) => prev.find((s) => s._id === o._id)).filter(Boolean);
    set((s) => ({
      siteConfig: {
        ...s.siteConfig,
        data: { ...s.siteConfig.data, aboutSlides: ordered },
      },
    }), false, 'siteConfig/reorderAboutSlides/optimistic');
    try {
      await adminApi.reorderAboutSlides(order);
    } catch {
      set((s) => ({
        siteConfig: {
          ...s.siteConfig,
          data: { ...s.siteConfig.data, aboutSlides: prev },
        },
      }), false, 'siteConfig/reorderAboutSlides/rollback');
      throw err;
    }
  },

  // ── Text / object sections ────────────────────────────────
  updateAbout: async (data) => {
    const res = await adminApi.updateAbout(data);
    set((s) => ({
      siteConfig: {
        ...s.siteConfig,
        data: { ...s.siteConfig.data, about: res.data ?? data },
      },
    }), false, 'siteConfig/updateAbout');
  },

  updateFastFacts: async (data) => {
    const res = await adminApi.updateFastFacts(data);
    set((s) => ({
      siteConfig: {
        ...s.siteConfig,
        data: { ...s.siteConfig.data, fastFacts: res.data ?? data },
      },
    }), false, 'siteConfig/updateFastFacts');
  },

  updateCoreValues: async (data) => {
    const res = await adminApi.updateCoreValues(data);
    set((s) => ({
      siteConfig: {
        ...s.siteConfig,
        data: { ...s.siteConfig.data, coreValues: res.data ?? data },
      },
    }), false, 'siteConfig/updateCoreValues');
  },

  updateSeo: async (data) => {
    const res = await adminApi.updateSeo(data);
    set((s) => ({
      siteConfig: {
        ...s.siteConfig,
        data: { ...s.siteConfig.data, seo: res.data ?? data },
      },
    }), false, 'siteConfig/updateSeo');
  },

  updateFooter: async (data) => {
    const res = await adminApi.updateFooter(data);
    set((s) => ({
      siteConfig: {
        ...s.siteConfig,
        data: { ...s.siteConfig.data, footer: res.data ?? data },
      },
    }), false, 'siteConfig/updateFooter');
  },

  updateFloatingContacts: async (data) => {
    const res = await adminApi.updateFloatingContacts(data);
    set((s) => ({
      siteConfig: {
        ...s.siteConfig,
        data: { ...s.siteConfig.data, floatingContacts: res.data ?? data },
      },
    }), false, 'siteConfig/updateFloatingContacts');
  },

  // ── Logo ─────────────────────────────────────────────────
  uploadLogo: async (file) => {
    const res = await adminApi.uploadLogo(file);
    const logo = res.data ?? null;
    set((s) => ({
      siteConfig: {
        ...s.siteConfig,
        data: { ...s.siteConfig.data, logo },
      },
    }), false, 'siteConfig/uploadLogo');
    return logo;
  },

  clearLogo: async () => {
    await adminApi.clearLogo();
    set((s) => ({
      siteConfig: {
        ...s.siteConfig,
        data: { ...s.siteConfig.data, logo: null },
      },
    }), false, 'siteConfig/clearLogo');
  },

  // ── Favicon ───────────────────────────────────────────────
  uploadFavicon: async (file) => {
    const res = await adminApi.uploadFavicon(file);
    const favicon = res.data ?? null;
    set((s) => ({
      siteConfig: {
        ...s.siteConfig,
        data: { ...s.siteConfig.data, favicon },
      },
    }), false, 'siteConfig/uploadFavicon');
    return favicon;
  },

  clearFavicon: async () => {
    await adminApi.clearFavicon();
    set((s) => ({
      siteConfig: {
        ...s.siteConfig,
        data: { ...s.siteConfig.data, favicon: null },
      },
    }), false, 'siteConfig/clearFavicon');
  },
});

export default createSiteConfigSlice;
