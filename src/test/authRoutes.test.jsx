import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import PublicOnlyRoute from '../components/PublicOnlyRoute.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import * as authService from '../services/authService.js';
import { renderWithProviders } from './utils.jsx';

const Tree = () => (
  <Routes>
    <Route path="/" element={<p>HOME</p>} />
    <Route element={<PublicOnlyRoute />}>
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
    </Route>
    <Route element={<ProtectedRoute />}><Route path="account" element={<p>SECRET ACCOUNT</p>} /></Route>
  </Routes>
);

describe('authService', () => {
  it('registers, never stores the plain password, logs in and out', async () => {
    const user = await authService.register({ name: 'Asha Rao', email: 'Asha@Example.com', password: 'secret123' });
    expect(user.email).toBe('asha@example.com');
    expect(localStorage.getItem('novatech-users')).not.toContain('secret123');
    await authService.logout();
    expect(await authService.getCurrentUser()).toBeNull();
    await expect(authService.login({ email: 'asha@example.com', password: 'wrong-pass1' })).rejects.toThrow('Invalid email or password.');
    expect((await authService.login({ email: 'asha@example.com', password: 'secret123' })).name).toBe('Asha Rao');
    expect((await authService.getCurrentUser()).email).toBe('asha@example.com');
  });
  it('rejects duplicate emails', async () => {
    await authService.register({ name: 'A B', email: 'dup@example.com', password: 'secret123' });
    await expect(authService.register({ name: 'A B', email: 'DUP@example.com', password: 'secret123' })).rejects.toMatchObject({ field: 'email' });
  });
});

describe('protected routes', () => {
  it('redirects signed-out visitors to /login', async () => {
    renderWithProviders(<Tree />, { route: '/account' });
    expect(await screen.findByRole('heading', { name: /sign in to novatech/i })).toBeInTheDocument();
    expect(screen.queryByText('SECRET ACCOUNT')).not.toBeInTheDocument();
    expect(screen.getByText(/continue to/i)).toHaveTextContent('/account');
  });
  it('lets a signed-in user through, and keeps them off /login', async () => {
    await authService.register({ name: 'Asha Rao', email: 'a@example.com', password: 'secret123' });
    renderWithProviders(<Tree />, { route: '/account' });
    expect(await screen.findByText('SECRET ACCOUNT')).toBeInTheDocument();
  });
  it('sends an already signed-in user away from /login', async () => {
    await authService.register({ name: 'Asha Rao', email: 'a@example.com', password: 'secret123' });
    renderWithProviders(<Tree />, { route: '/login' });
    expect(await screen.findByText('HOME')).toBeInTheDocument();
  });
});

describe('login form', () => {
  it('shows field errors and does not submit invalid data', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Tree />, { route: '/login' });
    await user.click(await screen.findByRole('button', { name: /^sign in$/i }));
    expect(await screen.findByText('Email is required.')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Email')).toHaveAccessibleDescription('Email is required.');
  });
  it('shows an invalid-credentials message', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Tree />, { route: '/login' });
    await user.type(await screen.findByLabelText('Email'), 'nobody@example.com');
    await user.type(screen.getByLabelText('Password'), 'whatever123');
    await user.click(screen.getByRole('button', { name: /^sign in$/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password.');
  });
  it('logs in with valid credentials and redirects', async () => {
    await authService.register({ name: 'Asha Rao', email: 'a@example.com', password: 'secret123' });
    await authService.logout();
    const user = userEvent.setup();
    renderWithProviders(<Tree />, { route: '/login' });
    await user.type(await screen.findByLabelText('Email'), 'a@example.com');
    await user.type(screen.getByLabelText('Password'), 'secret123');
    await user.click(screen.getByRole('button', { name: /^sign in$/i }));
    await waitFor(() => expect(screen.getByText('HOME')).toBeInTheDocument());
  });
});

describe('register form', () => {
  it('flags mismatched passwords and missing terms', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Tree />, { route: '/register' });
    await user.type(await screen.findByLabelText('Full name'), 'Asha Rao');
    await user.type(screen.getByLabelText('Email'), 'a@example.com');
    await user.type(screen.getByLabelText('Password'), 'secret123');
    await user.type(screen.getByLabelText('Confirm password'), 'secret124');
    await user.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument();
    expect(screen.getByText('You must accept the terms to continue.')).toBeInTheDocument();
  });
});
