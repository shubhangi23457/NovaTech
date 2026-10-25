import { createContext, useCallback, useEffect, useMemo } from 'react';
import { useStoredState } from '../hooks/useStoredState.js';
import { useAuth } from '../hooks/useAuth.js';
import { storage, userKey } from '../utils/storage.js';
import { evaluateAchievements } from '../services/accountService.js';

export const WishlistContext = createContext(null);

export const sanitizeWishlist = (raw) => {
  const seen = new Set();
  return (Array.isArray(raw) ? raw : [])
    .filter((i) => i && typeof i.id === 'string' && typeof i.name === 'string' && Number.isFinite(i.price) && !seen.has(i.id) && seen.add(i.id))
    .map((i) => ({ ...i, quantity: Math.min(10, Math.max(1, Math.floor(Number(i.quantity) || 1))) }));
};

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [items, setItems] = useStoredState(userKey(userId, 'wishlist'), [], sanitizeWishlist);

  useEffect(() => {
    if (!userId) return;
    const guestKey = userKey(null, 'wishlist');
    const guest = sanitizeWishlist(storage.get(guestKey, []));
    if (guest.length) {
      setItems((prev) => sanitizeWishlist([...prev, ...guest])); // sanitize drops duplicate ids
      storage.remove(guestKey);
    }
  }, [userId, setItems]);

  const addToWishlist = useCallback((p) => {
    if (!p || typeof p.id !== 'string' || !Number.isFinite(p.price)) return false;
    if (userId && !items.some((i) => i.id === p.id)) evaluateAchievements(userId, { wishlistCount: items.length + 1 });
    setItems((prev) => (prev.some((i) => i.id === p.id) ? prev : [...prev, {
      id: p.id, name: p.name, price: p.price, oldPrice: p.oldPrice || null, image: p.image || '',
      category: p.category || '', rating: p.rating ?? null, inStock: p.inStock !== false, discount: p.discount || 0, quantity: 1,
    }]));
    return true;
  }, [items, userId, setItems]);

  const removeFromWishlist = useCallback((id) => setItems((prev) => prev.filter((i) => i.id !== id)), [setItems]);

  const toggleWishlist = useCallback((p) => {
    const exists = items.some((i) => i.id === p.id);
    if (exists) setItems((prev) => prev.filter((i) => i.id !== p.id));
    else addToWishlist(p);
    return !exists; // true = added, false = removed
  }, [items, addToWishlist, setItems]);

  const setQuantity = useCallback((id, delta) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: Math.min(10, Math.max(1, i.quantity + delta)) } : i)));
  }, [setItems]);

  const clearWishlist = useCallback(() => setItems([]), [setItems]);

  const value = useMemo(() => ({
    items,
    count: items.length,
    isInWishlist: (id) => items.some((i) => i.id === id),
    addToWishlist, removeFromWishlist, toggleWishlist, setQuantity, clearWishlist,
  }), [items, addToWishlist, removeFromWishlist, toggleWishlist, setQuantity, clearWishlist]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
