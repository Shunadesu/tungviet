/**
 * Selection slice — tracks selected row IDs per entity.
 *
 * Lets list pages share a common bulk-action mental model
 * without duplicating `useState(selectedIds)` in every page.
 */
export const createSelectionSlice = (set, get) => ({
  selection: {
    // { mainTrees: ['id1', 'id2'], members: ['idA'], ... }
    byEntity: {},

    setSelected: (entityName, ids) =>
      set(
        (s) => ({
          selection: {
            ...s.selection,
            byEntity: { ...s.selection.byEntity, [entityName]: [...ids] },
          },
        }),
        false,
        `selection/setSelected/${entityName}`,
      ),

    toggleOne: (entityName, id) =>
      set(
        (s) => {
          const current = s.selection.byEntity[entityName] || [];
          const has = current.includes(id);
          const next = has ? current.filter((x) => x !== id) : [...current, id];
          return {
            selection: {
              ...s.selection,
              byEntity: { ...s.selection.byEntity, [entityName]: next },
            },
          };
        },
        false,
        `selection/toggleOne/${entityName}`,
      ),

    clearEntity: (entityName) =>
      set(
        (s) => {
          const next = { ...s.selection.byEntity };
          delete next[entityName];
          return { selection: { ...s.selection, byEntity: next } };
        },
        false,
        `selection/clearEntity/${entityName}`,
      ),

    clearAll: () =>
      set(
        (s) => ({ selection: { ...s.selection, byEntity: {} } }),
        false,
        'selection/clearAll',
      ),

    getSelectedIds: (entityName) => {
      const s = get();
      return s.selection.byEntity[entityName] || [];
    },
  },
});

export default createSelectionSlice;