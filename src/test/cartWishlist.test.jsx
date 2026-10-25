import { act, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext.jsx';
import { CartProvider, MAX_QTY, mergeCarts, sanitizeCart } from '../context/CartContext.jsx';
import { WishlistProvider } from '../context/WishlistContext.jsx';
import { useCart } from '../hooks/useCart.js';
import { useWishlist } from '../hooks/useWishlist.js';
import ProductCard from '../components/ProductCard.jsx';
import { normalizeProduct } from '../services/productService.js';
import { rawProducts } from './fixtures.js';
import { renderWithProviders } from './utils.jsx';

const [phone, laptop] = rawProducts.map(normalizeProduct);

const wrapper = ({ children }) => (
  <MemoryRouter><AuthProvider><CartProvider><WishlistProvider>{children}</WishlistProvider></CartProvider></AuthProvider></MemoryRouter>
);

describe('cart', () => {
  it('adds, merges duplicates, and computes totals', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => { result.current.addToCart(phone, 1); result.current.addToCart(phone, 2); });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(3);
    expect(result.current.totalItems).toBe(3);
    expect(result.current.subtotal).toBe(phone.price * 3);
  });
  it('increases, decreases and removes at zero', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => { result.current.addToCart(phone, 1); });
    act(() => result.current.increaseQuantity(phone.id));
    expect(result.current.items[0].quantity).toBe(2);
    act(() => result.current.decreaseQuantity(phone.id));
    act(() => result.current.decreaseQuantity(phone.id));
    expect(result.current.items).toHaveLength(0);
  });
  it('caps quantity and rejects invalid / out-of-stock products', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => { result.current.addToCart(phone, 99); });
    expect(result.current.items[0].quantity).toBe(MAX_QTY);
    let res;
    act(() => { res = result.current.addToCart({ id: 'x', name: 'bad', price: -1 }); });
    expect(res.ok).toBe(false);
    act(() => { res = result.current.addToCart(laptop, 1); }); // out of stock
    expect(res).toEqual({ ok: false, reason: 'out-of-stock' });
    expect(result.current.items).toHaveLength(1);
  });
  it('persists across a remount (page refresh)', () => {
    const first = renderHook(() => useCart(), { wrapper });
    act(() => { first.result.current.addToCart(phone, 2); });
    first.unmount();
    const second = renderHook(() => useCart(), { wrapper });
    expect(second.result.current.totalItems).toBe(2);
  });
  it('survives corrupted storage', () => {
    localStorage.setItem('novatech:guest:cart', '{not json');
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toEqual([]);
    expect(sanitizeCart([{ id: 1 }, null, { id: 'a', name: 'n', price: 5, quantity: 2 }])).toHaveLength(1);
  });
  it('mergeCarts combines quantities', () => {
    expect(mergeCarts([{ id: 'a', quantity: 2 }], [{ id: 'a', quantity: 3 }, { id: 'b', quantity: 1 }])).toEqual([{ id: 'a', quantity: 5 }, { id: 'b', quantity: 1 }]);
  });
});

describe('wishlist', () => {
  it('toggles without duplicates and reports the count', () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });
    act(() => { result.current.addToWishlist(phone); result.current.addToWishlist(phone); });
    expect(result.current.count).toBe(1);
    act(() => { result.current.toggleWishlist(phone); });
    expect(result.current.count).toBe(0);
  });
  it('persists across remounts', () => {
    const a = renderHook(() => useWishlist(), { wrapper });
    act(() => { a.result.current.addToWishlist(phone); });
    a.unmount();
    expect(renderHook(() => useWishlist(), { wrapper }).result.current.count).toBe(1);
  });
});

describe('ProductCard', () => {
  it('renders product info and links to the details route', () => {
    renderWithProviders(<ProductCard product={phone} />);
    expect(screen.getByRole('heading', { name: 'Alpha Phone' })).toBeInTheDocument();
    expect(screen.getByText('₹8,300')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Alpha Phone' })).toHaveAttribute('href', '/products/1');
  });
  it('adds to cart and toggles wishlist from the same global state', async () => {
    const user = userEvent.setup();
    function Counts() { const c = useCart(); const w = useWishlist(); return <p data-testid="counts">{c.totalItems}/{w.count}</p>; }
    renderWithProviders(<><ProductCard product={phone} /><Counts /></>);
    await user.click(screen.getByRole('button', { name: /add alpha phone to cart/i }));
    await user.click(screen.getByRole('button', { name: /save alpha phone to wishlist/i }));
    expect(screen.getByTestId('counts')).toHaveTextContent('1/1');
    expect(screen.getByRole('button', { name: /remove alpha phone from wishlist/i })).toHaveAttribute('aria-pressed', 'true');
  });
  it('disables add-to-cart for out-of-stock products', () => {
    renderWithProviders(<ProductCard product={laptop} />);
    expect(screen.getByRole('button', { name: /out of stock/i })).toBeDisabled();
  });
});
