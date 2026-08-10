import { useEffect, useState } from 'react';

/**
 * Debounce a value — returns the latest value only after `delay` ms of stable state.
 * Useful for search inputs that should not refetch on every keystroke.
 */
export default function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
