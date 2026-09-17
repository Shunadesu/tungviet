import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAdminStore } from '../store/adminStore';

// ── Entity slice helper ────────────────────────────────────────────

/**
 * Hook wrapper — returns the named entity slice and a few helpers.
 * @param {string} entityName - 'mainTrees' | 'marketTrees' | 'categories' | 'products'
 */
export const useAdminStoreEntity = (entityName) => {
  const slice = useAdminStore((s) => s[entityName]);

  if (!slice) {
    throw new Error(`[useAdminStoreEntity] Unknown entity: "${entityName}"`);
  }

  const getItems = useCallback(
    (ids) => ids.map((id) => slice.items.get(id)).filter(Boolean),
    [slice.items],
  );

  const getItem = useCallback(
    (id) => (id ? slice.items.get(id) : undefined),
    [slice.items],
  );

  return {
    ...slice,
    /** Array of all cached items in list order */
    allItems: slice.list.map((id) => slice.items.get(id)).filter(Boolean),
    /** Lookup by id(s) */
    getItem,
    getItems,
  };
};

// ── UI slice helper ────────────────────────────────────────────────

/**
 * Sidebar state + global confirm modal + filter/pagination helpers.
 * Returns the full `ui` substate. Use individual selectors for fine-grained
 * re-renders (e.g. `useUiSlice(s => s.collapsed)`).
 */
export const useUiSlice = (selector) =>
  useAdminStore((s) => (selector ? selector(s.ui) : s.ui));

// ── Selection slice helper ─────────────────────────────────────────

/** Read & mutate `selectedIds` for a given entity. */
export const useEntitySelection = (entityName) => {
  const ids = useAdminStore(
    useShallow((s) => s.selection.byEntity[entityName] || []),
  );
  const setSelected = useAdminStore((s) => s.selection.setSelected);
  const toggleOne = useAdminStore((s) => s.selection.toggleOne);
  const clearEntity = useAdminStore((s) => s.selection.clearEntity);

  return {
    selectedIds: ids,
    setSelected: useCallback((next) => setSelected(entityName, next), [entityName, setSelected]),
    toggleOne: useCallback((id) => toggleOne(entityName, id), [entityName, toggleOne]),
    clearSelection: useCallback(() => clearEntity(entityName), [entityName, clearEntity]),
  };
};

// ── Notification slice helper ──────────────────────────────────────

/**
 * Drop-in replacement for the old `useNotification()` hook.
 * Returns `{ notifications, addNotification, removeNotification }`.
 */
export const useNotification = () => {
  const list = useAdminStore(useShallow((s) => s.notifications.list));
  const add = useAdminStore((s) => s.notifications.add);
  const remove = useAdminStore((s) => s.notifications.remove);

  const addNotification = useCallback(
    (message, type = 'success', opts) => add(message, type, opts),
    [add],
  );
  const removeNotification = useCallback((id) => remove(id), [remove]);

  return { notifications: list, addNotification, removeNotification };
};

export default useAdminStoreEntity;

// Re-export useAdminStore directly so pages can use it
export { useAdminStore };