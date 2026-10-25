import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import Checkout from '../pages/Checkout.jsx';
import Orders from '../pages/Orders.jsx';
import Account from '../pages/Account.jsx';
import Cart from '../pages/Cart.jsx';
import * as authService from '../services/authService.js';
import { normalizeProduct } from '../services/productService.js';
import { rawProducts } from './fixtures.js';
import { renderWithProviders } from './utils.jsx';

const phone = normalizeProduct(rawProducts[0]);
const Tree = () => (
  <Routes>
    <Route element={<ProtectedRoute />}>
      <Route path="cart" element={<Cart />} />
      <Route path="checkout" element={<Checkout />} />
      <Route path="orders" element={<Orders />} />
      <Route path="account" element={<Account />} />
    </Route>
    <Route path="login" element={<p>LOGIN PAGE</p>} />
  </Routes>
);

async function signedInUserWithCart() {
  const u = await authService.register({ name: 'Asha Rao', email: 'a@example.com', password: 'secret123' });
  localStorage.setItem(`novatech:${u.id}:cart`, JSON.stringify([{ id: phone.id, name: phone.name, price: phone.price, image: '', category: 'Smartphones', quantity: 2 }]));
  return u;
}

describe('checkout flow', () => {
  it('shows the cart page with totals', async () => {
    await signedInUserWithCart();
    renderWithProviders(<Tree />, { route: '/cart' });
    expect(await screen.findByRole('heading', { name: /your cart \(2\)/i })).toBeInTheDocument();
    expect(screen.getAllByText('₹16,600').length).toBeGreaterThan(0);
  });

  it('validates the address, places a demo order, empties the cart and lists it in Orders', async () => {
    const u = await signedInUserWithCart();
    const user = userEvent.setup();
    renderWithProviders(<Tree />, { route: '/checkout' });

    await user.click(await screen.findByRole('button', { name: /confirm & place order/i }));
    expect(await screen.findByText('Phone number is required.')).toBeInTheDocument();
    expect(screen.queryByText('Order Confirmed!')).not.toBeInTheDocument();

    await user.type(screen.getByLabelText('Phone number'), '9876543210');
    await user.type(screen.getByLabelText('Address'), '12 Marine Lines');
    await user.type(screen.getByLabelText('City'), 'Mumbai');
    await user.type(screen.getByLabelText('State'), 'Maharashtra');
    await user.type(screen.getByLabelText('PIN code'), '400001');
    await user.click(screen.getByRole('button', { name: /confirm & place order/i }));

    expect(await screen.findByText('Order Confirmed!')).toBeInTheDocument();
    const orders = JSON.parse(localStorage.getItem(`novatech:${u.id}:orders`));
    expect(orders).toHaveLength(1);
    expect(orders[0].total).toBe(phone.price * 2);
    expect(JSON.parse(localStorage.getItem(`novatech:${u.id}:cart`))).toEqual([]);
    expect(JSON.parse(localStorage.getItem(`novatech:${u.id}:addresses`))).toHaveLength(1);
  });

  it('shows an empty state at checkout when the cart is empty', async () => {
    await authService.register({ name: 'Asha Rao', email: 'a@example.com', password: 'secret123' });
    renderWithProviders(<Tree />, { route: '/checkout' });
    expect(await screen.findByText('Your shopping bag is empty')).toBeInTheDocument();
  });

  it('does not share carts between users', async () => {
    const a = await signedInUserWithCart();
    await authService.logout();
    await authService.register({ name: 'Ben Roy', email: 'b@example.com', password: 'secret123' });
    renderWithProviders(<Tree />, { route: '/cart' });
    expect(await screen.findByText('Your shopping bag is empty')).toBeInTheDocument();
    expect(localStorage.getItem(`novatech:${a.id}:cart`)).toContain('Alpha Phone');
  });

  it('redirects /orders to login when signed out', async () => {
    renderWithProviders(<Tree />, { route: '/orders' });
    expect(await screen.findByText('LOGIN PAGE')).toBeInTheDocument();
  });
});

describe('account & orders pages', () => {
  it('lets the user request a return on an order', async () => {
    const u = await authService.register({ name: 'Asha Rao', email: 'a@example.com', password: 'secret123' });
    localStorage.setItem(`novatech:${u.id}:orders`, JSON.stringify([{ id: 'NT-1', date: '2026-01-01', items: [{ id: '1', name: 'Alpha Phone', price: 100, quantity: 1, image: '' }], total: 100, paymentMethod: 'UPI', status: 'Order Placed', address: 'x', trackingStep: 2, returnRequested: false }]));
    const user = userEvent.setup();
    renderWithProviders(<Tree />, { route: '/orders' });
    await user.click(await screen.findByRole('button', { name: /return \/ replace item/i }));
    expect(await screen.findByText(/return requested — pickup pending/i)).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(`novatech:${u.id}:orders`))[0].returnRequested).toBe(true);
  });

  it('validates and saves the profile', async () => {
    await authService.register({ name: 'Asha Rao', email: 'a@example.com', password: 'secret123' });
    const user = userEvent.setup();
    renderWithProviders(<Tree />, { route: '/account' });
    const name = await screen.findByLabelText('Full name');
    await user.clear(name);
    await user.click(screen.getByRole('button', { name: /save profile changes/i }));
    expect(await screen.findByText('Full name is required.')).toBeInTheDocument();
    await user.type(name, 'Asha R');
    await user.click(screen.getByRole('button', { name: /save profile changes/i }));
    await waitFor(async () => expect((await authService.getCurrentUser()).name).toBe('Asha R'));
  });
});
