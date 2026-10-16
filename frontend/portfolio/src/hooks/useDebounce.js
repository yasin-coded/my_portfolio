import { useState, useEffect } from 'react';

/**
 * useDebounce hook
 * @param {any} value Value to debounce
 * @param {number} delay Delay in milliseconds (default 400ms per SPEC F-8)
 * @returns {any} Debounced value
 */
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
