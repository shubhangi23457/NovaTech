/**
 * MOCK AUTHENTICATION SERVICE — FOR DEMONSTRATION ONLY.
 *
 * There is no backend in this project, so accounts live in the browser's localStorage.
 * This is NOT secure production authentication:
 *  - anyone with access to the browser can read/modify the stored data,
 *  - the "session token" is not verified by any server,
 *  - client-side route protection is only a UI convenience.
 *
 * What it does do properly: passwords are never stored in plain text. They are salted and
 * hashed with PBKDF2-SHA256 (Web Crypto) before being saved.
 *
 * To use a real backend, keep these function signatures (register, login, logout,
 * getCurrentUser, updateProfile) and replace the bodies with fetch() calls to your API.
 */
import { storage } from '../utils/storage.js';

const USERS_KEY = 'novatech-users';
const SESSION_KEY = 'novatech-session';
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;
const ITERATIONS = 100_000;

export class AuthError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'AuthError';
    this.field = field;
  }
}

const delayMs = import.meta.env?.MODE === 'test' ? 0 : Number(import.meta.env?.VITE_MOCK_AUTH_DELAY ?? 500);
const wait = () => new Promise((r) => setTimeout(r, delayMs));

const toHex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const fromHex = (hex) => new Uint8Array((hex.match(/.{2}/g) || []).map((h) => parseInt(h, 16)));
const randomHex = (bytes) => toHex(crypto.getRandomValues(new Uint8Array(bytes)));

async function hashPassword(password, saltHex) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: fromHex(saltHex), iterations: ITERATIONS }, key, 256);
  return toHex(bits);
}

const readUsers = () => {
  const users = storage.get(USERS_KEY, []);
  return Array.isArray(users) ? users.filter((u) => u && u.id && u.email && u.hash && u.salt) : [];
};
const writeUsers = (users) => storage.set(USERS_KEY, users);
const normEmail = (e) => String(e || '').trim().toLowerCase();
const publicUser = ({ id, name, email, phone, createdAt }) => ({ id, name, email, phone: phone || '', createdAt });

function startSession(userId) {
  storage.set(SESSION_KEY, { userId, token: randomHex(16), expiresAt: Date.now() + SESSION_MS });
}

export async function register({ name, email, password }) {
  await wait();
  const users = readUsers();
  const e = normEmail(email);
  if (users.some((u) => u.email === e)) throw new AuthError('An account with this email already exists.', 'email');
  const salt = randomHex(16);
  const user = {
    id: `u_${randomHex(6)}`,
    name: String(name).trim(),
    email: e,
    phone: '',
    salt,
    hash: await hashPassword(password, salt),
    createdAt: new Date().toISOString(),
  };
  writeUsers([...users, user]);
  startSession(user.id);
  return publicUser(user);
}

export async function login({ email, password }) {
  await wait();
  const user = readUsers().find((u) => u.email === normEmail(email));
  // Same message for unknown email and wrong password (don't reveal which accounts exist).
  const invalid = new AuthError('Invalid email or password.');
  if (!user) throw invalid;
  if ((await hashPassword(password, user.salt)) !== user.hash) throw invalid;
  startSession(user.id);
  return publicUser(user);
}

export async function logout() {
  storage.remove(SESSION_KEY);
}

export async function getCurrentUser() {
  const session = storage.get(SESSION_KEY, null);
  if (!session || !session.userId || !(session.expiresAt > Date.now())) {
    if (session) storage.remove(SESSION_KEY);
    return null;
  }
  const user = readUsers().find((u) => u.id === session.userId);
  if (!user) { storage.remove(SESSION_KEY); return null; }
  return publicUser(user);
}

export async function updateProfile(userId, { name, email, phone }) {
  await wait();
  const users = readUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) throw new AuthError('Account not found. Please sign in again.');
  const e = normEmail(email);
  if (users.some((u) => u.email === e && u.id !== userId)) throw new AuthError('That email is used by another account.', 'email');
  users[idx] = { ...users[idx], name: String(name).trim(), email: e, phone: String(phone || '').trim() };
  writeUsers(users);
  return publicUser(users[idx]);
}
