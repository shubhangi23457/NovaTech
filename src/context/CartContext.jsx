import { createContext, useCallback, useEffect, useMemo } from 'react';
import { useStoredState } from '../hooks/useStoredState.js';
import { useAuth } from '../hooks/useAuth.js';
import { storage, userKey } from '../utils/storage.js';

export const CartContext = createContext(null);
export const MAX_QTY = 10;

const clampQty = (q) => Math.min(MAX_QTY, Math.max(1, Math.floor(Number(q) || 1)));

// Drop malformed entries from corrupted storage.
export const sanitizeCart = (raw) =>
  (Array.isArray(raw) ? raw : [])
    .filter((i) => i && typeof i.id === 'string' && typeof i.name === 'string' && Number.isFinite(i.price) && i.price > 0 && Number(i.quantity) > 0)
    .map((i) => ({ id: i.id, name: i.name, price: i.price, image: i.image || '', category: i.category || '', discount: i.discount || 0, quantity: clampQty(i.quantity) }));

export function mergeCarts(base, extra) {
  const map = new Map(base.map((i) => [i.id, { ...i }]));
  extra.forEach((i) => {
    const hit = map.get(i.id);
    if (hit) hit.quantity = clampQty(hit.quantity + i.quantity);
    else map.set(i.id, { ...i });
  });
  return [...map.values()];
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [items, setItems] = useStoredState(userKey(userId, 'cart'), [], sanitizeCart);

  // When someone signs in, fold their guest cart into their own cart (merging duplicates).
  useEffect(() => {
    if (!userId) return;
    const guestKey = userKey(null, 'cart');
    const guest = sanitizeCart(storage.get(guestKey, []));
    if (guest.length) {
      setItems((prev) => mergeCarts(prev, guest));
      storage.remove(guestKey);
    }
  }, [userId, setItems]);

  const addToCart = useCallback((product, quantity = 1) => {
    if (!product || typeof product.id !== 'string' || !Number.isFinite(product.price) || product.price <= 0) {
      return { ok: false, reason: 'invalid' };
    }
    if (product.inStock === false) return { ok: false, reason: 'out-of-stock' };
    const line = { id: product.id, name: product.name, price: product.price, image: product.image || '', category: product.category || '', discount: product.discount || 0, quantity: clampQty(quantity) };
    setItems((prev) => mergeCarts(prev, [line]));
    return { ok: true };
  }, [setItems]);

  const removeFromCart = useCallback((id) => setItems((prev) => prev.filter((i) => i.id !== id)), [setItems]);

  const changeQuantity = useCallback((id, delta) => {
    setItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: Math.min(MAX_QTY, i.quantity + delta) } : i))
        .filter((i) => i.quantity > 0) // quantity reaching zero removes the line
    );
  }, [setItems]);

  const increaseQuantity = useCallback((id) => changeQuantity(id, 1), [changeQuantity]);
  const decreaseQuantity = useCallback((id) => changeQuantity(id, -1), [changeQuantity]);
  const clearCart = useCallback(() => setItems([]), [setItems]);

  const value = useMemo(() => ({
    items,
    totalItems: items.reduce((n, i) => n + i.quantity, 0),
    subtotal: items.reduce((s, i) => s + i.price * i.quantity, 0),
    isInCart: (id) => items.some((i) => i.id === id),
    addToCart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart,
  }), [items, addToCart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
