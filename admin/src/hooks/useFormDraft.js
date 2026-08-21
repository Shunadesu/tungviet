import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Auto save + restore form data via sessionStorage.
 *
 * Behavior:
 *   - On mount: if `key` exists in sessionStorage, load it and call `setValue`
 *     so the form rehydrates with the draft.
 *   - On every change of `value`: debounce-save to sessionStorage.
 *   - `clearDraft()` removes the stored value (e.g. after a successful Save).
 *
 * Params:
 *   key      unique storage key, e.g. "draft:product:new"
 *   value    current form data (object)
 *   setValue React state setter (e.g. setFormData)
 *   options
 *     enabled      boolean to disable the hook (default true)
 *     debounceMs   ms to wait before persisting after a change (default 500)
 *     skipInitial  skip the first value change after mount (default true)
 *
 * Returns:
 *   {
 *     loadedFromDraft, // true once a draft was rehydrated on this mount
 *     draftSavedAt,    // ISO string of the latest persisted save
 *     clearDraft,      // () => void - remove the persisted draft
 *   }
 */
const safeGet = (key) => {
  try {
    return sessionStorage.getItem(key);
  } catch (_) {
    return null;
  }
};

const safeSet = (key, raw) => {
  try {
    sessionStorage.setItem(key, raw);
    return true;
  } catch (err) {
    console.warn('[useFormDraft] failed to persist draft', err);
    return false;
  }
};

const safeRemove = (key) => {
  try {
    sessionStorage.removeItem(key);
  } catch (_) {
    /* noop */
  }
};

export function useFormDraft(key, value, setValue, options = {}) {
  const { enabled = true, debounceMs = 500, skipInitial = true } = options;
  const [loadedFromDraft, setLoadedFromDraft] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState(null);
  const firstRunRef = useRef(true);

  // Hydrate on mount when key changes.
  useEffect(() => {
    if (!enabled || !key) {
      firstRunRef.current = true;
      return;
    }
    firstRunRef.current = true;

    const raw = safeGet(key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          setDraftSavedAt(parsed.__savedAt || null);
          setLoadedFromDraft(true);
          if (typeof setValue === 'function') {
            const { __savedAt: _ignored, ...rest } = parsed;
            setValue(rest);
          }
        }
      } catch (err) {
        console.warn('[useFormDraft] corrupted draft, ignoring', err);
        safeRemove(key);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);

  // Debounced save on every value change.
  useEffect(() => {
    if (!enabled || !key) return;
    if (skipInitial && firstRunRef.current) {
      firstRunRef.current = false;
      return;
    }
    const timer = setTimeout(() => {
      try {
        const payload = { ...value, __savedAt: new Date().toISOString() };
        const ok = safeSet(key, JSON.stringify(payload));
        if (ok) setDraftSavedAt(payload.__savedAt);
      } catch (err) {
        console.warn('[useFormDraft] failed to serialize draft', err);
      }
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [key, value, enabled, debounceMs, skipInitial]);

  const clearDraft = useCallback(() => {
    if (!key) return;
    safeRemove(key);
    setLoadedFromDraft(false);
    setDraftSavedAt(null);
  }, [key]);

  return { loadedFromDraft, draftSavedAt, clearDraft };
}

export default useFormDraft;