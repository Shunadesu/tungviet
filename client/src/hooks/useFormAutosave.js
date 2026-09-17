import { useEffect, useRef } from 'react';

/**
 * useFormAutosave — persists form state to localStorage and restores it on mount.
 *
 * Usage:
 *   const { getSaved, save, clear } = useFormAutosave('quote-request-form');
 *   const saved = getSaved(); // null or the previously saved state object
 *
 * What it does:
 *  - Saves to localStorage on every `save(values)` call (debounced internally).
 *  - Restores from localStorage on first mount so the user doesn't lose data
 *    if they accidentally refresh or close the tab mid-form.
 *  - `clear()` removes the saved state — call after a successful submission.
 *  - Stores a versioned key so schema migrations are possible in the future.
 *
 * Data saved: { version, timestamp, values }
 */
const STORAGE_KEY_VERSION = 1;
const STORAGE_PREFIX = 'tv_autosave_';

export const useFormAutosave = (formKey) => {
  const saveTimerRef = useRef(null);

  const storageKey = `${STORAGE_PREFIX}${formKey}`;

  /**
   * Retrieve saved form state, or null if nothing was saved or the version
   * doesn't match. Automatically deletes stale entries on read.
   */
  const getSaved = () => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== STORAGE_KEY_VERSION) {
        clear(); // version mismatch — discard
        return null;
      }
      // Expire saved data after 7 days.
      const age = Date.now() - (parsed.timestamp || 0);
      if (age > 7 * 24 * 60 * 60 * 1000) {
        clear();
        return null;
      }
      return parsed.values ?? null;
    } catch {
      return null;
    }
  };

  /**
   * Debounce-save values to localStorage. The actual write happens up to
   * 800ms after the last call to `save()`, preventing excessive writes
   * while the user is actively typing.
   */
  const save = (values) => {
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            version: STORAGE_KEY_VERSION,
            timestamp: Date.now(),
            values,
          })
        );
      } catch {
        // localStorage may be full or disabled (private browsing on some devices).
        // Fail silently — losing autosave is not a fatal error.
      }
    }, 800);
  };

  /** Remove the saved state — call after a successful form submission. */
  const clear = () => {
    clearTimeout(saveTimerRef.current);
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  };

  // Clean up the debounce timer when the component unmounts.
  useEffect(() => {
    return () => clearTimeout(saveTimerRef.current);
  }, []);

  return { getSaved, save, clear };
};

export default useFormAutosave;
