/**
 * UI slice — transient UI state shared across the admin app.
 *
 * Includes:
 *  - Sidebar collapsed flag (persisted)
 *  - Open menu keys in sidebar (persisted)
 *  - Global confirm modal state (NOT persisted)
 *  - Per-entity filters (search/flags) (persisted)
 *  - Per-entity pagination (page/limit) (persisted)
 */
export const createUiSlice = (set, get) => ({
  ui: {
    // Sidebar
    collapsed: false,
    openKeys: [], // array of menu keys currently expanded

    // Global confirm modal — used by GlobalConfirm component
    confirm: null, // { id, title, message, confirmText, confirmStyle, onConfirm }

    // Per-entity filter state: { mainTrees: { search, showInactive }, ... }
    filters: {},

    // Per-entity pagination: { mainTrees: { page, limit }, ... }
    pagination: {},

    // ── Sidebar actions ───────────────────────────────────────
    setCollapsed: (collapsed) =>
      set((s) => ({ ui: { ...s.ui, collapsed } }), false, 'ui/setCollapsed'),

    toggleCollapsed: () =>
      set(
        (s) => ({ ui: { ...s.ui, collapsed: !s.ui.collapsed } }),
        false,
        'ui/toggleCollapsed',
      ),

    setOpenKeys: (keys) => {
      const arr = Array.isArray(keys) ? keys : [...keys];
      set((s) => ({ ui: { ...s.ui, openKeys: arr } }), false, 'ui/setOpenKeys');
    },

    toggleOpenKey: (key) =>
      set(
        (s) => {
          const has = s.ui.openKeys.includes(key);
          const next = has
            ? s.ui.openKeys.filter((k) => k !== key)
            : [...s.ui.openKeys, key];
          return { ui: { ...s.ui, openKeys: next } };
        },
        false,
        'ui/toggleOpenKey',
      ),

    // ── Confirm modal ─────────────────────────────────────────
    openConfirm: (opts) =>
      set(
        (s) => ({
          ui: {
            ...s.ui,
            confirm: {
              id: opts.id ?? `confirm-${Date.now()}-${Math.random()}`,
              title: opts.title || 'Xác nhận',
              message: opts.message || '',
              confirmText: opts.confirmText || 'Xác nhận',
              cancelText: opts.cancelText || 'Hủy',
              confirmStyle: opts.confirmStyle || 'primary', // 'primary' | 'danger'
              onConfirm: opts.onConfirm || null,
            },
          },
        }),
        false,
        'ui/openConfirm',
      ),

    closeConfirm: () =>
      set(
        (s) => ({ ui: { ...s.ui, confirm: null } }),
        false,
        'ui/closeConfirm',
      ),

    // ── Per-entity filters ────────────────────────────────────
    setFilter: (entityName, partial) =>
      set(
        (s) => ({
          ui: {
            ...s.ui,
            filters: {
              ...s.ui.filters,
              [entityName]: { ...(s.ui.filters[entityName] || {}), ...partial },
            },
          },
        }),
        false,
        `ui/setFilter/${entityName}`,
      ),

    clearFilter: (entityName) =>
      set(
        (s) => {
          const next = { ...s.ui.filters };
          delete next[entityName];
          return { ui: { ...s.ui, filters: next } };
        },
        false,
        `ui/clearFilter/${entityName}`,
      ),

    // ── Per-entity pagination ─────────────────────────────────
    setPagination: (entityName, partial) =>
      set(
        (s) => ({
          ui: {
            ...s.ui,
            pagination: {
              ...s.ui.pagination,
              [entityName]: {
                ...(s.ui.pagination[entityName] || {}),
                ...partial,
              },
            },
          },
        }),
        false,
        `ui/setPagination/${entityName}`,
      ),

    // ── Reset ─────────────────────────────────────────────────
    resetUi: () =>
      set(
        (s) => ({
          ui: {
            ...s.ui,
            confirm: null,
            filters: {},
            pagination: {},
            // collapsed & openKeys are intentionally NOT reset
            // (managed by user preferences / persist)
          },
        }),
        false,
        'ui/resetUi',
      ),
  },
});

export default createUiSlice;