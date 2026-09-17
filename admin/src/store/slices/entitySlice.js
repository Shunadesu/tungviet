/**
 * Generic entity slice factory.
 * Each slice manages:
 *  - items: Map<id, item> for O(1) lookups
 *  - list:  ordered array of ids
 *  - loading / error state
 *  - fetch/fetchAll with built-in caching
 *
 * Provides per-entity `create/update/remove/reorder` mutations
 * so list pages don't have to roll their own state plumbing.
 *
 * @param {string} entityName - key under which the slice lives in the store
 * @param {object} api - object with the matching adminApi.* methods
 * @param {(id) => Promise} api.getOne
 * @param {(params) => Promise} api.getAll
 * @param {(data) => Promise} api.create
 * @param {(id, data) => Promise} api.update
 * @param {(id) => Promise} api.remove
 * @param {(ids) => Promise} api.removeMany (optional)
 * @param {(order) => Promise} api.reorder (optional)
 */
export const createEntitySlice = (entityName, api) => (set, get) => ({
  items: new Map(),
  list: [],
  loading: false,
  error: null,

  /** Fetch a single item by id — uses cache if already loaded */
  fetch: async (id) => {
    const slice = get()[entityName];
    if (slice.items.has(id)) return slice.items.get(id);

    set((s) => ({
      [entityName]: { ...s[entityName], loading: true, error: null },
    }), false, `${entityName}/fetch/start`);

    try {
      const res = await api.getOne(id);
      const item = res.data?.data ?? res.data;
      set((s) => ({
        [entityName]: {
          ...s[entityName],
          items: new Map(s[entityName].items).set(id, item),
          loading: false,
        },
      }), false, `${entityName}/fetch/success`);
      return item;
    } catch (err) {
      set((s) => ({
        [entityName]: { ...s[entityName], error: err.message, loading: false },
      }), false, `${entityName}/fetch/error`);
      throw err;
    }
  },

  /** Fetch all items — uses cache if already loaded */
  fetchAll: async (params) => {
    const slice = get()[entityName];
    if (slice.list.length > 0) {
      return slice.list.map((id) => slice.items.get(id));
    }

    set((s) => ({
      [entityName]: { ...s[entityName], loading: true, error: null },
    }), false, `${entityName}/fetchAll/start`);

    try {
      const res = await api.getAll(params);
      const items = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data) ? res.data : [];

      const newItems = new Map();
      const newList = [];
      items.forEach((item) => {
        newItems.set(item._id, item);
        newList.push(item._id);
      });

      set((s) => {
        const mergedItems = new Map([...s[entityName].items, ...newItems]);
        const mergedList = [
          ...s[entityName].list,
          ...newList.filter((id) => !s[entityName].items.has(id)),
        ];
        return {
          [entityName]: {
            ...s[entityName],
            items: mergedItems,
            list: mergedList,
            loading: false,
          },
        };
      }, false, `${entityName}/fetchAll/success`);

      return items;
    } catch (err) {
      set((s) => ({
        [entityName]: { ...s[entityName], error: err.message, loading: false },
      }), false, `${entityName}/fetchAll/error`);
      throw err;
    }
  },

  /** Force refetch all items (bust cache) */
  invalidateList: () => {
    set((s) => ({
      [entityName]: {
        ...s[entityName],
        list: [],
        loading: false,
        error: null,
      },
    }), false, `${entityName}/invalidateList`);
  },

  /** Insert or update a single item in the cache */
  setItem: (id, item) => {
    set((s) => ({
      [entityName]: {
        ...s[entityName],
        items: new Map(s[entityName].items).set(id, item),
        list: s[entityName].list.includes(id)
          ? s[entityName].list
          : [...s[entityName].list, id],
      },
    }), false, `${entityName}/setItem`);
  },

  /** Remove an item from the cache */
  removeItem: (id) => {
    set((s) => {
      const newItems = new Map(s[entityName].items);
      newItems.delete(id);
      return {
        [entityName]: {
          ...s[entityName],
          items: newItems,
          list: s[entityName].list.filter((i) => i !== id),
        },
      };
    }, false, `${entityName}/removeItem`);
  },

  // ── Mutations (server roundtrip + cache update) ─────────────

  /** Create a new entity. Returns the created item. */
  create: async (data) => {
    const res = await api.create(data);
    const item = res.data?.data ?? res.data;
    if (item && item._id) {
      get()[entityName].setItem(item._id, item);
    }
    return item;
  },

  /** Update an entity. Returns the updated item. */
  update: async (id, data) => {
    const res = await api.update(id, data);
    const item = res.data?.data ?? res.data;
    if (item && item._id) {
      get()[entityName].setItem(id, item);
    } else if (data) {
      // Fallback: merge partial response into cached item.
      const existing = get()[entityName].items.get(id);
      if (existing) get()[entityName].setItem(id, { ...existing, ...data });
    }
    return item;
  },

  /** Remove a single item. */
  remove: async (id) => {
    await api.remove(id);
    get()[entityName].removeItem(id);
  },

  /** Bulk remove. */
  removeMany: async (ids) => {
    if (!api.removeMany) {
      // Fallback: sequential remove
      await Promise.all(ids.map((id) => api.remove(id)));
      ids.forEach((id) => get()[entityName].removeItem(id));
      return;
    }
    await api.removeMany(ids);
    ids.forEach((id) => get()[entityName].removeItem(id));
  },

  /**
   * Reorder items. Accepts an array of { _id, order } and applies
   * optimistic local ordering, then commits to server.
   */
  reorder: async (order) => {
    const previous = get()[entityName].list;
    // Optimistic update
    const newList = order.map((o) => o._id);
    set((s) => ({
      [entityName]: { ...s[entityName], list: newList },
    }), false, `${entityName}/reorder/optimistic`);

    try {
      if (api.reorder) {
        await api.reorder(order);
      }
    } catch (err) {
      // Rollback on failure
      set((s) => ({
        [entityName]: { ...s[entityName], list: previous },
      }), false, `${entityName}/reorder/rollback`);
      throw err;
    }
  },
});

export default createEntitySlice;