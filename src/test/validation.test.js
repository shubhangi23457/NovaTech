import { describe, expect, it } from 'vitest';
import { validateAddress, validateListing, validateLogin, validateRegister } from '../utils/validation.js';

const good = { name: 'Asha Rao', email: 'asha@example.com', password: 'secret123', confirmPassword: 'secret123', acceptTerms: true };

describe('registration', () => {
  it('accepts valid input', () => expect(validateRegister(good)).toEqual({}));
  it('requires every field', () => {
    const e = validateRegister({ name: '', email: '', password: '', confirmPassword: '', acceptTerms: false });
    expect(Object.keys(e).sort()).toEqual(['acceptTerms', 'confirmPassword', 'email', 'name', 'password']);
  });
  it('checks email format, password strength and confirmation', () => {
    expect(validateRegister({ ...good, email: 'nope' }).email).toMatch(/valid email/i);
    expect(validateRegister({ ...good, password: 'short1', confirmPassword: 'short1' }).password).toMatch(/at least 8/);
    expect(validateRegister({ ...good, password: 'onlyletters', confirmPassword: 'onlyletters' }).password).toMatch(/letter and a number/);
    expect(validateRegister({ ...good, confirmPassword: 'different1' }).confirmPassword).toMatch(/do not match/i);
  });
});

describe('login', () => {
  it('validates email and password presence', () => {
    expect(validateLogin({ email: '', password: '' })).toHaveProperty('email');
    expect(validateLogin({ email: 'a@b.co', password: '' })).toHaveProperty('password');
    expect(validateLogin({ email: 'a@b.co', password: 'x' })).toEqual({});
  });
});

describe('address (checkout)', () => {
  const addr = { name: 'Asha', phone: '9876543210', pin: '400001', address: '12 Marine Lines', city: 'Mumbai', state: 'Maharashtra' };
  it('accepts a valid address', () => expect(validateAddress(addr)).toEqual({}));
  it('rejects bad phone and PIN', () => {
    expect(validateAddress({ ...addr, phone: '12345' })).toHaveProperty('phone');
    expect(validateAddress({ ...addr, pin: '0123' })).toHaveProperty('pin');
  });
});

describe('seller listing', () => {
  const ok = { name: 'Widget', category: 'Tablets', price: '10.5', stock: '0' };
  it('allows zero stock but not negative or fractional', () => {
    expect(validateListing(ok)).toEqual({});
    expect(validateListing({ ...ok, stock: '-1' })).toHaveProperty('stock');
    expect(validateListing({ ...ok, stock: '1.5' })).toHaveProperty('stock');
  });
  it('requires a positive price', () => {
    expect(validateListing({ ...ok, price: '0' })).toHaveProperty('price');
    expect(validateListing({ ...ok, price: 'abc' })).toHaveProperty('price');
  });
});
