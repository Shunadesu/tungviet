/**
 * Reset the entire store back to its initial state.
 *
 * Called on logout so cached entity data, filters, selection,
 * notifications, etc. don't leak between user sessions.
 *
 * Persisted UI state (collapsed, openKeys, filters, pagination)
 * is intentionally NOT cleared — those belong to the local
 * environment, not the user's session.
 */
export const resetAdminStore = (store) => {
  if (!store) return;

  store.setState((s) => {
    const next = {};

    // Keep `ui` shape but reset its transient bits; preserve user prefs.
    next.ui = {
      ...s.ui,
      confirm: null,
      filters: {},
      pagination: {},
    };

    // Wipe selection entirely.
    next.selection = { byEntity: {} };

    // Wipe notifications.
    next.notifications = { list: [] };

    // Reset every entity slice back to factory defaults.
    const entityNames = [
      'mainTrees',
      'marketTrees',
      'categories',
      'products',
      'members',
      'locations',
      'leadership',
      'partners',
      'posts',
      'postCategories',
      'orders',
      'productColumns',
      'quoteSubmissions',
    ];

    const singleNames = ['siteConfig'];
    entityNames.forEach((name) => {
      if (s[name]) {
        next[name] = {
          items: new Map(),
          list: [],
          loading: false,
          error: null,
        };
      }
    });

    if (s.siteConfig) {
      next.siteConfig = {
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
      };
    }

    return next;
  });
};

export default resetAdminStore;