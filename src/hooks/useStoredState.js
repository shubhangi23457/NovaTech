import { useCallback, useEffect, useState } from 'react';
import { storage } from '../utils/storage.js';

/**
 * useState that persists to localStorage under `key`.
 * - Reads safely (corrupted JSON -> fallback, then `sanitize`).
 * - When `key` changes (e.g. a different user signs in) the matching data is loaded immediately.
 * - Syncs between browser tabs through the `storage` event.
 */
export function useStoredState(key, fallback, sanitize = (v) => v) {
  const read = useCallback(() => sanitize(storage.get(key, fallback)), [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const [slot, setSlot] = useState(() => ({ key, value: read() }));

  let current = slot;
  if (slot.key !== key) {
    current = { key, value: read() };
    setSlot(current); // derived-state pattern: re-render immediately with the new key's data
  }

  useEffect(() => { storage.set(current.key, current.value); }, [current]);

  useEffect(() => {
    const onStorage = (e) => { if (e.key === key) setSlot({ key, value: read() }); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key, read]);

  const update = useCallback((next) => {
    setSlot((prev) => {
      const base = prev.key === key ? prev.value : read();
      return { key, value: typeof next === 'function' ? next(base) : next };
    });
  }, [key, read]);

  return [current.value, update];
}
