// Pure validation helpers. Each validator returns an error string, or '' when valid.
// Each form's `validateX(values)` returns an object of { field: message } (empty = valid).

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^(\+91[\s-]?)?[6-9]\d{9}$/;
const PIN_RE = /^[1-9]\d{5}$/;

export const required = (v, label) => (String(v ?? '').trim() ? '' : `${label} is required.`);
export const minLen = (v, n, label) => (String(v ?? '').trim().length >= n ? '' : `${label} must be at least ${n} characters.`);
export const maxLen = (v, n, label) => (String(v ?? '').trim().length <= n ? '' : `${label} must be at most ${n} characters.`);
export const isEmail = (v) => (EMAIL_RE.test(String(v ?? '').trim()) ? '' : 'Enter a valid email address.');
export const isPhone = (v) => (PHONE_RE.test(String(v ?? '').replace(/\s+/g, '')) ? '' : 'Enter a valid 10-digit Indian mobile number.');
export const isPin = (v) => (PIN_RE.test(String(v ?? '').trim()) ? '' : 'Enter a valid 6-digit PIN code.');

const first = (...errs) => errs.find(Boolean) || '';
const clean = (errors) => Object.fromEntries(Object.entries(errors).filter(([, m]) => m));

export function validatePassword(v) {
  const s = String(v ?? '');
  return first(
    required(s, 'Password'),
    s.length >= 8 ? '' : 'Password must be at least 8 characters.',
    s.length <= 64 ? '' : 'Password must be at most 64 characters.',
    /[A-Za-z]/.test(s) && /\d/.test(s) ? '' : 'Password must contain a letter and a number.'
  );
}

export const validateLogin = ({ email, password }) =>
  clean({
    email: first(required(email, 'Email'), isEmail(email)),
    password: required(password, 'Password'),
  });

export const validateRegister = ({ name, email, password, confirmPassword, acceptTerms }) =>
  clean({
    name: first(required(name, 'Full name'), minLen(name, 2, 'Full name'), maxLen(name, 60, 'Full name')),
    email: first(required(email, 'Email'), isEmail(email)),
    password: validatePassword(password),
    confirmPassword: first(required(confirmPassword, 'Confirm password'), password === confirmPassword ? '' : 'Passwords do not match.'),
    acceptTerms: acceptTerms ? '' : 'You must accept the terms to continue.',
  });

export const validateProfile = ({ name, email, phone }) =>
  clean({
    name: first(required(name, 'Full name'), minLen(name, 2, 'Full name'), maxLen(name, 60, 'Full name')),
    email: first(required(email, 'Email'), isEmail(email)),
    phone: phone ? isPhone(phone) : '',
  });

export const validateAddress = ({ name, phone, pin, address, city, state }) =>
  clean({
    name: first(required(name, 'Full name'), minLen(name, 2, 'Full name'), maxLen(name, 60, 'Full name')),
    phone: first(required(phone, 'Phone number'), isPhone(phone)),
    pin: first(required(pin, 'PIN code'), isPin(pin)),
    address: first(required(address, 'Address'), minLen(address, 8, 'Address'), maxLen(address, 200, 'Address')),
    city: first(required(city, 'City'), maxLen(city, 60, 'City')),
    state: first(required(state, 'State'), maxLen(state, 60, 'State')),
  });

export const validateContact = ({ email, message }) =>
  clean({
    email: first(required(email, 'Email'), isEmail(email)),
    message: first(required(message, 'Message'), minLen(message, 10, 'Message'), maxLen(message, 500, 'Message')),
  });

export const validateSeller = ({ business, contact, email, phone, category }) =>
  clean({
    business: first(required(business, 'Business name'), minLen(business, 2, 'Business name'), maxLen(business, 80, 'Business name')),
    contact: first(required(contact, 'Contact name'), minLen(contact, 2, 'Contact name')),
    email: first(required(email, 'Business email'), isEmail(email)),
    phone: first(required(phone, 'Phone number'), isPhone(phone)),
    category: required(category, 'Category'),
  });

export function validateListing({ name, category, price, stock }) {
  const p = Number(price);
  const s = Number(stock);
  return clean({
    name: first(required(name, 'Product name'), minLen(name, 3, 'Product name'), maxLen(name, 100, 'Product name')),
    category: required(category, 'Category'),
    price: first(required(price, 'Price'), Number.isFinite(p) && p > 0 ? '' : 'Price must be a number greater than 0.'),
    stock: first(required(stock, 'Stock'), Number.isInteger(s) && s >= 0 ? '' : 'Stock must be a whole number, 0 or more.'),
  });
}

export const validateNewsletter = ({ email }) => clean({ email: first(required(email, 'Email'), isEmail(email)) });
