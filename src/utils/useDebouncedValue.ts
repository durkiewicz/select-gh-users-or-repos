import { useEffect, useState } from 'react';

export function useDebouncedValue<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const id = setTimeout(setDebouncedValue, delay, value);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debouncedValue;
}
