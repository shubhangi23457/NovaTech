import { useContext } from 'react';
import { WishlistContext } from '../context/WishlistContext.jsx';

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside its provider.');
  return ctx;
}
