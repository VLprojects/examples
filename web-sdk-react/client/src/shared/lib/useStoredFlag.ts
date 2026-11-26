import { useState } from 'react';

const read = (key: string, fallback: boolean) => {
  try {
    const stored = localStorage.getItem(key);

    return stored === null ? fallback : stored === 'true';
  } catch {
    return fallback;
  }
};

export function useStoredFlag(key: string, fallback: boolean): [boolean, (value: boolean) => void] {
  const [flag, setFlag] = useState(() => read(key, fallback));

  const update = (value: boolean) => {
    setFlag(value);

    try {
      localStorage.setItem(key, String(value));
    } catch {
      return;
    }
  };

  return [flag, update];
}
