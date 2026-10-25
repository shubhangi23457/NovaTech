// Safe localStorage helpers: never throw, tolerate corrupted JSON.
export const storage = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  remove(key) {
    try { localStorage.removeItem(key); } catch { /* ignore */ }
  },
};

// Per-user keys so different accounts never share carts, wishlists or orders.
export const userKey = (userId, name) => `novatech:${userId || 'guest'}:${name}`;
