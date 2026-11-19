import { useEffect, useState } from 'react';

/**
 * Debounce a value — returns the latest value only after `delay` ms of stable state.
 * Dùng cho ô tìm kiếm để không gọi API liên tục khi gõ.
 *
 * @param {*} value
 * @param {number} delay
 */
export default function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
